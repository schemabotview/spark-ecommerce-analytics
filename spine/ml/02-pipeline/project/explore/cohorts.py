"""Cohort retention: do the customers of January come back?"""
from pyspark.sql import functions as F

from shopwave import analytics
from shopwave.session import spark_session

spark = spark_session()
sales = spark.read.parquet("lake/gold/fact_sales")
table = analytics.cohorts(sales).cache()
sizes = sales.filter(analytics.PAID).groupBy("customer_id").agg(
    F.min(F.trunc("order_date", "month")).alias("cohort")).groupBy(
    "cohort").count()
size = dict(sizes.collect())

print("cohort   size  " + "  ".join(f"m{a}" for a in range(1, 7)))
for row in table.limit(6).collect():
    shares = "".join(f"{row[f'm{a}'] or 0:4.0%}" for a in range(1, 7))
    print(f"{row.cohort:%Y-%m}  {size[row.cohort]:4}  {shares}")
