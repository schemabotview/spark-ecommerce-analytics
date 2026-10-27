"""Price history as a type 2 dimension, then checked against every sale."""
from pyspark.sql import functions as F

from shopwave import lake
from shopwave.session import spark_session

spark = spark_session()
history = lake.price_history(spark)
history.write.format("delta").mode("overwrite").save(lake.PRICES)
changed = history.groupBy("product_id").count().filter("count > 1")
print("price rows:", history.count(), "· products repriced:", changed.count())
p = changed.orderBy("product_id").first().product_id
one = history.filter(F.col("product_id") == p).orderBy("valid_from")
for r in one.collect():
    print(f"  product {p}: € {r.price:>7}  {r.valid_from} → {r.valid_to}"
          f"{'  current' if r.is_current else ''}")

sales = spark.read.format("delta").load("lake/gold/fact_sales")
as_of = sales.join(history, (sales.product_id == history.product_id) &
                   sales.order_date.between(history.valid_from,
                                            history.valid_to))
wrong = as_of.filter(sales.unit_price != history.price).count()
print(f"sales checked: {as_of.count()} of {sales.count()} · "
      f"price on the day wrong: {wrong}")
