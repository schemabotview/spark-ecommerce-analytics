from session import spark_session

spark = spark_session()
orders = spark.read.csv("data/raw/orders/orders-2026-10-01.csv", header=True)
orders.show(3)
print(orders.dtypes)
