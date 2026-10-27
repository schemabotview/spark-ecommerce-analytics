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
