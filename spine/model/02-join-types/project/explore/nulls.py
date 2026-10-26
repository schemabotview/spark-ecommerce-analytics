"""NULL: the value nobody knows. Filters, coalesce and when, on visitors."""
from pyspark.sql import functions as F

from shopwave import silver
from shopwave.session import spark_session

spark = spark_session()
clicks = silver.clicks(spark.read.parquet("lake/bronze/clicks"))
user = F.col("user_id")

print("events:                ", clicks.count())
print("user_id is null:       ", clicks.filter(user.isNull()).count())
print("user_id == 239:        ", clicks.filter(user == 239).count())
print("user_id != 239:        ", clicks.filter(user != 239).count())
print("NOT (user_id <=> 239): ", clicks.filter(~user.eqNullSafe(239)).count())
types = clicks.groupBy("visitor_type").count().orderBy("visitor_type")
for row in types.collect():
    print(f"visitor_type {row.visitor_type:9} {row['count']}")
