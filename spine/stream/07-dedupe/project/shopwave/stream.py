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
