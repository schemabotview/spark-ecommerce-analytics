"""The tracker changed on June 1st: what each day's file says, and what
bronze keeps."""

from pyspark.sql import functions as F

from shopwave import bronze
from shopwave.session import spark_session

spark = spark_session()
days = "{2026-05-31,2026-06-01}"
raw = spark.read.json(
    f"data/raw/clickstream/{days}/"
)  # guessed: the union of both
arrived = F.regexp_extract(
    "_metadata.file_path", r"clickstream/([\d-]+)/", 1
).alias("file")
raw.groupBy(arrived).agg(
    F.count("*").alias("events"),
    F.count("context.device").alias("device"),
    F.count("context.device_type").alias("device_type"),
    F.count("consent").alias("consent"),
).orderBy("file").show()

clicks = bronze.clicks(spark, days)
print(
    "bronze: device known for",
    clicks.filter(F.col("context.device").isNotNull()).count(),
    "of",
    clicks.count(),
    "events",
)
