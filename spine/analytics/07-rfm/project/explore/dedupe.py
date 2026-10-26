"""The tracker sends some events twice: how many, and what silver keeps."""
from pyspark.sql import functions as F

from shopwave import silver
from shopwave.session import spark_session

spark = spark_session()
bronze = spark.read.parquet("lake/bronze/clicks")
copies = bronze.groupBy("event_id").count()  # copies of each id

print("bronze events:   ", bronze.count())
print("distinct ids:    ", bronze.select("event_id").distinct().count())
print("sent twice:      ", copies.filter(F.col("count") > 1).count())
print("silver events:   ", silver.clicks(bronze).count())
