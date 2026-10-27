"""The conversion funnel: of October's visits, how many reached each step."""
import os

from pyspark.sql import functions as F

from shopwave import analytics
from shopwave.session import spark_session

spark = spark_session()
clicks = spark.read.parquet("lake/silver/clicks").filter(
    F.col("event_date").between("2026-10-01", "2026-10-31"))
counts = analytics.funnel(analytics.sessions(clicks)).first().asDict()

first = max(counts.values())
os.makedirs("out", exist_ok=True)
with open("out/funnel.csv", "w") as f:
    f.write("step,sessions\n")
    for step in analytics.STEPS:
        f.write(f"{step},{counts[step]}\n")
        share = counts[step] / first
        print(f"{step:13} {counts[step]:6} sessions  {share:6.1%}")
print(f"conversion: {counts['purchase'] / first:.1%} of visits buy")
