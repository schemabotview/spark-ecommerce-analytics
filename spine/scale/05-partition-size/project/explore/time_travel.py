"""A bad load, found the next morning: read the table as it was, restore it."""
from delta.tables import DeltaTable
from pyspark.sql import functions as F

from shopwave import lake
from shopwave.session import spark_session

spark = spark_session()
orders = DeltaTable.forPath(spark, lake.ORDERS)
read = lambda **v: spark.read.format("delta").options(**v).load(lake.ORDERS)
print("today:", read().count(), "orders")

# The bug: a day's load written with mode "overwrite" instead of "append"
one_day = read().filter(F.col("order_date") == "2026-12-31")
one_day.cache().count()
one_day.write.format("delta").mode("overwrite").save(lake.ORDERS)
print("after the bad load:", read().count(), "orders")

for h in orders.history().orderBy("version").collect():
    print(f"  version {h.version}: {h.operation:7} "
          f"{h.operationParameters.get('mode', '')}")
before = orders.history().agg(F.max("version")).first()[0] - 1
print(f"version {before}, read as it was:", read(versionAsOf=before).count())
orders.restoreToVersion(before)
print("restored:", read().count(), "orders, as version",
      orders.history(1).first().version)
