"""The shape of every source, declared: Spark never guesses a type."""
from pyspark.sql.types import (ArrayType, DateType, DecimalType, IntegerType,
                               LongType, StringType, StructField, StructType,
                               TimestampType)

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

CLICKS = StructType([  # one event from the site's tracker, as JSON
    StructField("event_id", StringType(), nullable=False),
    StructField("event_ts", TimestampType()),
    StructField("event_type", StringType()),
    StructField("user_id", LongType()),  # null until the visitor logs in
    StructField("anon_id", StringType()),
    StructField("context", StructType([  # a nested object
        StructField("device_type", StringType()),
        StructField("browser", StringType()),
        StructField("user_agent", StringType()),
        StructField("campaign", StringType()),
    ])),
    StructField("items", ArrayType(StructType([  # a list of objects
        StructField("product_id", LongType()),
        StructField("qty", IntegerType()),
        StructField("price", MONEY),
    ]))),
    StructField("consent", StringType()),
])
