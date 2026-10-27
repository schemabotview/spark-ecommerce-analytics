import type { SceneModel } from '@graphlearning/graphl-flow'

// §1 — what Spark is. A concept scene: the engine, its four APIs, where it runs, who writes it.
export const introWhatSparkIs: SceneModel = {
  title: 'Apache Spark: one engine for data too big for one machine',
  sub: 'You write DataFrame code; Spark plans it and runs it as tasks across cores and machines',
  nodes: [
    {
      type: 'group', id: 'apis', badge: 1, title: 'What you write', icon: 'code', tone: 'ingest', dir: 'row', children: [
        { type: 'item', id: 'a-sql', title: 'DataFrames and SQL', sub: 'batch: Courses 2 to 8', icon: 'table' },
        { type: 'item', id: 'a-stream', title: 'Structured Streaming', sub: 'the same code, live: Course 9', icon: 'stream' },
        { type: 'item', id: 'a-ml', title: 'MLlib', sub: 'models on all the data: Course 10', icon: 'brain' },
        { type: 'item', id: 'a-lang', title: 'Python, SQL, Scala, Java, R', sub: 'this course: PySpark', icon: 'python' },
      ],
    },
    {
      type: 'group', id: 'engine', badge: 2, title: 'The engine', icon: 'spark', tone: 'store', dir: 'row', children: [
        { type: 'item', id: 'e-plan', title: 'Catalyst plans the query', sub: 'rewrites what you wrote into what is fast', icon: 'workflow' },
        { type: 'item', id: 'e-tasks', title: 'the driver splits it into tasks', sub: 'one per partition of the data', icon: 'layers' },
        { type: 'item', id: 'e-run', title: 'executors run the tasks', sub: 'in parallel, in memory, spilling to disk', icon: 'cpu' },
      ],
    },
    {
      type: 'group', id: 'where', badge: 3, title: 'Where it runs', icon: 'server', tone: 'infra', dir: 'row', children: [
        { type: 'item', id: 'w-local', title: 'your laptop: local[4]', sub: 'Courses 2 to 10', icon: 'screen' },
        { type: 'item', id: 'w-standalone', title: 'a standalone cluster', sub: 'Course 11', icon: 'network' },
        { type: 'item', id: 'w-k8s', title: 'Kubernetes, YARN', sub: 'the same job, more machines', icon: 'kubernetes' },
        { type: 'item', id: 'w-cloud', title: 'Databricks, EMR, Dataproc', sub: 'Spark as a service', icon: 'cloud' },
      ],
    },
    { type: 'note', id: 'note', tone: 'neutral', text: 'Spark reads and writes files and tables it does not own: Parquet, CSV, JSON, Delta, Kafka, databases. It is the compute, not the storage.' },
  ],
  edges: [
    { from: 'apis', to: 'engine', label: 'a plan' },
    { from: 'engine', to: 'where', label: 'tasks' },
  ],
}
