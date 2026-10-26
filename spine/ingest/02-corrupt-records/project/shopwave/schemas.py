"""The shape of every source, declared: Spark never guesses a type."""
from pyspark.sql.types import (DateType, DecimalType, LongType, StringType,
                               StructField, StructType, TimestampType)

MONEY = DecimalType(10, 2)  # exact: 10 digits, 2 after the point

ORDERS = StructType([
    StructField("order_id", LongType(), nullable=False),
    StructField("order_ts", TimestampType()),
    StructField("customer_id", LongType()),
    StructField("country", StringType()),
    StructField("status", StringType()),
    StructField("total", MONEY),
])

RETURNS = StructType([
    StructField("return_id", StringType()),
    StructField("order_id", LongType()),
    StructField("product_id", LongType()),
    StructField("reason", StringType()),
    StructField("returned_on", DateType()),
    # the whole line, when it does not fit the columns above
    StructField("_corrupt_record", StringType()),
])
