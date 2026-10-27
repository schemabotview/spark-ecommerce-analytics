"""Lab: a stream is a series of small batch jobs. Watch each one."""
import json
import os

from shopwave import stream
from shopwave.session import spark_session

spark = spark_session()
query = (stream.clicks(stream.kafka(spark, per_batch=300)).writeStream
         .format("memory").queryName("clicks")
         .option("checkpointLocation", "out/checkpoint")
         .trigger(availableNow=True).start())
query.awaitTermination()
for p in query.recentProgress:
    source = p["sources"][0]
    end = json.loads(source["endOffset"]) if isinstance(
        source["endOffset"], str) else source["endOffset"]
    offsets = ", ".join(f"p{k}:{v}" for k, v in sorted(end["clicks"].items()))
    print(f"batch {p['batchId']}: {p['numInputRows']:3} rows · "
          f"read up to {offsets}")
print("checkpoint/:", ", ".join(sorted(os.listdir("out/checkpoint"))))
print("offsets/:", ", ".join(sorted(os.listdir("out/checkpoint/offsets"))))
print("commits/:", ", ".join(sorted(os.listdir("out/checkpoint/commits"))))
