"""Live clicks, by category: the stream joined to gold's dim_product."""
from shopwave import stream
from shopwave.session import spark_session

spark = spark_session()
products = spark.read.format("delta").load("lake/gold/dim_product")
events = stream.clicks(stream.kafka(spark, per_batch=500))
items = stream.with_products(events, products)
counts = items.groupBy("category", "event_type").count()
query = (counts.writeStream.format("memory").queryName("live")
         .outputMode("complete")  # the whole table again after each batch
         .option("checkpointLocation", "out/live")
         .trigger(availableNow=True).start())
query.awaitTermination()
print("batches:", len(query.recentProgress), "· dim_product:",
      products.count(), "products, read again each batch")
steps = ["product_view", "add_to_cart", "purchase"]  # the table, pivoted
spark.table("live").groupBy("category").pivot("event_type", steps).sum(
    "count").orderBy("category").show()
