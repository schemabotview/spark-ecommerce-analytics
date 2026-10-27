import type { Section } from '../types'

export const whereAJobRuns: Section = {
  id: 'where-a-job-runs',
  title: 'Where a Spark job runs: driver, executors, tasks',
  scene: 'start-driver-executors',
  narration:
    "Before we go further, where does a Spark job actually run? This lab counts October's paid orders, then asks Spark what it did, and every number in this picture is its real answer. Start on the left. Our program is a Python process. Each Spark call crosses py four j into the Java side, where the driver lives. The driver does not process data itself. It turns our code into a plan, and when we ask for an answer, it splits the work into jobs, the jobs into stages, and the stages into tasks: one task for each partition of the data. The tasks run on executors. With master local four, there is one executor, inside the same Java process as the driver, with four task slots, so four tasks run at the same time. On a cluster, executors run on other machines, and the code does not change at all. On the right is the data: thirty one small files, which Spark packed into four partitions, one for each slot. Now the lab's output, at the bottom. Count found one thousand three hundred and eighty six paid orders, and the table shows the work behind it. Job zero is the read: one task opened one file to learn the column names from its header. Then count ran as two stages. In the first, four tasks ran side by side, each counting the paid orders in its own partition. In the second, a single task added those four counts together. That is the shape of nearly every Spark job: many tasks working on their own partitions in parallel, then a step that brings their results together.",
}
