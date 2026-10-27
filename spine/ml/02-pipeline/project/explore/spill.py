"""Sort a year of order lines, with Spark's memory and without enough."""
from shopwave import metrics, scale
from shopwave.session import spark_session

# A sort holds rows in memory until it cannot; then it writes sorted runs to
# disk and merges them: a spill. This internal setting makes each task spill
# after 100,000 rows, the way a too-small executor would on real volumes.
for limit in [None, "100000"]:
    conf = {"spark.shuffle.spill.numElementsForceSpillThreshold": limit} \
        if limit else {}
    spark = spark_session(**conf)
    sales = scale.year_sales(spark).repartition(8, "order_date")
    ordered = sales.sortWithinPartitions("product_id", "order_date")
    write = ordered.write.format("noop").mode("overwrite")
    _, stages = metrics.run(spark, "sort", write.save)
    sort = stages[-1]
    label = "squeezed" if limit else "default"
    print(f"{label:9} tasks {sort.numCompleteTasks()} · spilled "
          f"{sort.memoryBytesSpilled() / 2**20:6.0f} MB in memory, "
          f"{sort.diskBytesSpilled() / 2**20:5.0f} MB on disk")
    spark.stop()
