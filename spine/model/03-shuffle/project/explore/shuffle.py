"""Lab: what a groupBy does between its two stages, from Spark's own metrics."""
from pyspark.sql import functions as F

from shopwave.session import spark_session

spark = spark_session()
sc = spark.sparkContext
store = sc._jsc.sc().statusStore()  # what the Spark UI shows
sales = spark.read.parquet("lake/gold/fact_sales")
print("fact_sales:", sales.count(), "rows in",
      sales.rdd.getNumPartitions(), "partitions")
print("spark.sql.shuffle.partitions =",
      spark.conf.get("spark.sql.shuffle.partitions"))

sc.setJobGroup("by-country", "revenue by country")
by_country = sales.groupBy("country").agg(F.sum("revenue").alias("revenue"))
rows = by_country.collect()
print("countries:", len(rows))
for job in sorted(sc.statusTracker().getJobIdsForGroup("by-country")):
    for s in sorted(sc.statusTracker().getJobInfo(job).stageIds):
        d = store.lastStageAttempt(s)
        if d.numCompleteTasks() == 0:
            continue  # skipped: another job already ran it
        print(f"stage {s}: {d.numCompleteTasks():3} tasks · "
              f"read {d.inputRecords():5} rows from files · "
              f"shuffle write {d.shuffleWriteRecords():3} rows "
              f"{d.shuffleWriteBytes():6} B · "
              f"shuffle read {d.shuffleReadRecords():3} rows")
by_country.explain()
