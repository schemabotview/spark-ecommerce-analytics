"""A 7-day moving average: a window frame that slides over the days."""
import os

from pyspark.sql import Window
from pyspark.sql import functions as F

from shopwave import analytics
from shopwave.session import spark_session

spark = spark_session()
kpis = analytics.daily_kpis(spark.read.parquet("lake/gold/fact_sales"))
smooth = analytics.moving_average(kpis)
os.makedirs("out", exist_ok=True)
smooth.toPandas().to_csv("out/moving_average.csv", index=False)

# rows vs range: the same 7 when every day has sales; not when one is missing
gap = kpis.filter(F.col("order_date") != "2026-11-26")
by_rows = Window.orderBy("order_date").rowsBetween(-6, 0)
rows7 = gap.withColumn("gmv_avg", F.round(F.avg("gmv").over(by_rows), 2))
range7 = analytics.moving_average(gap)
day = F.col("order_date").between("2026-11-25", "2026-11-28")
print("Black Friday week, with 26 November missing:")
for r, g in zip(rows7.filter(day).collect(), range7.filter(day).collect()):
    print(f"  {r.order_date}  gmv {r.gmv:>9}  rows: {r.gmv_avg:>9}  "
          f"range: {g.gmv_avg:>9}")
