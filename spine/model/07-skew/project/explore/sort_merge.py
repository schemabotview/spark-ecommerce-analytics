"""Orders ⋈ order lines as a sort-merge join: both sides shuffled, sorted."""
from shopwave import metrics
from shopwave.session import spark_session

spark = spark_session()
# Our month is small enough to broadcast. Switch that off, as if both sides
# were a year of a big shop: this is the join Spark uses then.
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", -1)
orders = spark.read.parquet("lake/silver/orders")
items = spark.read.parquet("lake/silver/order_items")
joined = items.join(orders, "order_id")

rows, stages = metrics.run(spark, "smj", joined.count)
print("joined rows:", rows)
for s in stages:
    print(f"stage {s.stageId()}: {s.numCompleteTasks():3} tasks · "
          f"shuffle write {s.shuffleWriteBytes():6} B · "
          f"shuffle read {s.shuffleReadBytes():6} B")
plan = joined._jdf.queryExecution().executedPlan().toString()
for line in plan.splitlines():
    if any(op in line for op in ("Join", "Sort [", "Exchange", "Scan")):
        print(line.split("[")[0].rstrip() if "Scan" not in line
              else line.split(" [")[0].replace("FileScan", "Scan"))
