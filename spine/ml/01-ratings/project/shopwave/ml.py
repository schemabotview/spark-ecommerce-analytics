"""Recommendations: what each customer would rate highly, learned from the
stars they have already given."""
from pyspark.sql import DataFrame, SparkSession

from shopwave import schemas


def ratings(spark: SparkSession) -> DataFrame:
    """Every review: a customer, a product, 1 to 5 stars, and when."""
    return spark.read.csv("data/raw/reviews/", header=True,
                          schema=schemas.REVIEWS)
