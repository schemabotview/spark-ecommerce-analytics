"""One SparkSession for every Shopwave job, configured in one place."""

import logging
import os
from glob import glob

from pyspark.sql import SparkSession


def spark_session(**conf: str) -> SparkSession:
    """The session; `conf` adds one job's settings, named as in Spark."""
    # PySpark also logs every error it raises (Spark's own: logs/spark.log).
    logging.getLogger("DataFrameQueryContextLogger").setLevel(logging.CRITICAL)
    builder = (
        SparkSession.builder
        .appName("shopwave")
        .config("spark.driver.extraJavaOptions",
                "-Dlog4j2.configurationFile=conf/log4j2.properties")
        .config("spark.ui.showConsoleProgress", "false")  # no progress bars
        .config("spark.sql.session.timeZone", "UTC")  # every timestamp in UTC
        .config("spark.jars", ",".join(sorted(glob("jars/*.jar"))))  # jars.txt
        # Delta Lake: its SQL commands, and tables that know they are Delta
        .config("spark.sql.extensions",
                "io.delta.sql.DeltaSparkSessionExtension")
        .config("spark.sql.catalog.spark_catalog",
                "org.apache.spark.sql.delta.catalog.DeltaCatalog")
    )
    if "PYSPARK_GATEWAY_PORT" not in os.environ:  # not under spark-submit
        builder = builder.master("local[4]")  # this machine, 4 tasks at a time
    for key, value in conf.items():
        builder = builder.config(key, value)
    return builder.getOrCreate()
