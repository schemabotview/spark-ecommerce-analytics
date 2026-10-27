"""Which campaign brought each sale? Last touch, inside the visit."""
from pyspark.sql import functions as F

from shopwave import analytics
from shopwave.session import spark_session

spark = spark_session()
clicks = spark.read.parquet("lake/silver/clicks").filter(
    F.col("event_date").between("2026-10-01", "2026-10-31"))
campaigns = spark.read.parquet("lake/silver/campaigns")
print("campaigns:", ", ".join(f"{c.campaign_id} ({c.start:%m-%d}→{c.end:%m-%d})"
                              for c in campaigns.orderBy("start").collect()))
credited = analytics.attribution(analytics.sessions(clicks), campaigns)
by = credited.groupBy("campaign", "channel").agg(
    F.count("*").alias("sales"), F.sum("revenue").alias("revenue"))
for r in by.orderBy(F.desc("revenue")).collect():
    print(f"{r.campaign:13} {r.channel:8} {r.sales:4} sales  € {r.revenue:>9}")
