"""One product sells far more than any other: what that does to a join."""
from statistics import median

from pyspark.sql import functions as F

from shopwave import metrics
from shopwave.session import spark_session

spark = spark_session()
spark.conf.set("spark.sql.adaptive.enabled", False)
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", -1)  # a big dimension
sales = spark.read.parquet("lake/gold/fact_sales")
products = spark.read.parquet("lake/gold/dim_product")

top = sales.groupBy("product_id").count().orderBy(F.desc("count")).first()
share = top["count"] / sales.count()
print(f"product {top.product_id}: {top['count']} of {sales.count()} lines "
      f"({share:.0%})")

joined = sales.join(products, "product_id")
# A "noop" write computes every column of every row and writes nothing: a
# count() would let Spark skip all but product_id, and measure nothing.
write = joined.write.format("noop").mode("overwrite")
_, stages = metrics.run(spark, "skew", write.save)
join = max(stages, key=lambda s: s.shuffleReadRecords())  # the join stage
rows = sorted((r for r in metrics.task_records(spark, join) if r),
              reverse=True)
print(f"join stage: {join.numCompleteTasks()} tasks, "
      f"{len(rows)} with rows")
print("rows per task, largest first:", rows[:6], "…")
print(f"largest task {rows[0]} rows · median task {median(rows):.0f} rows")
