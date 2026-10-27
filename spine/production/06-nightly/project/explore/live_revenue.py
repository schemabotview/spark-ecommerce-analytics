"""Revenue per hour, kept up to date as purchases stream in."""
from pyspark.sql import functions as F

from shopwave import stream
from shopwave.session import spark_session

spark = spark_session()
events = stream.clicks(stream.kafka(spark, per_batch=300))
hourly = stream.revenue_per(stream.purchases(events))
query = (hourly.writeStream.format("memory").queryName("hourly")
         .outputMode("complete")  # the whole result table, every batch
         .option("checkpointLocation", "out/hourly")
         .trigger(availableNow=True).start())
query.awaitTermination()
print("batches:", len(query.recentProgress), "· hours with sales:",
      spark.table("hourly").count())
for r in spark.table("hourly").orderBy(F.desc("revenue")).limit(4).collect():
    print(f"  {r.window.start:%m-%d %H:%M}–{r.window.end:%H:%M}  "
          f"{r.orders:2} orders  € {r.revenue:>8}")
