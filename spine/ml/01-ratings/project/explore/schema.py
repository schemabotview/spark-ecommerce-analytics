"""Delta checks every write against the table's schema."""
from pyspark.errors import PySparkException
from pyspark.sql import functions as F

from shopwave import lake
from shopwave.session import spark_session

spark = spark_session()
orders = spark.read.format("delta").load(lake.ORDERS)
late = orders.filter(F.col("order_date") == "2026-12-31").limit(2)
append = lambda df, **o: df.write.format("delta").mode("append").options(
    **o).save(lake.ORDERS)

wrong_type = late.withColumn("total", F.col("total").cast("string"))
extra = late.withColumn("channel", F.lit("app"))  # marketing's new column
for name, df in [("total as a string", wrong_type),
                 ("a new column", extra)]:
    try:
        append(df)
        print(f"{name}: written")
    except PySparkException as e:
        print(f"{name}: refused, {e.getCondition()}")

append(extra, mergeSchema="true")  # evolve, on purpose
now = spark.read.format("delta").load(lake.ORDERS)
print("with mergeSchema: written · columns now:", len(now.columns))
print("channel on old rows:", now.filter("channel IS NULL").count(),
      "nulls · on new rows:", now.filter("channel = 'app'").count())
