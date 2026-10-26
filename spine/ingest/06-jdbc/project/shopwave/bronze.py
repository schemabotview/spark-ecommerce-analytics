"""Bronze: every source landed as it came, typed; bad rows set aside."""

from pyspark.sql import DataFrame, SparkSession
from pyspark.sql import functions as F

from shopwave import schemas

RAW = "data/raw"
SHOP_DB = "jdbc:postgresql://localhost:5432/shop"  # compose.yaml
SHOP_LOGIN = {
    "user": "shopwave",
    "password": "shopwave",
    "driver": "org.postgresql.Driver",
}


def returns(spark: SparkSession) -> tuple[DataFrame, DataFrame]:
    """The warehouse's monthly file: Latin-1, with malformed lines.
    Returns (good, bad)."""
    rows = spark.read.csv(
        f"{RAW}/returns/",
        header=True,
        schema=schemas.RETURNS,
        encoding="ISO-8859-1",  # the warehouse's system writes Latin-1
        mode="PERMISSIVE",  # keep every line; a bad one: in _corrupt_record
    ).cache()  # Spark refuses a query on _corrupt_record alone, uncached
    bad = F.col("_corrupt_record").isNotNull()
    good = rows.filter(~bad).drop("_corrupt_record")
    return good, rows.filter(bad).select("_corrupt_record")


def clicks(spark: SparkSession, days: str = "*") -> DataFrame:
    """The tracker's JSON lines, one folder per arrival day. Since 2026-06-01
    the tracker writes context.device_type for context.device: both are
    declared, and merged here."""
    events = spark.read.json(
        f"{RAW}/clickstream/{days}/", schema=schemas.CLICKS
    )
    device = F.coalesce("context.device_type", "context.device")
    return events.withColumn(
        "context",
        F.col("context").withField("device", device).dropFields("device_type"),
    )


def table(
    spark: SparkSession, name: str, key: str, partitions: int = 4
) -> DataFrame:
    """A table of the shop's database, read in parallel: one range query on
    `key` per partition."""
    low, high = spark.read.jdbc(
        SHOP_DB,
        f"(select min({key}), max({key}) from {name}) b",
        properties=SHOP_LOGIN,
    ).first()
    return spark.read.jdbc(
        SHOP_DB,
        name,
        column=key,
        lowerBound=low,
        upperBound=high,
        numPartitions=partitions,
        properties=SHOP_LOGIN,
    )
