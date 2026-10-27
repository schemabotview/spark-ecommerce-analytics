"""Recommendations: what each customer would rate highly, learned from the
stars they have already given."""
from pyspark.ml import Pipeline
from pyspark.ml.feature import SQLTransformer
from pyspark.ml.recommendation import ALS
from pyspark.sql import DataFrame, SparkSession
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


def recommend(model, n: int = 5) -> DataFrame:
    """Every customer's n best-scoring products, one row each, ranked."""
    best = model.stages[-1].recommendForAllUsers(n)
    return best.select("customer_id", F.posexplode("recommendations")).select(
        "customer_id", (F.col("pos") + 1).alias("rank"), "col.product_id",
        F.round("col.rating", 2).alias("score"))


def main() -> None:
    """Fit on every rating so far, score every customer, write gold."""
    spark = spark_session()
    model = pipeline().fit(ratings(spark))
    top = recommend(model)
    top.write.format("delta").mode("overwrite").save(TOP)
    print(f"gold/recommendations: {top.count()} rows, "
          f"{top.select('customer_id').distinct().count()} customers")


if __name__ == "__main__":
    main()
