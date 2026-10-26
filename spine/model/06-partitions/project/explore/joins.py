"""Orders and payments: what each kind of join keeps."""
from pyspark.sql import functions as F

from shopwave.session import spark_session

spark = spark_session()
orders = spark.read.parquet("lake/silver/orders")
orders = orders.filter(F.col("status") != "cancelled")  # nothing to pay
payments = spark.read.parquet("lake/silver/payments")
print("orders:", orders.count(), "· payments:", payments.count())

for how in ["inner", "left", "left_semi", "left_anti"]:
    joined = orders.join(payments, "order_id", how)
    print(f"{how:10} {joined.count():5} rows")

unpaid = orders.join(payments, "order_id", "left_anti")
twice = payments.groupBy("order_id").count().filter(F.col("count") > 1)
print("never paid:", unpaid.count(), "· paid twice:", twice.count())
unpaid.select("order_id", "order_ts", "country", "total").orderBy(
    "order_id").show(3)
