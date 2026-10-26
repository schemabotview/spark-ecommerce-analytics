"""Bronze clicks to silver: every column an expression."""
from pyspark.sql import functions as F

from shopwave import silver
from shopwave.session import spark_session

spark = spark_session()
bronze = spark.read.parquet("lake/bronze/clicks")
clicks = silver.clicks(bronze)
print("bronze:", len(bronze.columns), "columns · silver:", len(clicks.columns))

expr = F.col("context.campaign").isNull()  # an expression: nothing computed
print(expr)
clicks.select("event_date", "event_type", "device", "campaign").filter(
    F.col("campaign").isNotNull()
).orderBy("event_ts").show(3)
