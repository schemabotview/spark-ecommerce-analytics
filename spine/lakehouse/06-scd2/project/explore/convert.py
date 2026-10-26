"""An existing Parquet folder becomes a Delta table, without rewriting it."""
import os
import shutil

from shopwave.session import spark_session

spark = spark_session()
shutil.copytree("lake/bronze/orders", "out/orders", dirs_exist_ok=True)
files = sum(f.endswith(".parquet") for _, _, fs in os.walk("out/orders")
            for f in fs)
spark.sql("CONVERT TO DELTA parquet.`out/orders` "
          "PARTITIONED BY (_file_date DATE)")
print(f"converted: {files} parquet files kept where they were")
print("rows:", spark.read.format("delta").load("out/orders").count(),
      "· log:", sorted(os.listdir("out/orders/_delta_log"))[0])
