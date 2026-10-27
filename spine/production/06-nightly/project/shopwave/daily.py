"""gold/daily_sales, one day at a time: run a day twice, get the same table.

    python -m shopwave.daily DAY [LAST_DAY]    build a day, or backfill a range
"""
import sys
from datetime import date, timedelta

from pyspark.sql import SparkSession
from pyspark.sql import functions as F

from shopwave.session import spark_session

DAILY = "lake/gold/daily_sales"


def build(spark: SparkSession, day: date) -> None:
    """Replace exactly one day's rows: never add to them."""
    sales = spark.read.format("delta").load("lake/gold/fact_sales")
    one = sales.filter(F.col("order_date") == F.lit(day))
    daily = one.groupBy("order_date", "country").agg(
        F.count("*").alias("lines"), F.sum("revenue").alias("revenue"))
    (daily.write.format("delta").mode("overwrite")
     .option("replaceWhere", f"order_date = '{day}'")  # this day only
     .partitionBy("order_date").save(DAILY))


def main(argv: list[str]) -> None:
    first = date.fromisoformat(argv[0])
    last = date.fromisoformat(argv[-1])
    spark = spark_session()
    for n in range((last - first).days + 1):
        build(spark, first + timedelta(days=n))
    table = spark.read.format("delta").load(DAILY)
    days = table.select("order_date").distinct().count()
    revenue = table.agg(F.sum("revenue")).first()[0]
    print(f"daily_sales: {first}…{last} rebuilt · {table.count()} rows, "
          f"{days} days · € {revenue}")


if __name__ == "__main__":
    main(sys.argv[1:])
