"""Who is a bot? A Python function, applied to every event's user agent."""
from pyspark.sql import functions as F

from shopwave import silver
from shopwave.session import spark_session

spark = spark_session()
clicks = silver.clicks(spark.read.parquet("lake/bronze/clicks"))

for row in clicks.groupBy("is_bot").count().orderBy("is_bot").collect():
    print(f"is_bot={row.is_bot!s:5}  {row['count']:6} events")
top = clicks.groupBy("visitor", "is_bot").count()
for row in top.orderBy(F.desc("count"), "visitor").limit(3).collect():
    print(f"  {row.visitor:15} bot={row.is_bot!s:5} {row['count']:5} events")
bot = clicks.filter("is_bot").select("user_agent").first().user_agent
print("its user agent:", bot)
plan = clicks.filter("is_bot")._jdf.queryExecution().executedPlan()
python_steps = [s.strip(" +-") for s in plan.toString().splitlines()
                if "BatchEvalPython" in s]
print("plan steps that call Python:", len(python_steps))
print(" ", python_steps[0].split("[")[0], "→ is_bot(context.user_agent)")
