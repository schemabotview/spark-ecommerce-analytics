"""The lakehouse jobs: Delta tables kept up to date, not rebuilt.

    python -m shopwave.lake orders [--upto DATE]   add the orders not yet loaded
"""
import argparse

from delta.tables import DeltaTable
from pyspark.sql import SparkSession
from pyspark.sql import functions as F

from shopwave.session import spark_session

LAKE = "lake"
ORDERS = f"{LAKE}/gold/orders"  # one row per order, its status kept current


def load_orders(spark: SparkSession, upto: str | None = None) -> int:
    """Append the silver orders placed after the newest one already loaded
    (the high-water mark). Returns how many rows were added."""
    orders = spark.read.parquet(f"{LAKE}/silver/orders").select(
        "order_id", "order_ts", "order_date", "customer_id", "country",
        "status", "total", F.col("order_ts").alias("updated_at"))
    if DeltaTable.isDeltaTable(spark, ORDERS):
        mark = spark.read.format("delta").load(ORDERS).agg(
            F.max("order_date")).first()[0]
        orders = orders.filter(F.col("order_date") > mark)
    if upto:
        orders = orders.filter(F.col("order_date") <= upto)
    new = orders.cache()
    new.write.format("delta").mode("append").save(ORDERS)
    return new.count()


def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(prog="python -m shopwave.lake")
    p.add_argument("job", choices=["orders"])
    p.add_argument("--upto", help="load nothing after this day")
    a = p.parse_args(argv)
    spark = spark_session()
    added = load_orders(spark, a.upto)
    total = spark.read.format("delta").load(ORDERS).count()
    print(f"gold/orders: +{added} rows, {total} in all")


if __name__ == "__main__":
    main()
