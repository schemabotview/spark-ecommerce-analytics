"""A whole year at scale factor 1, read straight from the exports: what
Course 8 measures. 2 million orders, 3.4 million order lines."""
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql import functions as F

from shopwave import schemas

SF1 = "data/sf1"


def year_sales(spark: SparkSession) -> DataFrame:
    """Every paid order line of 2026, with its order's day and country."""
    orders = spark.read.csv(f"{SF1}/orders/", header=True,
                            schema=schemas.ORDERS)
    items = spark.read.csv(f"{SF1}/order_items/", header=True,
                           schema=schemas.ORDER_ITEMS)
    paid = orders.filter("status = 'paid'").select(
        "order_id", F.to_date("order_ts").alias("order_date"), "country")
    return items.join(paid, "order_id").withColumn(
        "revenue", F.col("qty") * F.col("unit_price"))
