"""Revenue by country once more, on a cluster: where did the tasks run?"""
import time

from pyspark.sql import functions as F

from shopwave import metrics
from shopwave.session import spark_session

spark = spark_session()
store = spark.sparkContext._jsc.sc().statusStore()
scala = lambda seq: [seq.apply(i) for i in range(seq.size())]  # a Seq
executors = lambda: [e for e in scala(store.executorList(True))
                     if e.id() != "driver"]
while len(executors()) < 2:  # executors start on the workers, then join
    time.sleep(0.5)
print("master:", spark.sparkContext.master)
print(f"executors: {len(executors())} · cores: "
      f"{sum(e.totalCores() for e in executors())}")

sales = spark.read.format("delta").load("lake/gold/fact_sales")
by_country = sales.groupBy("country").agg(F.sum("revenue").alias("revenue"))
rows, stages = metrics.run(spark, "cluster", by_country.collect)
print(f"{len(rows)} countries · stages: {len(stages)}")
for s in stages:
    ran = store.taskList(s.stageId(), s.attemptId(), 1000)
    hosts = sorted({t.executorId() for t in scala(ran)})
    print(f"  stage {s.stageId()}: {s.numTasks()} tasks on executors "
          f"{', '.join(hosts)}")
