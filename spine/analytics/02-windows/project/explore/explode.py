"""One event, many items: explode makes each element of a list a row."""
from pyspark.sql import functions as F

from shopwave import schemas
from shopwave.session import spark_session

spark = spark_session()
day = "data/raw/clickstream/2026-10-01/"
clicks = spark.read.json(day, schema=schemas.CLICKS)

items = clicks.select("event_id", "event_type",
                      F.explode("items").alias("item"))
every = clicks.select("event_id", "event_type",
                      F.explode_outer("items").alias("item"))
with_items = clicks.filter(F.size("items") > 0).count()
print("events:", clicks.count(), "· with items:", with_items)
print("explode:", items.count(), "rows · explode_outer:", every.count(), "rows")

purchases = items.filter(F.col("event_type") == "purchase")
purchases.select(
    "event_id", "item.product_id", "item.qty", "item.price"
).orderBy("event_id", "product_id").show(4, truncate=8)
