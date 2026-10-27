"""Lab: what a Delta table is on disk: two commits, and the log of them."""
import json
import os

from pyspark.sql import functions as F

from shopwave.session import spark_session

spark = spark_session()
path = "out/dim_product"
products = spark.read.parquet("lake/gold/dim_product")
products.write.format("delta").mode("overwrite").save(path)  # commit 0
price_cut = products.filter(F.col("product_id") <= 2)  # commit 1: 2 new rows
price_cut.write.format("delta").mode("append").save(path)

data = sorted(f for f in os.listdir(path) if f.endswith(".parquet"))
log = sorted(f for f in os.listdir(f"{path}/_delta_log")
             if f.endswith(".json"))
added = set()
print(f"{path}/: {len(data)} parquet files · _delta_log/: {len(log)} commits")
for name in log:
    with open(f"{path}/_delta_log/{name}") as f:
        actions = [json.loads(line) for line in f]
    kinds = [next(iter(a)) for a in actions]
    added |= {a["add"]["path"] for a in actions if "add" in a}
    print(f"{name}: " + ", ".join(f"{k} ×{kinds.count(k)}"
                                  for k in dict.fromkeys(kinds)))
    for a in actions:
        if "add" in a:
            stats = json.loads(a["add"]["stats"])
            print(f"  add {a['add']['path'][:10]}…  "
                  f"{stats['numRecords']} rows, "
                  f"product_id {stats['minValues']['product_id']}–"
                  f"{stats['maxValues']['product_id']}")
            break
        if "commitInfo" in a:
            print(f"  commitInfo: {a['commitInfo']['operation']}")
extra = [f for f in data if f not in added]
rows = spark.read.parquet(*[f"{path}/{f}" for f in extra]).count()
print(f"on disk, not in the log: {len(extra)} file, {rows} rows")
print("rows now:", spark.read.format("delta").load(path).count())
