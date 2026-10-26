from pyspark.sql import functions as F

from session import spark_session

spark = spark_session()
orders = spark.read.csv("data/raw/orders/", header=True)

daily = (
    orders.filter(F.col("status") == "paid")
    .groupBy(F.to_date("order_ts").alias("day"))
    .agg(
        F.count("*").alias("orders"),
        F.sum(F.col("total").cast("decimal(10,2)")).alias("revenue"),
    )
    .orderBy("day")
)
daily.show(3)
daily.write.mode("overwrite").csv("out/daily_revenue", header=True)
