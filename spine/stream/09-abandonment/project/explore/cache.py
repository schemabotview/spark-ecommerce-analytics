"""Three questions about the same year: read it three times, or once."""
import time

from pyspark.sql import functions as F

from shopwave import scale
from shopwave.session import spark_session

spark = spark_session()
store = spark.sparkContext._jsc.sc().statusStore()
questions = {
    "revenue": lambda s: s.agg(F.sum("revenue")).collect(),
    "by country": lambda s: s.groupBy("country").count().collect(),
    "qty > 2": lambda s: s.filter(F.col("qty") > 2).count(),
}

print("seconds    " + "".join(f"{q:>12}" for q in questions))
for cached in [False, True]:
    sales = scale.year_sales(spark)
    if cached:
        sales = sales.cache()  # kept in memory by the first action
    took = []
    for ask in questions.values():
        start = time.perf_counter()
        ask(sales)
        took.append(time.perf_counter() - start)
    print(f"cache {'on ' if cached else 'off'}  "
          + "".join(f"{t:12.1f}" for t in took))
rdd = store.rddList(True).apply(0)
print(f"cached: {rdd.numCachedPartitions()} partitions · "
      f"{rdd.memoryUsed() / 2**20:.0f} MB in memory · "
      f"{rdd.diskUsed() / 2**20:.0f} MB on disk")
