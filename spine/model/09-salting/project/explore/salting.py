"""Salting: split the hot key by hand, when AQE cannot."""
from statistics import median

from pyspark.sql import functions as F

from shopwave import metrics
from shopwave.session import spark_session

SALTS = 8
spark = spark_session()
spark.conf.set("spark.sql.adaptive.enabled", False)  # e.g. a full outer join
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", -1)
sales = spark.read.parquet("lake/gold/fact_sales")
products = spark.read.parquet("lake/gold/dim_product")

# Each sale gets a salt 0-7 (from its own id: the same every run), and each
# product is copied 8 times, once per salt: the hot key becomes 8 keys.
salted = sales.withColumn("salt", F.abs(F.hash("order_id", "line")) % SALTS)
copies = products.crossJoin(spark.range(SALTS).withColumnRenamed("id", "salt"))
plans = {"plain": sales.join(products, "product_id"),
         "salted": salted.join(copies, ["product_id", "salt"])}
for name, joined in plans.items():
    write = joined.write.format("noop").mode("overwrite")  # every column
    _, stages = metrics.run(spark, name, write.save)
    join = max(stages, key=lambda s: s.shuffleReadRecords())  # the join
    rows = [r for r in metrics.task_records(spark, join) if r]
    print(f"{name:6}: {len(rows):3} busy tasks · largest "
          f"{max(rows):4} rows · median {median(rows):4.0f}")
