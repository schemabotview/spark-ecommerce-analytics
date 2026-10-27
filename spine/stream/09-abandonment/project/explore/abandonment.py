"""Carts left behind: an alert once a visit has been quiet for 30 minutes."""
from shopwave import stream
from shopwave.session import spark_session

spark = spark_session()
events = stream.clicks(stream.kafka(spark, per_batch=500))
# A visit stays open in state until the watermark passes its end: only then
# is it certain that no purchase is coming.
alerts = stream.abandoned_carts(events.withWatermark("event_ts", "10 minutes"))
query = (alerts.writeStream.format("memory").queryName("alerts")
         .outputMode("append")  # each closed visit, once
         .option("checkpointLocation", "out/alerts")
         .trigger(availableNow=True).start())
query.awaitTermination()
last = query.recentProgress[-1]
print("batches:", len(query.recentProgress), "· alerts:",
      spark.table("alerts").count(), "· visits still open in state:",
      last["stateOperators"][0]["numRowsTotal"])
first = spark.table("alerts").orderBy("session_window").limit(3)
for a in first.collect():
    w = a.session_window
    print(f"  {a.visitor[:12]:12}  {w.start:%H:%M}–{w.end:%H:%M}  "
          f"{a.events} events, carted, no purchase")
