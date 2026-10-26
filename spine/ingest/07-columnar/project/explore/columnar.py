"""Lab: rows or columns. A year of orders as CSV and as Parquet, and what
one query reads of each."""

import os

from pyspark.sql import functions as F

from shopwave.schemas import ORDERS
from shopwave.session import spark_session

spark = spark_session()
sc = spark.sparkContext
store = sc._jsc.sc().statusStore()  # the numbers the Spark UI shows


def size(path: str) -> tuple[int, int]:
    files = [
        os.path.join(d, f)
        for d, _, fs in os.walk(path)
        for f in fs
        if not f.startswith((".", "_"))
    ]
    return len(files), sum(os.path.getsize(f) for f in files)


def bytes_read(name: str, df) -> int:
    """Run the query; add up the input bytes of every stage it ran."""
    sc.setJobGroup(name, name)
    df.collect()
    return sum(
        store.lastStageAttempt(s).inputBytes()
        for job in sc.statusTracker().getJobIdsForGroup(name)
        for s in sc.statusTracker().getJobInfo(job).stageIds
    )


csv = spark.read.csv("data/raw/orders/", header=True, schema=ORDERS)
csv.orderBy("order_id").write.mode("overwrite").parquet("out/orders.parquet")
parquet = spark.read.parquet("out/orders.parquet")
for name, path in [
    ("csv", "data/raw/orders"),
    ("parquet", "out/orders.parquet"),
]:
    files, total = size(path)
    print(f"{name:8} {files:4} files {total:>10,} bytes")

german = lambda df: df.filter(F.col("country") == "DE").select(
    "order_id", "total"
)
print(
    f"German orders, 2 columns:  csv reads {bytes_read('a', german(csv)):>9,} bytes"
)
print(
    f"                       parquet reads {bytes_read('b', german(parquet)):>9,} bytes"
)
first = lambda df: df.filter(F.col("order_id") < 1000).select(
    "order_id", "total"
)
print(
    f"order_id < 1000:           csv reads {bytes_read('c', first(csv)):>9,} bytes"
)
print(
    f"                       parquet reads {bytes_read('d', first(parquet)):>9,} bytes"
)
german(parquet).explain()
