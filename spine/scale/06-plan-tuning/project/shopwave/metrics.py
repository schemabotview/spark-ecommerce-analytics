"""What a job did, from Spark's status store: the numbers the Spark UI shows."""
from collections.abc import Callable
from typing import Any

from pyspark.sql import SparkSession


def run(spark: SparkSession, name: str, action: Callable[[], Any]):
    """Run `action` as job group `name`; return its result and every stage it
    ran (skipped stages left out), each as the UI's StageData."""
    sc = spark.sparkContext
    sc.setJobGroup(name, name)
    result = action()
    tracker, store = sc.statusTracker(), sc._jsc.sc().statusStore()
    stages = [store.lastStageAttempt(s)
              for job in sorted(tracker.getJobIdsForGroup(name))
              for s in sorted(tracker.getJobInfo(job).stageIds)]
    return result, [s for s in stages if s.numCompleteTasks() > 0]


def task_records(spark: SparkSession, stage) -> list[int]:
    """Rows each task of a stage read, from files or from a shuffle."""
    store = spark.sparkContext._jsc.sc().statusStore()
    tasks = store.taskList(stage.stageId(), stage.attemptId(), 100_000)
    out, it = [], tasks.iterator()
    while it.hasNext():
        m = it.next().taskMetrics().get()
        out.append(m.inputMetrics().recordsRead()
                   + m.shuffleReadMetrics().recordsRead())
    return out
