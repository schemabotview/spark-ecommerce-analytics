"""Lab: ALS as Spark runs it, two factor matrices solved block by block."""
from pyspark.ml.recommendation import ALS

from shopwave.session import spark_session

spark = spark_session()
sc = spark.sparkContext
ratings = spark.read.csv("data/raw/reviews/", header=True, schema=(
    "review_id string, customer_id int, product_id int, rating float, "
    "reviewed_at timestamp"))
als = ALS(userCol="customer_id", itemCol="product_id", ratingCol="rating",
          rank=8, maxIter=10, regParam=0.1, seed=2026,
          numUserBlocks=4, numItemBlocks=4)  # one block per task slot
sc.setJobGroup("als", "fit")
model = als.fit(ratings)
jobs = sc.statusTracker().getJobIdsForGroup("als")
stages = sum(len(sc.statusTracker().getJobInfo(j).stageIds) for j in jobs)
print(f"{ratings.count()} ratings · blocks: 4 of customers, 4 of products")
print(f"fit: {len(jobs)} jobs, {stages} stages for {als.getMaxIter()} "
      "rounds of: fix one side, solve the other")
users, items = model.userFactors, model.itemFactors
print(f"customer factors: {users.count()} × {model.rank} · "
      f"product factors: {items.count()} × {model.rank}")

one = ratings.orderBy("customer_id", "product_id").first()
u = users.filter(f"id = {one.customer_id}").first().features
v = items.filter(f"id = {one.product_id}").first().features
guess = model.transform(ratings.filter(
    f"customer_id = {one.customer_id} AND product_id = {one.product_id}"))
print(f"customer {one.customer_id} · product {one.product_id} "
      f"(rated {one.rating:.0f}★):")
print("  u =", " ".join(f"{x:5.2f}" for x in u[:4]), "…")
print("  v =", " ".join(f"{x:5.2f}" for x in v[:4]), "…")
print(f"  u · v = {sum(a * b for a, b in zip(u, v)):.2f} = the prediction, "
      f"{guess.first().prediction:.2f}")
