"""Analytics: the business's questions, answered from gold and silver."""
from pyspark.sql import DataFrame
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
