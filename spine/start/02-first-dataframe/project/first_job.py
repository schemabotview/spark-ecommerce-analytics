from pyspark.sql import SparkSession

spark = (
    SparkSession.builder
    .master("local[4]")  # Spark on this machine, 4 tasks at a time
    .appName("shopwave")
    .config("spark.driver.extraJavaOptions",
            "-Dlog4j2.configurationFile=conf/log4j2.properties")
    .getOrCreate()
)

orders = spark.read.csv("data/raw/orders/orders-2026-10-01.csv", header=True)
orders.show(3)
print(orders.dtypes)
