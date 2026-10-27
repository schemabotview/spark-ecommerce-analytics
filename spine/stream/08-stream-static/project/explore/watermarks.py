"""Three days of clicks, some arriving days late: when is an hour final?"""
from shopwave import stream
from shopwave.session import spark_session

spark = spark_session()
events = stream.clicks(stream.kafka(spark, per_batch=500))
# Allow 2 hours of lateness: an hour's window is final, and its state freed,
# once events 2 hours past its end have been seen. Later ones are dropped.
late_ok = events.withWatermark("event_ts", "2 hours")
hourly = stream.revenue_per(stream.purchases(late_ok))
query = (hourly.writeStream.format("memory").queryName("hourly")
         .outputMode("append")  # a window is written once: when final
         .option("checkpointLocation", "out/watermark")
         .trigger(availableNow=True).start())
query.awaitTermination()
dropped = sum(p["stateOperators"][0]["numRowsDroppedByWatermark"]
              for p in query.recentProgress)
last = query.recentProgress[-1]
print("batches:", len(query.recentProgress), "· final hours written:",
      spark.table("hourly").count())
print("watermark now:", last["eventTime"]["watermark"])
print("late purchases dropped:", dropped)
print("windows still open in state:",
      last["stateOperators"][0]["numRowsTotal"])
