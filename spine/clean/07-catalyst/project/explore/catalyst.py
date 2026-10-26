"""Lab: what Catalyst does to a query before anything runs."""
from pyspark.sql import functions as F

from shopwave.session import spark_session

spark = spark_session()
rules = spark.sparkContext._jvm.org.apache.spark.sql.catalyst.rules
orders = spark.read.parquet("lake/bronze/orders")

# German revenue in cents, written the clumsy way a query grows in real life:
# a column computed before it is needed, filters in two places.
query = (
    orders.withColumn("cents", F.col("total") * (F.lit(10) * 10))
    .filter(F.col("status") == "paid")
    .select("country", "status", "cents")
    .filter(F.col("country") == "DE")
    .groupBy("country").agg(F.sum("cents").alias("cents"))
)
rules.RuleExecutor.resetMetrics()
query.explain(mode="extended")
print("answer:", query.first().cents)

print("== Optimizer rules that changed the plan ==")
for line in rules.RuleExecutor.dumpTimeSpent().splitlines():
    parts = line.split()
    if ".optimizer." in line and len(parts) > 6 and parts[4] != "0":
        print(f"{parts[0].rsplit('.', 1)[1]:30} ran {parts[4]}x")
