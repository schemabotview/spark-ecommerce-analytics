import type { Section } from '../types'

export const whatSparkIs: Section = {
  id: 'what-spark-is',
  title: 'What Spark is, and where it is used',
  scene: 'intro-what-spark-is',
  narration:
    'Apache Spark is an engine for processing data that is too big, or too slow to process, on one machine. You describe what you want, in DataFrame code or in SQL, and Spark works out how to do it. Its optimizer, Catalyst, rewrites your query into a faster plan. The driver splits that plan into tasks, one per slice of the data, and executors run the tasks in parallel, on the cores of one laptop or on hundreds of machines, keeping data in memory where it can and spilling to disk where it cannot. The same engine sits under four interfaces. DataFrames and SQL for batch work, which is most of this course. Structured Streaming, which runs the same DataFrame code on data that keeps arriving. MLlib, for models trained on all of the data. And you can write it all in Python, SQL, Scala, Java or R; this course uses Python, PySpark. Spark does not store anything itself: it reads and writes files and tables in Parquet, CSV, JSON, Delta, Kafka topics and databases. It runs on your laptop, on a cluster of its own, on Kubernetes, or as a managed service like Databricks, Amazon EMR or Google Dataproc. The code does not change between them, which is why we can learn it all on one machine.',
}
