"""The skewed join again, with Adaptive Query Execution on."""
from statistics import median

from shopwave import metrics
from shopwave.session import spark_session

spark = spark_session()
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", -1)  # a big dimension
# AQE's thresholds are sized for real data (a partition is skewed past 256 MB).
# Scaled down to our month, the same rules apply:
spark.conf.set("spark.sql.adaptive.advisoryPartitionSizeInBytes", "8KB")
spark.conf.set(
    "spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "8KB")
spark.conf.set("spark.sql.adaptive.autoBroadcastJoinThreshold", -1)
sales = spark.read.parquet("lake/gold/fact_sales")
products = spark.read.parquet("lake/gold/dim_product")
joined = sales.join(products, "product_id")

for aqe in [False, True]:
    spark.conf.set("spark.sql.adaptive.enabled", aqe)
    count, stages = metrics.run(spark, f"aqe-{aqe}", joined.count)
    rows = [r for r in metrics.task_records(spark, stages[-1]) if r]
    print(f"AQE {'on ' if aqe else 'off'}: {count} rows · join stage "
          f"{stages[-1].numCompleteTasks():3} tasks · largest "
          f"{max(rows):4} rows · median {median(rows):4.0f}")
plan = joined._jdf.queryExecution().executedPlan().toString()
print(next(l.strip(" +-*") for l in plan.splitlines() if "Join" in l)[:60])
