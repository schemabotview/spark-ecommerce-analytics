"""A week of the change feed, merged into gold/orders: first as it comes."""
from pyspark.errors import PySparkException
from pyspark.sql import functions as F

from shopwave import lake
from shopwave.session import spark_session

spark = spark_session()
feed = lake.changes(spark, "2026-12-0[1-7]")
twice = feed.groupBy("order_id").count().filter(F.col("count") > 1).count()
print("feed:", feed.count(), "changes ·", twice, "orders changed twice")
try:
    lake.apply_changes(spark, feed)
except PySparkException as e:
    print("MERGE as it comes:", e.getCondition())
status = lambda: dict(sorted(spark.read.format("delta").load(lake.ORDERS)
                             .groupBy("status").count().collect()))
print("status before:", status())
m = lake.apply_changes(spark, lake.latest(feed))
print(f"MERGE latest per order: {m['numTargetRowsUpdated']} orders updated")
print("status after: ", status())
