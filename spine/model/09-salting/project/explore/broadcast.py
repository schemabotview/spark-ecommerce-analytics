"""Payments in euros: rates joined by shuffling both sides, or broadcast."""
from pyspark.sql import functions as F

from shopwave import gold, metrics
from shopwave.session import spark_session

spark = spark_session()
payments = spark.read.parquet("lake/silver/payments")
fx = spark.read.parquet("lake/silver/fx_rates")
print("payments:", payments.count(), "· fx rates:", fx.count())

paid = payments.withColumn("paid_date", F.to_date("paid_ts"))
rates = fx.select(F.col("date").alias("paid_date"), "currency", "per_eur")
keys = ["paid_date", "currency"]
joins = {"shuffle both": paid.join(rates.hint("merge"), keys, "left"),
         "broadcast": paid.join(F.broadcast(rates), keys, "left")}
for name, joined in joins.items():
    count, stages = metrics.run(spark, name, joined.count)
    moved = sum(s.shuffleWriteBytes() for s in stages)
    plan = joined._jdf.queryExecution().executedPlan().toString()
    join = next(l for l in plan.splitlines() if "Join" in l)
    print(f"{name:12} {join.split('(')[0].strip(' +-*'):22} "
          f"{count} rows · {moved:6} B shuffled")

eur = gold.fact_payments(payments, fx)
print("gold.fact_payments: total €", eur.agg(F.sum("amount_eur")).first()[0])
