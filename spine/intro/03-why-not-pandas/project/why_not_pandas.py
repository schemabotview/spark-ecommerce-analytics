"""Lab: revenue by country, one day then the whole year: pandas, then Spark."""
import glob
import time

import pandas as pd
from pyspark.sql import SparkSession
from pyspark.sql import functions as F


def pandas_report(days: str) -> tuple[int, float, float]:
    start = time.perf_counter()
    read = lambda t: pd.concat(pd.read_csv(f) for f in sorted(
        glob.glob(f"data/sf1/{t}/{t}-{days}.csv")))
    orders, items = read("orders"), read("order_items")
    lines = items.merge(orders[orders.status == "paid"], on="order_id")
    lines["revenue"] = lines.qty * lines.unit_price
    lines.groupby("country").revenue.sum()
    mb = (orders.memory_usage(deep=True).sum()
          + items.memory_usage(deep=True).sum()
          + lines.memory_usage(deep=True).sum()) / 2**20
    return len(lines), mb, time.perf_counter() - start


for label, days in [("one day", "2026-10-01"), ("the year", "*")]:
    rows, mb, secs = pandas_report(days)
    print(f"pandas, {label:8}: {rows:8} lines · {mb:6.0f} MB in memory · "
          f"{secs:5.1f} s")

spark = (SparkSession.builder.master("local[4]").appName("shopwave")
         .config("spark.driver.extraJavaOptions",
                 "-Dlog4j2.configurationFile=conf/log4j2.properties")
         .config("spark.ui.showConsoleProgress", "false").getOrCreate())
start = time.perf_counter()
read = lambda t, schema: spark.read.csv(f"data/sf1/{t}/", header=True,
                                        schema=schema)
orders = read("orders", "order_id long, order_ts timestamp, customer_id long,"
              " country string, status string, total decimal(10,2)")
items = read("order_items", "order_id long, line int, product_id long, "
             "qty int, unit_price decimal(10,2)")
lines = items.join(orders.filter("status = 'paid'"), "order_id")
by_country = lines.groupBy("country").agg(
    F.sum(F.col("qty") * F.col("unit_price")).alias("revenue"))
n = len(by_country.collect())
print(f"Spark,  the year   : {n} countries · data streamed through 4 tasks"
      f" · {time.perf_counter() - start:5.1f} s")
