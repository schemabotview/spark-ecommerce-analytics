import type { Section } from '../types'

export const whereNext: Section = {
  id: 'where-next',
  title: 'Where next',
  scene: 'production-where-next',
  narration:
    "That is the whole platform, built and run, from a first DataFrame to a cluster. To finish, here is what each part becomes at a company's scale, because almost none of the code changes. The compute moves from local mode to a managed platform: Databricks, Amazon EMR, Google Dataproc, or Spark on Kubernetes, where executors are pods. The lake moves from a local folder to object storage: S three, Azure Data Lake or Google Cloud Storage. Delta tables addressed by path get names in a catalog, such as Unity Catalog or AWS Glue, so that people and tools find them by name and permissions live in one place. Apache Iceberg is the other open table format worth knowing; it solves the same problems Delta does. The nightly command becomes a graph of tasks in a scheduler like Airflow or Dagster, with retries and alerts. The single Kafka broker becomes a managed service. Spark Connect separates a thin client from a remote Spark server, which is how notebooks and applications talk to shared clusters now. And the tests and checks run in continuous integration on every change, before anything reaches the nightly run. The ideas you learned stay the same everywhere: partitions and tasks, shuffles, plans, memory, and tables with a transaction log.",
}
