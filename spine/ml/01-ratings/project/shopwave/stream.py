"""Streaming: the tracker's events read from Kafka as they arrive."""
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql import functions as F

from shopwave import schemas
from shopwave.tracker import KAFKA, TOPIC


def kafka(spark: SparkSession, per_batch: int | None = None) -> DataFrame:
    """The topic as an unbounded table: key, value, partition, offset…"""
    reader = (spark.readStream.format("kafka")
              .option("kafka.bootstrap.servers", KAFKA)
              .option("subscribe", TOPIC)
              .option("startingOffsets", "earliest"))  # from the start
    if per_batch:
        reader = reader.option("maxOffsetsPerTrigger", per_batch)
    return reader.load()


def clicks(records: DataFrame) -> DataFrame:
    """Each record's value, parsed with the bronze schema."""
    event = F.from_json(F.col("value").cast("string"), schemas.CLICKS)
    return records.select(event.alias("e"), "partition", "offset").select(
        "e.*", "partition", "offset")


def to_delta(events: DataFrame, table: str, checkpoint: str):
    """Append the stream to a Delta table. The checkpoint records which
    offsets each batch covers; Delta records which batches it committed, so
    a batch run twice after a crash is written once."""
    return (events.writeStream.format("delta").outputMode("append")
            .option("checkpointLocation", checkpoint)
            .trigger(availableNow=True).start(table))


def purchases(events: DataFrame) -> DataFrame:
    """Purchase events with their basket's value."""
    value = F.aggregate("items", F.lit(0).cast("decimal(12,2)"),
                        lambda acc, i: (acc + i.qty * i.price)
                        .cast("decimal(12,2)"))
    return events.filter(F.col("event_type") == "purchase").withColumn(
        "revenue", value)


def revenue_per(purchases: DataFrame, width: str = "1 hour") -> DataFrame:
    """Revenue in tumbling windows of event time: 00:00-01:00, 01:00-02:00…"""
    return purchases.groupBy(F.window("event_ts", width)).agg(
        F.count("*").alias("orders"), F.sum("revenue").alias("revenue"))


def with_products(events: DataFrame, products: DataFrame) -> DataFrame:
    """One row per item an event names, with the product's category: a
    stream joined to a static table, which Spark re-reads every batch."""
    items = events.select("event_id", "event_type", "event_ts",
                          F.explode("items").alias("i"))
    return items.join(products, F.col("i.product_id") == products.product_id)


def abandoned_carts(events: DataFrame, gap: str = "30 minutes") -> DataFrame:
    """Visits that put something in the cart and never bought: a visit is a
    session window, closed after `gap` without an event from that visitor."""
    visitor = F.coalesce(F.col("user_id").cast("string"), "anon_id")
    did = lambda kind: F.max(F.col("event_type") == kind)
    visits = events.groupBy(visitor.alias("visitor"),
                            F.session_window("event_ts", gap)).agg(
        did("add_to_cart").alias("carted"), did("purchase").alias("bought"),
        F.count("*").alias("events"))
    return visits.filter("carted AND NOT bought")
