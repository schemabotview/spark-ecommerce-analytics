"""The skewed join again, with Adaptive Query Execution on."""
from statistics import median

from shopwave import metrics
from shopwave.session import spark_session

spark = spark_session()
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", -1)  # a big dimension
# AQE's thresholds are sized for real data (a partition is skewed past 256 MB).
# Scaled down to our month, the same rules apply:
spark.conf.set("spark.sql.adaptive.advisoryPartitionSizeInBytes", "32KB")
spark.conf.set(
    "spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "32KB")
spark.conf.set("spark.sql.adaptive.autoBroadcastJoinThreshold", -1)
spark.conf.set("spark.sql.adaptive.coalescePartitions.parallelismFirst", False)
spark.conf.set("spark.sql.adaptive.coalescePartitions.minPartitionSize", "1KB")
sales = spark.read.parquet("lake/gold/fact_sales")
products = spark.read.parquet("lake/gold/dim_product")
joined = sales.join(products, "product_id")

for aqe in [False, True]:
    spark.conf.set("spark.sql.adaptive.enabled", aqe)
    write = joined.write.format("noop").mode("overwrite")  # every column
    _, stages = metrics.run(spark, f"aqe-{aqe}", write.save)
    join = max(stages, key=lambda s: s.shuffleReadRecords())  # the join
    rows = [r for r in metrics.task_records(spark, join) if r]
    print(f"AQE {'on ' if aqe else 'off'}: join stage "
          f"{join.numCompleteTasks():3} tasks · largest "
          f"{max(rows):4} rows · median {median(rows):4.0f} · "
          f"read {join.shuffleReadRecords()} rows")
