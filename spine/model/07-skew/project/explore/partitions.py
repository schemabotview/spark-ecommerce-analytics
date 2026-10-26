"""How many tasks a shuffle gets, and how many files a write makes."""
import os

from pyspark.sql import functions as F

from shopwave import metrics
from shopwave.session import spark_session

spark = spark_session()
spark.conf.set("spark.sql.adaptive.enabled", False)  # Spark as it was, unhelped
sales = spark.read.parquet("lake/gold/fact_sales")
by_day = lambda: sales.groupBy("order_date").agg(F.sum("revenue").alias("r"))

for n in [200, 8]:
    spark.conf.set("spark.sql.shuffle.partitions", n)
    daily = by_day()  # a DataFrame keeps the plan it first made: build anew
    days, stages = metrics.run(spark, f"p{n}", lambda: daily.collect())
    reduce = stages[-1]
    rows = metrics.task_records(spark, reduce)
    busy = sum(1 for r in rows if r)
    print(f"shuffle.partitions={n:3}: {len(days)} days · "
          f"{reduce.numCompleteTasks():3} tasks, {busy:3} with any rows")

for name, df in [("coalesce(1)", daily.coalesce(1)),
                 ("repartition(4)", daily.repartition(4))]:
    df.write.mode("overwrite").parquet(f"out/{name}")
    files = [f for f in os.listdir(f"out/{name}") if f.startswith("part-")]
    print(f"{name:15} → {len(files)} file(s)")
