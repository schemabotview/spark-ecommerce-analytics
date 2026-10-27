"""Rebuild gold.fact_sales in place, and let the job fail halfway: Delta."""
from py4j.protocol import Py4JJavaError
from pyspark.sql import functions as F

from shopwave import gold
from shopwave.session import spark_session

spark = spark_session()
path = "lake/gold/fact_sales"
read = lambda: spark.read.format("delta").load(path)
print("before:", read().count(), "rows")

silver = {t: spark.read.parquet(f"lake/silver/{t}")
          for t in ["orders", "order_items"]}
sales = gold.fact_sales(silver["orders"], silver["order_items"])
# A bug that only shows up in December's data, like most real ones do:
broken = sales.withColumn("revenue", F.when(
    F.col("order_date") >= "2026-12-01", F.raise_error(F.lit("bad row")))
    .otherwise(F.col("revenue")))
try:
    broken.write.format("delta").mode("overwrite").save(path)
except Py4JJavaError as e:  # Delta's writer raises the JVM's error as it is
    print("the job failed:", e.java_exception.getCondition())

print("after:", read().count(), "rows")
history = spark.sql(f"DESCRIBE HISTORY delta.`{path}`")
for h in history.orderBy("version").collect():
    print(f"  version {h.version}: {h.operation}")
