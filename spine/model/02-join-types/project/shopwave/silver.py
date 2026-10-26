"""Silver: bronze made clean and consistent, ready to model and query."""
import sys

from pyspark.sql import DataFrame
from pyspark.sql import functions as F

from shopwave.quality import gate
from shopwave.session import spark_session

LAKE = "lake"

BOT = r"(?i)bot|crawl|spider|scraper"  # a Java regex: rlike runs it in the JVM

# Timestamps are stored in UTC; a customer's day is their own country's.
TIMEZONES = {
    "AT": "Europe/Vienna", "BE": "Europe/Brussels", "DE": "Europe/Berlin",
    "ES": "Europe/Madrid", "FR": "Europe/Paris", "GB": "Europe/London",
    "IE": "Europe/Dublin", "IN": "Asia/Kolkata", "IT": "Europe/Rome",
    "NL": "Europe/Amsterdam", "PL": "Europe/Warsaw", "SE": "Europe/Stockholm",
    "US": "America/New_York",
}


def clicks(events: DataFrame) -> DataFrame:
    """One row per event, flat: each nested field a column of its own.
    The tracker sends some events twice: the first copy of each is kept."""
    return events.dropDuplicates(["event_id"]).select(
        "event_id",
        "event_ts",
        F.to_date("event_ts").alias("event_date"),
        "event_type",
        "user_id",
        "anon_id",
        # who: the customer when logged in, else the browser's anonymous id
        F.coalesce(F.col("user_id").cast("string"), "anon_id").alias("visitor"),
        F.when(F.col("user_id").isNotNull(), "customer")
        .otherwise("anonymous").alias("visitor_type"),
        F.col("context.device").alias("device"),
        F.col("context.browser").alias("browser"),
        F.col("context.user_agent").alias("user_agent"),
        F.coalesce(F.col("context.user_agent").rlike(BOT), F.lit(False))
        .alias("is_bot"),
        F.col("context.campaign").alias("campaign"),
        "items",
        "consent",
        "_source_file",
    )


def orders(orders: DataFrame) -> DataFrame:
    """Orders with the day they were placed: in UTC, and the customer's."""
    zones = F.create_map(*[F.lit(x) for kv in TIMEZONES.items() for x in kv])
    local = F.from_utc_timestamp("order_ts", zones[F.col("country")])
    return orders.select(
        "order_id", "order_ts", "customer_id", "country", "status", "total",
        F.to_date("order_ts").alias("order_date"),  # the UTC day
        F.to_date(local).alias("local_date"),  # the customer's own day
        "_source_file",
    )


def main() -> None:
    spark = spark_session()
    bronze = {t: spark.read.parquet(f"{LAKE}/bronze/{t}")
              for t in ["orders", "order_items", "clicks", "payments",
                        "returns", "customers", "products"]}
    tables = {**bronze, "orders": orders(bronze["orders"]),
              "clicks": clicks(bronze["clicks"])}
    keys = {"orders": ["order_id", "order_ts", "total", "local_date"],
            "clicks": ["event_id", "event_ts", "visitor"]}
    passed = [gate(name, tables[name], bronze[name].count(), cols)
              for name, cols in keys.items()]
    if not all(passed):
        sys.exit("silver: a gate failed, nothing written")
    for name, df in tables.items():
        df.write.mode("overwrite").parquet(f"{LAKE}/silver/{name}")
    print("silver: written", ", ".join(tables))


if __name__ == "__main__":
    main()
