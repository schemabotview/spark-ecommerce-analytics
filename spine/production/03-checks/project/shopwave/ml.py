"""Recommendations: what each customer would rate highly, learned from the
stars they have already given."""
from pyspark.ml import Pipeline, PipelineModel
from pyspark.ml.feature import SQLTransformer
from pyspark.ml.recommendation import ALS
from pyspark.sql import DataFrame, SparkSession, Window
from pyspark.sql import functions as F

from shopwave import schemas
from shopwave.session import spark_session

TOP = "lake/gold/recommendations"  # each customer's best guesses


def ratings(spark: SparkSession) -> DataFrame:
    """Every review: a customer, a product, 1 to 5 stars, and when."""
    return spark.read.csv("data/raw/reviews/", header=True,
                          schema=schemas.REVIEWS)


def pipeline(rank: int = 8) -> Pipeline:
    """Ratings in, a model out: the columns ALS wants, then ALS itself."""
    columns = SQLTransformer(statement="SELECT customer_id, product_id, "
                             "CAST(rating AS FLOAT) AS rating FROM __THIS__")
    als = ALS(userCol="customer_id", itemCol="product_id",
              ratingCol="rating", rank=rank, maxIter=10, regParam=0.1,
              seed=2026,  # the factors start random: fix where
              coldStartStrategy="drop")  # no guess for someone unseen
    return Pipeline(stages=[columns, als])


def split(ratings: DataFrame, day: str) -> tuple[DataFrame, DataFrame]:
    """Train on what was known before `day`, test on what came after: the
    way the model will be used."""
    before = F.col("reviewed_at") < F.lit(day).cast("timestamp")
    return ratings.filter(before), ratings.filter(~before)


def fit(ratings: DataFrame) -> tuple[DataFrame, PipelineModel]:
    """ALS on what each product's average misses. Alone, ALS has no notion
    of a good product or a generous customer: the average carries that, and
    ALS learns each customer's taste on top of it."""
    base = ratings.groupBy("product_id").agg(F.avg("rating").alias("base"))
    left = ratings.join(base, "product_id").withColumn(
        "rating", F.col("rating") - F.col("base"))
    return base, pipeline().fit(left)


def predict(base: DataFrame, model: PipelineModel,
            pairs: DataFrame) -> DataFrame:
    """Stars for (customer_id, product_id) pairs: the average + ALS. The
    fitted ALS stage alone scores them: it needs only the two ids."""
    guess = model.stages[-1].transform(pairs.join(base, "product_id"))
    return guess.withColumn("prediction",
                            F.col("base") + F.col("prediction"))


def recommend(base: DataFrame, model: PipelineModel, customers: DataFrame,
              n: int = 5) -> DataFrame:
    """Every customer's n best-scoring products, one row each, ranked."""
    pairs = customers.select("customer_id").distinct().crossJoin(
        base.select("product_id"))
    best = Window.partitionBy("customer_id").orderBy(F.desc("prediction"))
    scored = predict(base, model, pairs).withColumn(
        "rank", F.row_number().over(best))
    return scored.filter(F.col("rank") <= n).select(
        "customer_id", "rank", "product_id",
        F.round("prediction", 2).alias("score"))


def main() -> None:
    """Fit on every rating so far, score every customer, write gold."""
    spark = spark_session()
    every = ratings(spark)
    top = recommend(*fit(every), every)
    top.write.format("delta").mode("overwrite").save(TOP)
    print(f"gold/recommendations: {top.count()} rows, "
          f"{top.select('customer_id').distinct().count()} customers")


if __name__ == "__main__":
    main()
