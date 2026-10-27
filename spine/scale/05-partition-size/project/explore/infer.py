"""Guessed or declared: the same month of orders read both ways."""

from pyspark.sql import functions as F

from shopwave.schemas import ORDERS
from shopwave.session import spark_session

spark = spark_session()
tracker = spark.sparkContext.statusTracker()
jobs = lambda: len(tracker.getJobIdsForGroup())
path = "data/raw/orders/"

guessed = spark.read.csv(path, header=True, inferSchema=True)
print("guessed:  jobs to read:", jobs())
before = jobs()
declared = spark.read.csv(path, header=True, schema=ORDERS)
print("declared: jobs to read:", jobs() - before)
for name, df in [("guessed", guessed), ("declared", declared)]:
    types = dict(df.dtypes)
    print(f"{name:9} order_id {types['order_id']}, total {types['total']}")

daily = lambda df: (
    df.groupBy(F.to_date("order_ts").alias("d"))
    .agg(F.sum("total").alias("r"))
    .orderBy("d")
)
pairs = zip(daily(guessed).collect(), daily(declared).collect())
inexact = [(g.d, g.r, d.r) for g, d in pairs if len(repr(g.r)) > 9]
print(f"double sums that are not whole cents: {len(inexact)} of 31 days")
day, double, decimal = inexact[0]
print(f"{day}: double {double!r}, decimal {decimal}")
