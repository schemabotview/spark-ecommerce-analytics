"""Rebuild gold.fact_sales in place, and let the job fail halfway."""
from pyspark.errors import PySparkException
from pyspark.sql import functions as F

from shopwave import gold
from shopwave.session import spark_session

spark = spark_session()
path = "lake/gold/fact_sales"
print("before:", spark.read.parquet(path).count(), "rows")

silver = {t: spark.read.parquet(f"lake/silver/{t}")
          for t in ["orders", "order_items"]}
sales = gold.fact_sales(silver["orders"], silver["order_items"])
# A bug that only shows up in December's data, like most real ones do:
broken = sales.withColumn("revenue", F.when(
    F.col("order_date") >= "2026-12-01", F.raise_error(F.lit("bad row")))
    .otherwise(F.col("revenue")))
try:
    broken.write.mode("overwrite").parquet(path)
except PySparkException as e:
    print("the job failed:", e.getCondition())

try:
    print("after:", spark.read.parquet(path).count(), "rows")
except PySparkException as e:
    print("after:", e.getCondition())
