"""Run one job on a year of data, then read what Spark wrote about it."""
import glob
import json
import os

from pyspark.sql import functions as F

from shopwave import scale
from shopwave.session import spark_session

os.makedirs("logs/events", exist_ok=True)  # Spark will not create it
spark = spark_session(**{
    "spark.eventLog.enabled": "true",  # every event, as JSON lines
    "spark.eventLog.dir": "logs/events",
    "spark.eventLog.rolling.enabled": "false",  # one file
    "spark.eventLog.compress": "false",  # readable as it is
})
by_country = scale.year_sales(spark).groupBy("country").agg(
    F.sum("revenue").alias("revenue"))
by_country.write.format("noop").mode("overwrite").save()
spark.stop()  # the log is complete once the application ends

metric = "internal.metrics."
print("stage tasks  seconds  rows read  shuffle write  shuffle read")
for line in open(glob.glob("logs/events/local-*")[0]):
    event = json.loads(line)
    if event["Event"] != "SparkListenerStageCompleted":
        continue
    stage = event["Stage Info"]
    m = {a["Name"].removeprefix(metric): a.get("Value", 0)
         for a in stage["Accumulables"]}
    took = (stage["Completion Time"] - stage["Submission Time"]) / 1000
    print(f"{stage['Stage ID']:5} {stage['Number of Tasks']:5} {took:8.1f}  "
          f"{m.get('input.recordsRead', 0):9}  "
          f"{m.get('shuffle.write.recordsWritten', 0):13}  "
          f"{m.get('shuffle.read.recordsRead', 0):12}")
