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
moved = sum(s.shuffleWriteBytes() for s in stages)
print("joined rows:", rows, "· bytes shuffled:", moved)
plan = joined._jdf.queryExecution().executedPlan().toString()
for line in plan.splitlines():
    if any(op in line for op in ("Join", "Sort [", "Exchange", "Scan")):
        op = line.split("[")[0].split("(")[0].rstrip()  # the operator only
        print(op.replace("FileScan", "Scan"), "on order_id" * ("Exch" in op))
