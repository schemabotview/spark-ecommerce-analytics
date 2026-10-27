"""One customer: what they rated, by category, and what we recommend."""
from pyspark.sql import functions as F

from shopwave import ml
from shopwave.session import spark_session

spark = spark_session()
products = spark.read.format("delta").load("lake/gold/dim_product")
top = spark.read.format("delta").load(ml.TOP).join(products, "product_id")
mine = ml.ratings(spark).join(products, "product_id")
who = (mine.groupBy("customer_id").count()
       .orderBy(F.desc("count"), "customer_id").first().customer_id)

stars = (mine.filter(F.col("customer_id") == who).groupBy("category")
         .agg(F.avg("rating").alias("stars")).orderBy(F.desc("stars")))
print(f"customer {who} rated, on average:",
      ", ".join(f"{r.category} {r.stars:.1f}★" for r in stars.collect()))
print("recommended:")
for r in top.filter(F.col("customer_id") == who).orderBy("rank").collect():
    print(f"  {r.rank}. {r.name:20} {r.category:12} {r.score:.2f}★")
