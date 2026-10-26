"""Analytics: the business's questions, answered from gold and silver."""
from pyspark.sql import DataFrame, Window
from pyspark.sql import functions as F

PAID = "status = 'paid'"  # a SQL condition: usable before Spark starts


def daily_kpis(sales: DataFrame) -> DataFrame:
    """Per day: orders, gross merchandise value (GMV) and average order
    value (AOV), from paid orders' lines."""
    return (
        sales.filter(PAID)
        .groupBy("order_date")
        .agg(F.countDistinct("order_id").alias("orders"),
             F.sum("revenue").alias("gmv"))
        .withColumn("aov", F.round(F.col("gmv") / F.col("orders"), 2))
        .orderBy("order_date")
    )


def top_products(sales: DataFrame, products: DataFrame,
                 n: int = 3) -> DataFrame:
    """The n best-selling products of each category, ranked by revenue."""
    revenue = (sales.filter(PAID).groupBy("product_id")
               .agg(F.sum("revenue").alias("revenue"))
               .join(products, "product_id"))
    in_category = Window.partitionBy("category").orderBy(F.desc("revenue"))
    ranked = revenue.withColumn("rank", F.rank().over(in_category))
    return ranked.filter(F.col("rank") <= n).orderBy("category", "rank")


def moving_average(kpis: DataFrame, days: int = 7) -> DataFrame:
    """Each day's GMV beside the average of the `days` days ending on it."""
    day = F.unix_date("order_date")  # days since 1970: a number to range over
    frame = Window.orderBy(day).rangeBetween(-(days - 1), 0)
    return kpis.withColumn("gmv_avg", F.round(F.avg("gmv").over(frame), 2))


def sessions(clicks: DataFrame, gap_minutes: int = 30) -> DataFrame:
    """Number each visitor's visits: a new session starts after a gap of
    more than `gap_minutes` without an event."""
    in_order = Window.partitionBy("visitor").orderBy("event_ts", "event_id")
    seconds = F.col("event_ts").cast("long")
    gap = seconds - F.lag(seconds).over(in_order)
    starts = F.when(gap.isNull() | (gap > gap_minutes * 60), 1).otherwise(0)
    so_far = in_order.rowsBetween(Window.unboundedPreceding, 0)
    return (clicks.withColumn("starts", starts)
            .withColumn("session", F.sum("starts").over(so_far))
            .withColumn("session_id", F.concat_ws("#", "visitor", "session"))
            .drop("starts"))

STEPS = ["page_view", "product_view", "add_to_cart", "checkout", "purchase"]


def funnel(visits: DataFrame) -> DataFrame:
    """How many people's sessions reached each step of the way to a sale."""
    people = visits.filter(~F.col("is_bot"))
    reached = people.groupBy("session_id").agg(*[
        F.max((F.col("event_type") == s).cast("int")).alias(s) for s in STEPS])
    return reached.agg(*[F.sum(s).alias(s) for s in STEPS])
