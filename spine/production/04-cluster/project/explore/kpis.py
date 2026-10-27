"""A year of Shopwave in three numbers per day: orders, GMV, AOV."""
import os

from pyspark.sql import functions as F

from shopwave import analytics
from shopwave.session import spark_session

spark = spark_session()
kpis = analytics.daily_kpis(spark.read.parquet("lake/gold/fact_sales"))
os.makedirs("out", exist_ok=True)
kpis.toPandas().to_csv("out/daily_kpis.csv", index=False)  # for the chart

year = kpis.agg(F.sum("orders").alias("orders"), F.sum("gmv").alias("gmv"),
                F.count("*").alias("days")).first()
print(f"{year.days} days · {year.orders} paid orders · GMV € {year.gmv}")
print(f"average order value: € {year.gmv / year.orders:.2f}")
print("median day:", kpis.agg(F.median("gmv")).first()[0], "€")
for row in kpis.orderBy(F.desc("gmv")).limit(3).collect():
    print(f"  {row.order_date}: {row.orders:4} orders · € {row.gmv}")
