"""Top three products in every category: a window, not a groupBy."""
from shopwave import analytics
from shopwave.session import spark_session

spark = spark_session()
sales = spark.read.parquet("lake/gold/fact_sales")
products = spark.read.parquet("lake/gold/dim_product")
top = analytics.top_products(sales, products)
print("rows:", top.count(), "· columns:", ", ".join(top.columns[-3:]))
for category in [r.category for r in top.select("category").distinct()
                 .orderBy("category").collect()]:
    rows = top.filter(top.category == category).collect()
    print(f"{category:11}", " · ".join(f"{r['rank']}. {r['name']}"
                                       for r in rows))
