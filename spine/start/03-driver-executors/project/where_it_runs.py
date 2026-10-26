"""Lab: where a job runs. Count October's paid orders, then ask Spark what
it did."""

from pyspark.sql import SparkSession

spark = (
    SparkSession.builder.master("local[4]")
    .appName("shopwave")
    .config("spark.driver.extraJavaOptions",
            "-Dlog4j2.configurationFile=conf/log4j2.properties")
    .config("spark.ui.showConsoleProgress", "false")
    .getOrCreate()
)
sc = spark.sparkContext
executors = sc._jsc.sc().statusTracker().getExecutorInfos()
print(
    f"master {sc.master}: {len(executors)} executor, {sc.defaultParallelism} task slots"
)

orders = spark.read.csv("data/raw/orders/", header=True)
files = len(orders.inputFiles())
print(
    f"October: {files} files, read as {orders.rdd.getNumPartitions()} partitions"
)
print("paid orders:", orders.filter(orders.status == "paid").count())

tracker = sc.statusTracker()
for job in sorted(tracker.getJobIdsForGroup()):
    for stage in tracker.getJobInfo(job).stageIds:
        tasks = tracker.getStageInfo(stage).numCompletedTasks
        if tasks:  # a stage another job already ran is skipped: 0 tasks
            print(
                f"job {job}, stage {stage}: {tasks} task{'s' if tasks > 1 else ''}"
            )
