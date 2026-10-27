"""Read the topic as a stream: everything there now, then stop."""
from shopwave import stream
from shopwave.session import spark_session

spark = spark_session()
records = stream.kafka(spark)
print("streaming:", records.isStreaming)
print("a record:", ", ".join(f"{c}:{t}" for c, t in records.dtypes[:5]))

query = (stream.clicks(records).writeStream.format("memory")
         .queryName("clicks").option("checkpointLocation", "out/read")
         .trigger(availableNow=True)  # all that is there, then finish
         .start())
query.awaitTermination()
events = spark.table("clicks")
print("events read:", events.count())
events.groupBy("partition").count().orderBy("partition").show()
