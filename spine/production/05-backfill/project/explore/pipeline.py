"""Fit the pipeline on every rating, and look at what came out."""
from pyspark.sql import functions as F

from shopwave import ml
from shopwave.session import spark_session

spark = spark_session()
ratings = ml.ratings(spark)
model = ml.pipeline().fit(ratings)  # a PipelineModel: every stage fitted
print("stages:", " → ".join(type(s).__name__ for s in model.stages))
als = model.stages[-1]
print(f"rank {als.rank}: {als.userFactors.count()} customer vectors, "
      f"{als.itemFactors.count()} product vectors")
guesses = model.transform(ratings).select(
    "customer_id", "product_id", "rating",
    F.round("prediction", 2).alias("prediction"))
guesses.orderBy("customer_id", "product_id").show(4)
