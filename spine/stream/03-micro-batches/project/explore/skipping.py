"""Delta keeps min/max per file: a query for one day skips the others."""
from delta.tables import DeltaTable
from pyspark.sql import functions as F

from shopwave import scale
from shopwave.session import spark_session

spark = spark_session()
path = "out/sales"
sales = scale.year_sales(spark)
# ~4 files a month, each holding a run of days: the stats then mean something
(sales.repartitionByRange(48, "order_date").write.format("delta")
 .mode("overwrite").save(path))

day = spark.read.format("delta").load(path).filter(
    F.col("order_date") == "2026-11-27")
print("Black Friday lines:", day.count())
scan = day._jdf.queryExecution().executedPlan().collectLeaves().apply(0)
read = scan.metrics().apply("numFiles").value()
total = DeltaTable.forPath(spark, path).detail().first().numFiles
print(f"files read: {read} of {total} · skipped by min/max: {total - read}")
