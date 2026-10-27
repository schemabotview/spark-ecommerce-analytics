"""Three days of clicks, some arriving days late: when is an hour final?"""
from pyspark.sql import functions as F

from shopwave import stream
from shopwave.session import spark_session

spark = spark_session()
events = stream.clicks(stream.kafka(spark, per_batch=500))
# Allow 2 hours of lateness: an hour's window is final, and its state freed,
# once events 2 hours past its end have been seen. Later ones are dropped.
late_ok = events.withWatermark("event_ts", "2 hours")
hourly = late_ok.groupBy(F.window("event_ts", "1 hour")).count()
query = (hourly.writeStream.format("memory").queryName("hourly")
         .outputMode("append")  # a window is written once: when final
         .option("checkpointLocation", "out/watermark")
         .trigger(availableNow=True).start())
query.awaitTermination()
dropped = sum(p["stateOperators"][0]["numRowsDroppedByWatermark"]
              for p in query.recentProgress)
last = query.recentProgress[-1]
written = spark.table("hourly")
print("batches:", len(query.recentProgress), "· final hours written:",
      written.count(), "· events in them:", written.agg(F.sum("count"))
      .first()[0])
print("watermark now:", last["eventTime"]["watermark"])
print("late events dropped:", dropped)
print("windows still open in state:",
      last["stateOperators"][0]["numRowsTotal"])
