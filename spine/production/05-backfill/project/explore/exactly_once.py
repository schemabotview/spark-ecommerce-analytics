"""Crash a stream in the middle, start it again: every event, once."""
import sys

from pyspark.errors import PySparkException
from pyspark.sql import functions as F

from shopwave import stream
from shopwave.session import spark_session

spark = spark_session()
table, checkpoint = "out/clicks", "out/clicks_checkpoint"
events = stream.clicks(stream.kafka(spark, per_batch=300))
if sys.argv[1:] == ["crash"]:  # a bug that hits one event in batch 1
    events = events.withColumn("event_type", F.when(
        F.col("offset") == 120, F.raise_error(F.lit("crash"))).otherwise(
        F.col("event_type")))
query = stream.to_delta(events, table, checkpoint)
try:
    query.awaitTermination()
except PySparkException as e:
    print("the stream stopped:", e.getCondition())
written = spark.read.format("delta").load(table)
print(f"in the table: {written.count()} events, "
      f"{written.select('event_id').distinct().count()} distinct")
