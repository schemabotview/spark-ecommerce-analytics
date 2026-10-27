"""October's clicks cut into visits: lag, a 30-minute gap, a running sum."""
from pyspark.sql import functions as F

from shopwave import analytics
from shopwave.session import spark_session

spark = spark_session()
clicks = spark.read.parquet("lake/silver/clicks").filter(
    F.col("event_date").between("2026-10-01", "2026-10-31"))
visits = analytics.sessions(clicks).cache()

for bot, label in [(False, "people"), (True, "the bot")]:
    v = visits.filter(F.col("is_bot") == bot)
    events, people, n = v.count(), v.select("visitor").distinct().count(), \
        v.select("session_id").distinct().count()
    print(f"{label:8} {events:6} events · {people:5} visitors · "
          f"{n:5} sessions · {events / n:.1f} events each")
one = visits.filter(F.col("visitor") == "1").orderBy("event_ts")
for r in one.limit(6).collect():
    print(f"  visitor 1  {r.event_ts}  {r.event_type:12} session {r.session}")
