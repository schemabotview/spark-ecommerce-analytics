"""Each transform on a few hand-made rows, against the frame it must give."""
from datetime import datetime
from decimal import Decimal

from pyspark.testing import assertDataFrameEqual

from shopwave import gold, lake, silver


def test_local_date_can_be_the_next_day(spark):
    orders = spark.createDataFrame([
        (1, datetime(2026, 10, 1, 23, 30), "DE"),  # 01:30 in Berlin
        (2, datetime(2026, 10, 1, 23, 30), "US"),  # 19:30 in New York
    ], "order_id long, order_ts timestamp, country string").selectExpr(
        "*", "1L AS customer_id", "'paid' AS status",
        "CAST(10 AS DECIMAL(10,2)) AS total", "'x.csv' AS _source_file")
    got = silver.orders(orders).select("order_id", "order_date", "local_date")
    assertDataFrameEqual(got, spark.createDataFrame([
        (1, "2026-10-01", "2026-10-02"), (2, "2026-10-01", "2026-10-01"),
    ], "order_id long, order_date string, local_date string").selectExpr(
        "order_id", "DATE(order_date) AS order_date",
        "DATE(local_date) AS local_date"))


def test_revenue_is_qty_times_price_and_lines_need_an_order(spark):
    orders = spark.createDataFrame(
        [(1, None, None, None, 7, "DE", "paid")],
        "order_id long, order_ts timestamp, order_date date, local_date date,"
        " customer_id long, country string, status string")
    items = spark.createDataFrame([
        (1, 1, 10, 3, Decimal("2.50")),
        (99, 1, 10, 1, Decimal("9.99")),  # no such order: not a sale
    ], "order_id long, line int, product_id long, qty int, "
       "unit_price decimal(10,2)")
    got = gold.fact_sales(orders, items).select("order_id", "revenue")
    assertDataFrameEqual(got, spark.createDataFrame(
        [(1, Decimal("7.50"))], "order_id long, revenue decimal(21,2)"))


def test_latest_keeps_each_orders_newest_change(spark):
    feed = spark.createDataFrame([
        ("u", 1, "shipped", datetime(2026, 12, 1, 9)),
        ("u", 1, "delivered", datetime(2026, 12, 3, 9)),
        ("u", 2, "shipped", datetime(2026, 12, 2, 9)),
    ], "op string, order_id long, status string, changed_at timestamp")
    got = lake.latest(feed).select("order_id", "status")
    assertDataFrameEqual(got, spark.createDataFrame(
        [(1, "delivered"), (2, "shipped")], "order_id long, status string"))
