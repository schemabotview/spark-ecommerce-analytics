"""How wrong is the model, in stars, on reviews it has not seen?"""
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.sql import functions as F

from shopwave import ml
from shopwave.session import spark_session

spark = spark_session()
ratings = ml.ratings(spark)
train, test = ml.split(ratings, "2026-10-01")
print(f"train: {train.count()} ratings before October · "
      f"test: {test.count()} after")
rmse = RegressionEvaluator(metricName="rmse", labelCol="rating")

mean = train.agg(F.avg("rating")).first()[0]
product = train.groupBy("product_id").agg(F.avg("rating").alias("prediction"))
random_train, random_test = ratings.randomSplit([0.75, 0.25], seed=2026)
errors = {
    "everyone gets the average": test.withColumn("prediction", F.lit(mean)),
    "the product's average": test.join(product, "product_id"),
    "ALS, split by time": ml.pipeline().fit(train).transform(test),
    "ALS, split at random": ml.pipeline().fit(random_train)
                              .transform(random_test),
}
print("RMSE, in stars (lower is better):")
for name, guesses in errors.items():
    print(f"  {name:26} {rmse.evaluate(guesses):.3f}")
