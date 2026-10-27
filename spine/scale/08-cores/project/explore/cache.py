"""Three questions about the same year: read it three times, or once."""
from pyspark.sql import functions as F

from shopwave import metrics, scale
from shopwave.session import spark_session

spark = spark_session()
store = spark.sparkContext._jsc.sc().statusStore()


def three_questions(sales):
    sales.agg(F.sum("revenue")).collect()
    sales.groupBy("country").count().collect()
    sales.filter(F.col("qty") > 2).count()


for cached in [False, True]:
    sales = scale.year_sales(spark)
    if cached:
        sales = sales.cache()  # kept in memory by the first action
    _, stages = metrics.run(spark, f"cache-{cached}",
                            lambda: three_questions(sales))
    read = sum(s.inputBytes() for s in stages)
    print(f"cache {'on ' if cached else 'off'}: {len(stages):2} stages ran · "
          f"read {read / 2**20:5.0f} MB from files")
rdd = store.rddList(True).apply(0)
print(f"cached: {rdd.numCachedPartitions()} partitions · "
      f"{rdd.memoryUsed() / 2**20:.0f} MB in memory · "
      f"{rdd.diskUsed() / 2**20:.0f} MB on disk")
