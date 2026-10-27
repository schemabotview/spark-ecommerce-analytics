"""Silver to gold: one fact table, two dimensions, and a revenue check."""
from pyspark.sql import functions as F

from shopwave import gold
from shopwave.session import spark_session

spark = spark_session()
silver = {t: spark.read.parquet(f"lake/silver/{t}")
          for t in ["orders", "order_items", "customers", "products"]}
sales = gold.fact_sales(silver["orders"], silver["order_items"])
customers = gold.dim_customer(silver["customers"])
products = gold.dim_product(silver["products"])

for name, df in [("fact_sales", sales), ("dim_customer", customers),
                 ("dim_product", products)]:
    print(f"{name:13} {df.count():6} rows  {len(df.columns):2} columns")
paid = F.col("status") == "paid"
lines = sales.filter(paid).agg(F.sum("revenue")).first()[0]
orders = silver["orders"].filter(paid).agg(F.sum("total")).first()[0]
print("paid revenue: lines", lines, "· orders", orders)
by_category = sales.join(products, "product_id").groupBy("category").agg(
    F.sum("revenue").alias("revenue")).orderBy(F.desc("revenue"))
for row in by_category.limit(3).collect():
    print(f"  {row.category:12} {row.revenue:>10}")
