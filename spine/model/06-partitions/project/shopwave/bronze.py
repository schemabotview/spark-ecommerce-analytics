"""Bronze: every source landed as it came, typed; bad rows set aside.

python -m shopwave.bronze    lands every source in lake/bronze/<source>/
"""

from pyspark.sql import DataFrame, SparkSession
from pyspark.sql import functions as F

from shopwave import schemas
from shopwave.session import spark_session

RAW = "data/raw"
LAKE = "lake"
SHOP_DB = "jdbc:postgresql://localhost:5432/shop"  # compose.yaml
SHOP_LOGIN = {
    "user": "shopwave",
    "password": "shopwave",
    "driver": "org.postgresql.Driver",
}


def from_files(df: DataFrame) -> DataFrame:
    """Where each row came from: its file, and the day in the file's path
    (none for a monthly file)."""
    return df.withColumn(
        "_source_file", F.col("_metadata.file_name")
    ).withColumn(
        "_file_date",
        F.try_to_date(
            F.regexp_extract("_metadata.file_path", r"(\d{4}-\d{2}-\d{2})", 1)
        ),
    )


def orders(spark: SparkSession) -> DataFrame:
    """The shop database's nightly export: one CSV per day."""
    return from_files(
        spark.read.csv(f"{RAW}/orders/", header=True, schema=schemas.ORDERS)
    )


def order_items(spark: SparkSession) -> DataFrame:
    """The same export's order lines: one CSV per day."""
    return from_files(spark.read.csv(f"{RAW}/order_items/", header=True,
                                     schema=schemas.ORDER_ITEMS))


def payments(spark: SparkSession) -> DataFrame:
    """The payment provider's daily drop: Parquet, with its own schema."""
    return from_files(spark.read.parquet(f"{RAW}/payments/"))


def fx_rates(spark: SparkSession) -> DataFrame:
    """Finance's exchange rates: one CSV, a row per day and currency."""
    return from_files(spark.read.csv(f"{RAW}/fx_rates.csv", header=True,
                                     schema=schemas.FX_RATES))


def returns(spark: SparkSession) -> tuple[DataFrame, DataFrame]:
    """The warehouse's monthly file: Latin-1, with malformed lines.
    Returns (good, bad)."""
    rows = spark.read.csv(
        f"{RAW}/returns/",
        header=True,
        schema=schemas.RETURNS,
        encoding="ISO-8859-1",  # the warehouse's system writes Latin-1
        mode="PERMISSIVE",  # keep every line; a bad one: in _corrupt_record
    )
    rows = from_files(
        rows
    ).cache()  # Spark refuses a query on _corrupt_record alone
    bad = F.col("_corrupt_record").isNotNull()
    return rows.filter(~bad).drop("_corrupt_record"), rows.filter(bad)


def clicks(spark: SparkSession, days: str = "*") -> DataFrame:
    """The tracker's JSON lines, one folder per arrival day. Since 2026-06-01
    the tracker writes context.device_type for context.device: both are
    declared, and merged here."""
    events = from_files(
        spark.read.json(f"{RAW}/clickstream/{days}/", schema=schemas.CLICKS)
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


def main() -> None:
    spark = spark_session()
    good, bad = returns(spark)
    daily = {"orders": orders(spark), "order_items": order_items(spark),
             "payments": payments(spark), "clicks": clicks(spark)}
    for name, df in daily.items():  # a folder per day: _file_date=2026-10-01
        out = df.write.mode("overwrite").partitionBy("_file_date")
        out.parquet(f"{LAKE}/bronze/{name}")
    returned = good.drop("_file_date").write.mode("overwrite")
    returned.parquet(f"{LAKE}/bronze/returns")
    fx = fx_rates(spark).drop("_file_date").write.mode("overwrite")
    fx.parquet(f"{LAKE}/bronze/fx_rates")
    keys = {"customers": "customer_id", "products": "product_id"}
    for name, key in keys.items():  # the shop's database
        table(spark, name, key).write.mode("overwrite").parquet(
            f"{LAKE}/bronze/{name}")
    bad.drop("_file_date").write.mode("overwrite").json(
        f"{LAKE}/quarantine/returns")

    tables = [*daily, "returns", "fx_rates", "customers", "products"]
    counts = [(f"bronze/{t}", spark.read.parquet(f"{LAKE}/bronze/{t}").count())
              for t in tables]
    quarantined = spark.read.json(f"{LAKE}/quarantine/returns").count()
    counts.append(("quarantine/returns", quarantined))
    for i in range(0, len(counts), 2):
        print("   ".join(f"{p:18} {n:5} rows" for p, n in counts[i:i + 2]))


if __name__ == "__main__":
    main()
