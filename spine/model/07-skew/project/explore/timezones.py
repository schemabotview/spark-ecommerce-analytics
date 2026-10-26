"""One order, two clocks: on which day was it placed?"""
from pyspark.sql import functions as F

from shopwave import silver
from shopwave.session import spark_session

spark = spark_session()
orders = silver.orders(spark.read.parquet("lake/bronze/orders"))
moved = orders.filter(F.col("order_date") != F.col("local_date"))
print("orders:", orders.count(), "· on another day locally:", moved.count())

by_country = moved.groupBy("country").count()
for row in by_country.orderBy(F.desc("count"), "country").limit(3).collect():
    print(f"  {row.country}: {row['count']}")
for country in ["DE", "IN", "US"]:
    o = moved.filter(F.col("country") == country).orderBy("order_id").first()
    zone = silver.TIMEZONES[country]
    local = F.from_utc_timestamp(F.lit(o.order_ts), zone).cast("string")
    shown = spark.range(1).select(local).first()[0]
    print(f"{country} {o.order_id}: {o.order_ts} UTC = {shown} {zone}")
