"""The lakehouse jobs: Delta tables kept up to date, not rebuilt.

    python -m shopwave.lake orders [--upto DATE]   add the orders not yet loaded
    python -m shopwave.lake changes --days GLOB    apply the shop's change feed
"""
import argparse

from delta.tables import DeltaTable
from pyspark.sql import DataFrame, SparkSession, Window
from pyspark.sql import functions as F

from shopwave.session import spark_session

LAKE = "lake"
ORDERS = f"{LAKE}/gold/orders"  # one row per order, its status kept current
PRICES = f"{LAKE}/gold/dim_product_history"  # every price a product has had


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


def changes(spark: SparkSession, days: str) -> DataFrame:
    """The change feed: one JSON line per status an order moved to."""
    return spark.read.json(f"data/raw/order_changes/changes-{days}.jsonl",
                           schema="op string, order_id long, status string, "
                                  "changed_at timestamp")


def latest(feed: DataFrame) -> DataFrame:
    """One row per order: its newest change. MERGE refuses a target row
    that two source rows match."""
    newest = Window.partitionBy("order_id").orderBy(F.desc("changed_at"))
    return (feed.withColumn("n", F.row_number().over(newest))
            .filter("n = 1").drop("n"))


def apply_changes(spark: SparkSession, feed: DataFrame) -> dict:
    """MERGE the feed into gold/orders: a change newer than what the table
    holds updates its order. Returns Delta's own counts for the commit."""
    orders = DeltaTable.forPath(spark, ORDERS)
    (orders.alias("o").merge(feed.alias("c"), "o.order_id = c.order_id")
     .whenMatchedUpdate(condition="c.changed_at > o.updated_at", set={
         "status": "c.status", "updated_at": "c.changed_at"})
     .execute())
    return orders.history(1).first().operationMetrics


def price_history(spark: SparkSession) -> DataFrame:
    """Slowly changing dimension, type 2: a row per price a product has had,
    valid from one day to the day before the next price."""
    changes = spark.read.csv("data/raw/product_prices.csv", header=True,
                             schema="product_id long, price decimal(10,2), "
                                    "valid_from date")
    after = Window.partitionBy("product_id").orderBy("valid_from")
    upto = F.date_sub(F.lead("valid_from").over(after), 1)
    forever = F.lit("9999-12-31").cast("date")  # the current price: open
    return (changes.withColumn("valid_to", F.coalesce(upto, forever))
            .withColumn("is_current", F.lead("valid_from").over(after)
                        .isNull()))


def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(prog="python -m shopwave.lake")
    p.add_argument("job", choices=["orders", "changes"])
    p.add_argument("--upto", help="orders: load nothing after this day")
    p.add_argument("--days", default="*", help="changes: which days' files")
    a = p.parse_args(argv)
    spark = spark_session()
    if a.job == "orders":
        added = load_orders(spark, a.upto)
        total = spark.read.format("delta").load(ORDERS).count()
        print(f"gold/orders: +{added} rows, {total} in all")
    else:
        feed = changes(spark, a.days)
        m = apply_changes(spark, latest(feed))
        print(f"changes: {feed.count()} read · {m['numSourceRows']} orders · "
              f"{m['numTargetRowsUpdated']} updated")


if __name__ == "__main__":
    main()
