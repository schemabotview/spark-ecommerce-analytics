"""RFM: every customer scored on recency, frequency and money, then named."""
from pyspark.sql import functions as F

from shopwave import analytics
from shopwave.session import spark_session

spark = spark_session()
scored = analytics.rfm(spark.read.parquet("lake/gold/fact_sales")).cache()
print("customers scored:", scored.count())
segments = scored.groupBy("segment").agg(
    F.count("*").alias("customers"), F.round(F.avg("frequency"), 1).alias("f"),
    F.round(F.avg("recency")).alias("r"), F.round(F.sum("monetary")).alias("m"))
for s in segments.orderBy(F.desc("m")).collect():
    print(f"{s.segment:11} {s.customers:5} customers · {s.f:4} orders · "
          f"last {s.r:4.0f} days ago · € {s.m:>9,.0f}")
