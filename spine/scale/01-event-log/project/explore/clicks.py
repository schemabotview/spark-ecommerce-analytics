"""One day of clickstream: JSON lines, nested. Guessed, then declared."""

from pyspark.sql import functions as F

from shopwave import schemas
from shopwave.session import spark_session

spark = spark_session()
day = "data/raw/clickstream/2026-10-01/"

for name, df in [
    ("guessed", spark.read.json(day)),
    ("declared", spark.read.json(day, schema=schemas.CLICKS)),
]:
    types = dict(df.dtypes)
    print(f"{name}: event_ts {types['event_ts']}")
    print(f"  items {types['items']}")

clicks = spark.read.json(day, schema=schemas.CLICKS)
print("events:", clicks.count())
for row in (
    clicks.groupBy("event_type")
    .count()
    .orderBy(F.desc("count"), "event_type")
    .collect()
):
    print(f"  {row.event_type:13} {row['count']}")
