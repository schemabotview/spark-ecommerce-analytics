import type { Item, SceneModel } from '@graphlearning/graphl-flow'
import { outputOf } from '../lab'
import session from '../../../spine/start/03-driver-executors/session.txt?raw'

// §3 — ◆ full scene: where a job runs. The lab counts October's paid orders and then asks Spark what
// it did; every number here is parsed from that real output (spine/start/03-driver-executors).
// local[4] puts the driver and ONE executor in one JVM on this machine; a cluster (Course 11)
// spreads executors over machines, and nothing in the code changes.
const out = outputOf(session, 'python where_it_runs.py')
const [, master, executors, slots] = out.match(/master (\S+): (\d+) executor, (\d+) task slots/)!
const [, files, partitions] = out.match(/October: (\d+) files, read as (\d+) partitions/)!
const paid = out.match(/paid orders: (\d+)/)![1]
const stages = [...out.matchAll(/job (\d+), stage (\d+): (\d+) tasks?/g)].map(([, job, stage, tasks]) => ({ job, stage, tasks: +tasks }))
const why = (s: (typeof stages)[number], i: number) =>
  i === 0 ? 'read: the header line of one file' : s.tasks > 1 ? `count: each task counts one partition` : `count: add up the ${stages[i - 1].tasks} counts`

const chip = (id: string, title: string): Item => ({ type: 'item', id, title, chip: true })

export const startDriverExecutors: SceneModel = {
  title: 'Where a Spark job runs',
  sub: `${master}: the driver and ${executors} executor, in one JVM on this machine`,
  nodes: [
    {
      type: 'group', id: 'runtime', bare: true, dir: 'row', children: [
        {
          type: 'group', id: 'program', badge: 1, title: 'Your program', sub: 'a Python process', icon: 'python', tone: 'source', children: [
            { type: 'item', id: 'src', title: 'where_it_runs.py', sub: 'counts October’s paid orders', icon: 'file' },
            { type: 'item', id: 'py4j', title: 'py4j', sub: 'every call crosses to the JVM', icon: 'network' },
          ],
        },
        {
          type: 'group', id: 'driver', badge: 2, title: 'Driver', sub: 'plans the work, hands out tasks', icon: 'spark', tone: 'ingest', spread: true, children: [
            { type: 'item', id: 'd-session', title: 'SparkSession', sub: 'your entry point into Spark', icon: 'code' },
            { type: 'item', id: 'd-plan', title: 'an action → a job', sub: 'count() asks for an answer', icon: 'workflow' },
            { type: 'item', id: 'd-stages', title: 'a job → stages → tasks', sub: 'one task per partition', icon: 'layers' },
          ],
        },
        {
          type: 'group', id: 'executor', badge: 3, title: 'Executor', sub: `${slots} task slots: ${slots} tasks at a time`, icon: 'cpu', tone: 'infra', children: [
            { type: 'group', id: 'slots', dir: 'grid', cols: 2, children: Array.from({ length: +slots }, (_, i) => chip(`slot-${i + 1}`, `Task slot ${i + 1}`)) },
            { type: 'item', id: 'x-note', title: 'local mode: inside the driver’s JVM', sub: 'on a cluster, executors run on other machines', icon: 'server' },
          ],
        },
        {
          type: 'group', id: 'data', badge: 4, title: 'The data', sub: `${files} CSV files of orders`, icon: 'folder', tone: 'store', children: [
            { type: 'group', id: 'parts', dir: 'grid', cols: 2, children: Array.from({ length: +partitions }, (_, i) => chip(`part-${i}`, `Partition ${i}`)) },
            { type: 'item', id: 'p-note', title: `${files} files → ${partitions} partitions`, sub: 'small files are packed together', icon: 'layers' },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'proof', bare: true, dir: 'row', children: [
        {
          type: 'group', id: 'run', title: 'The lab, run', icon: 'terminal', tone: 'source', children: [
            { type: 'code', id: 'term', terminal: true, filename: 'terminal — shopwave', code: `$ python where_it_runs.py\n${out}` },
          ],
        },
        {
          type: 'group', id: 'what', title: `What count() did: ${paid} paid orders`, icon: 'workflow', tone: 'ingest', children: [
            {
              type: 'table', id: 'jobs', columns: ['job', 'stage', 'tasks', 'doing'],
              rows: stages.map((s, i) => ({ id: `j${s.job}`, cells: [s.job, s.stage, s.tasks, why(s, i)], tone: s.tasks > 1 ? 'infra' as const : undefined })),
            },
            { type: 'note', id: 'jobs-note', tone: 'ingest', text: `The ${stages.find((s) => s.tasks > 1)!.tasks} tasks of one stage ran side by side, one per partition. The driver only collected their counts.` },
          ],
        },
      ],
    },
  ],
  edges: [
    { from: 'program', to: 'driver', label: 'py4j' },
    { from: 'driver', to: 'executor', label: 'tasks' },
    { from: 'executor', to: 'data', label: 'read' },
  ],
}
