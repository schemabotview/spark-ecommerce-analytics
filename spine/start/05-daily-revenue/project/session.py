"""One SparkSession for every Shopwave job, configured in one place."""

import logging

from pyspark.sql import SparkSession


def spark_session() -> SparkSession:
    # PySpark also logs every error it raises (Spark's own: logs/spark.log).
    logging.getLogger("DataFrameQueryContextLogger").setLevel(logging.CRITICAL)
    return (
        SparkSession.builder
        .master("local[4]")  # Spark on this machine, 4 tasks at a time
        .appName("shopwave")
        .config("spark.driver.extraJavaOptions",
                "-Dlog4j2.configurationFile=conf/log4j2.properties")
        .config("spark.ui.showConsoleProgress", "false")  # no progress bars
        .getOrCreate()
    )
