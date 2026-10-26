from pyspark.errors import PySparkException
from pyspark.sql import functions as F

from session import spark_session

spark = spark_session()
orders = spark.read.csv("data/raw/orders/", header=True)

try:  # 1. a column that does not exist
    totals = orders.select(F.col("totl"))
except PySparkException as e:
    print("1. select:", type(e).__name__, e.getCondition())
    print("   did you mean:", e.getMessageParameters()["proposal"])

euros = orders.select(F.col("total").cast("int"))  # 2. whole euros
print("2. select: no error")
try:
    euros.show(3)
except PySparkException as e:
    print("   show:", type(e).__name__, e.getCondition())
    print("   value:", e.getMessageParameters()["expression"])
