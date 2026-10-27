"""The tracker sends some events twice: drop the copies, in the stream."""
from shopwave import stream
from shopwave.session import spark_session

spark = spark_session()
events = stream.clicks(stream.kafka(spark, per_batch=500))
# Remember each event_id for an hour past the watermark: long enough for any
# copy to arrive, short enough that the state does not grow for ever.
once = (events.withWatermark("event_ts", "1 hour")
        .dropDuplicatesWithinWatermark(["event_id"]))
query = (once.writeStream.format("memory").queryName("once")
         .option("checkpointLocation", "out/dedupe")
         .trigger(availableNow=True).start())
query.awaitTermination()
read = sum(p["numInputRows"] for p in query.recentProgress)
kept = spark.table("once")
dupes = sum(p["stateOperators"][0].get("numDroppedDuplicateRows", 0)
            for p in query.recentProgress)
print(f"read {read} · kept {kept.count()} · distinct ids "
      f"{kept.select('event_id').distinct().count()} · copies dropped {dupes}")
print("ids held in state:", query.recentProgress[-1]["stateOperators"][0]
      ["numRowsTotal"])
