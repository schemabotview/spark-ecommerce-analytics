"""The shop's customers table: one query, then four in parallel."""

from pyspark.sql import functions as F

from shopwave import bronze
from shopwave.session import spark_session

spark = spark_session()
whole = spark.read.jdbc(
    bronze.SHOP_DB, "customers", properties=bronze.SHOP_LOGIN
)
print("one query:", whole.rdd.getNumPartitions(), "partition")

customers = bronze.table(spark, "customers", key="customer_id")
counts = dict(customers.groupBy(F.spark_partition_id()).count().collect())
relation = (
    customers._jdf.queryExecution().analyzed().relation()
)  # Spark's plan, via py4j
for i, part in enumerate(relation.parts()):
    print(f"partition {i}: {counts[i]:4} rows  where {part.whereClause()}")
print(customers.dtypes)
