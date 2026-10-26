"""The shape of every source, declared: Spark never guesses a type."""
from pyspark.sql.types import (DecimalType, LongType, StringType, StructField,
                               StructType, TimestampType)

MONEY = DecimalType(10, 2)  # exact: 10 digits, 2 after the point

ORDERS = StructType([
    StructField("order_id", LongType(), nullable=False),
    StructField("order_ts", TimestampType()),
    StructField("customer_id", LongType()),
    StructField("country", StringType()),
    StructField("status", StringType()),
    StructField("total", MONEY),
])
