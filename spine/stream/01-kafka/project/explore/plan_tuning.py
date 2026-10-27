"""A filter Spark can see, and the same filter hidden in a Python UDF."""
from pyspark.sql import functions as F
from pyspark.sql.types import BooleanType

from shopwave import metrics, schemas, scale
from shopwave.session import spark_session

spark = spark_session()
orders = spark.read.csv(f"{scale.SF1}/orders/", header=True,
                        schema=schemas.ORDERS)
orders.write.mode("overwrite").parquet("out/orders")  # a year, columnar
orders = spark.read.parquet("out/orders")


@F.udf(BooleanType())
def is_german(country):
    return country == "DE"


queries = {"built-in": orders.filter(F.col("country") == "DE"),
           "Python UDF": orders.filter(is_german("country"))}
for name, q in queries.items():
    q = q.select("order_id", "total")
    n, stages = metrics.run(spark, name, q.count)
    plan = q._jdf.queryExecution().executedPlan().toString()
    pushed = plan.split("PushedFilters: ")[1].split("]")[0] + "]"
    read = sum(s.inputBytes() for s in stages)
    print(f"{name:10} {n} rows · read {read / 2**20:5.1f} MB · "
          f"pushed {pushed}")
