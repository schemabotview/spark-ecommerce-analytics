import type { SceneModel } from '@graphlearning/graphl-flow'

// §7 — where next: each part of the platform, and the tool that runs it at a company's scale.
const row = (id: string, part: string, here: string, there: string) => ({ id, cells: [part, here, there] })

export const productionWhereNext: SceneModel = {
  title: 'Where next: the same platform, at a company’s scale',
  sub: 'Nothing here is thrown away: each part keeps its code and changes where it runs',
  nodes: [
    {
      type: 'table', id: 'map', title: 'Each part of Shopwave, and what replaces its scaffolding', tone: 'store', columns: ['part', 'in this course', 'in production'], rows: [
        row('p-compute', 'compute', 'local[4], a standalone cluster', 'Databricks, EMR, Dataproc, Kubernetes'),
        row('p-storage', 'storage', 'files in lake/', 'S3, ADLS, GCS: object storage'),
        row('p-table', 'tables', 'Delta folders by path', 'a catalog: Unity, Glue, Hive metastore'),
        row('p-format', 'table format', 'Delta Lake', 'Delta, or Apache Iceberg'),
        row('p-sched', 'scheduling', 'python -m shopwave.jobs nightly', 'Airflow, Dagster, Databricks Jobs'),
        row('p-stream', 'streaming', 'one Kafka broker', 'a managed Kafka: MSK, Confluent'),
        row('p-client', 'the client', 'PySpark in one process', 'Spark Connect: a thin client, a remote server'),
        row('p-test', 'tests and checks', 'pytest, checks.py', 'CI on every change; expectations in the pipeline'),
      ],
    },
    {
      type: 'group', id: 'next', title: 'What to learn next', icon: 'search', tone: 'ingest', dir: 'row', children: [
        { type: 'item', id: 'n-iceberg', title: 'Iceberg', sub: 'the other open table format', icon: 'layers' },
        { type: 'item', id: 'n-airflow', title: 'Airflow', sub: 'the night as a graph of tasks', icon: 'airflow' },
        { type: 'item', id: 'n-k8s', title: 'Spark on Kubernetes', sub: 'executors as pods', icon: 'kubernetes' },
        { type: 'item', id: 'n-connect', title: 'Spark Connect', sub: 'the API over gRPC', icon: 'network' },
      ],
    },
  ],
}
