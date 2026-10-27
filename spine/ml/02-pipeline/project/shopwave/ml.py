"""Recommendations: what each customer would rate highly, learned from the
stars they have already given."""
from pyspark.ml import Pipeline
from pyspark.ml.feature import SQLTransformer
from pyspark.ml.recommendation import ALS
from pyspark.sql import DataFrame, SparkSession

from shopwave import schemas


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
