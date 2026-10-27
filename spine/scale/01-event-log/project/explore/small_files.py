"""A table fed a little at a time: many small files, then OPTIMIZE."""
from delta.tables import DeltaTable
from pyspark.sql import functions as F

from shopwave.session import spark_session

spark = spark_session()
path = "out/daily_sales"
spark.conf.set("spark.databricks.delta.retentionDurationCheck.enabled", False)
sales = spark.read.format("delta").load("lake/gold/fact_sales")
december = sales.filter(F.month("order_date") == 12).cache()
for day in range(1, 32):  # one append per day, as a nightly job does
    one = december.filter(F.dayofmonth("order_date") == day)
    one.write.format("delta").mode("append").save(path)

table = DeltaTable.forPath(spark, path)
files = lambda: table.detail().first().numFiles
print("after 31 nightly appends:", files(), "files")
result = table.optimize().executeCompaction().first().metrics
print(f"OPTIMIZE: {result.numFilesRemoved} files → {result.numFilesAdded}")
print("files now in the table:", files())
removed = table.vacuum(0)  # files no version needs any more: deleted
print("VACUUM: rows still", spark.read.format("delta").load(path).count())
