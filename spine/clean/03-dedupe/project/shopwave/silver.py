"""Silver: bronze made clean and consistent, ready to model and query."""
from pyspark.sql import DataFrame
from pyspark.sql import functions as F


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
        F.col("context.campaign").alias("campaign"),
        "items",
        "consent",
        "_source_file",
    )
