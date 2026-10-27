"""The reviews as a matrix: customers × products, mostly empty."""
from pyspark.sql import functions as F

from shopwave import ml
from shopwave.session import spark_session

spark = spark_session()
ratings = ml.ratings(spark).cache()
users = ratings.select("customer_id").distinct().count()
items = ratings.select("product_id").distinct().count()
cells = ratings.select("customer_id", "product_id").distinct().count()
print(f"{ratings.count()} ratings · {users} customers × {items} products")
print(f"the matrix: {users * items} cells, {cells / (users * items):.1%} "
      "filled")
stars = dict(ratings.groupBy("rating").count().collect())
print("stars:", " · ".join(f"{s}★ {stars[s]}" for s in sorted(stars)))

# The customer who rated most, by category: one person's taste
top = (ratings.groupBy("customer_id").count()
       .orderBy(F.desc("count"), "customer_id").first())
products = spark.read.format("delta").load("lake/gold/dim_product")
theirs = (ratings.filter(F.col("customer_id") == top.customer_id)
          .join(products, "product_id").groupBy("category")
          .agg(F.count("*").alias("n"), F.avg("rating").alias("stars")))
print(f"customer {top.customer_id}, {top['count']} ratings:")
for c in theirs.orderBy(F.desc("stars"), "category").collect():
    print(f"  {c.category:12} {c.stars:.1f}★ over {c.n}")
