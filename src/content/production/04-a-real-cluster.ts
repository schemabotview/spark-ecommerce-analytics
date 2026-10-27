import type { Section } from '../types'

export const aRealCluster: Section = {
  id: 'a-real-cluster',
  title: 'A real cluster',
  scene: 'production-cluster',
  narration:
    "Everything so far ran in local mode: driver and executors in one process. Now the same code runs on a cluster: a standalone Spark master and two workers, started by cluster dot sh. pip's PySpark has no start master script, but it ships the script those call, spark daemon, so the cluster needs nothing beyond the venv. Each worker offers two cores and a gigabyte. The job is submitted with spark submit and a properties file. Two things change once executors are other processes. Python code must travel to them, so the package is zipped and listed as a py file. And whatever the driver's JVM needs from its first moment, the log configuration and Delta's jars, goes in the properties file, because spark submit starts that JVM before session dot py runs; the first run failed to find Delta for exactly that reason, and session dot py now leaves the master to spark submit. The run reports the master's address, two executors and four cores, and how many of revenue by country's tasks each executor ran: both took part, unevenly, and the split changes from run to run, because a task goes to whichever executor has a free core. On real machines, one more thing changes: the data must sit on storage every machine can reach.",
}
