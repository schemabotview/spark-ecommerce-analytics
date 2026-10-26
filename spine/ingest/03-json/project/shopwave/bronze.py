"""Bronze: every source landed as it came, typed; bad rows set aside."""

from pyspark.sql import DataFrame, SparkSession
from pyspark.sql import functions as F

from shopwave import schemas

RAW = "data/raw"


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
