import type { SceneModel } from '@graphlearning/graphl-flow'
import { terminal } from '../ide'
import { outputOf } from '../lab'
import session from '../../../spine/scale/02-memory/session.txt?raw'

// §2 — ◆ full scene: executor memory. Every size is the lab's, computed from the running JVM and
// Spark's own settings (spark.memory.fraction, spark.memory.storageFraction).
const out = outputOf(session, 'python -m explore.memory')
const mb = (label: string) => out.match(new RegExp(`${label}\\s+(\\d+) MB`))![1]
const [heap, reserved, user, unified, storage, execution, ui] =
  ['JVM heap Spark sees:', 'reserved:', 'user memory \\(40%\\):', 'unified \\(60%\\):', 'storage, protected:', 'execution:', 'the UI\'s storage memory:'].map(mb)

export const scaleMemory: SceneModel = {
  title: 'Executor memory: where a gigabyte goes',
  sub: `spark.driver.memory 1g: a ${heap} MB heap, ${unified} MB of it for Spark’s data`,
  nodes: [
    {
      type: 'group', id: 'heap', bare: true, dir: 'row', children: [
        {
          type: 'group', id: 'jvm', badge: 1, title: `The JVM heap: ${heap} MB`, sub: 'local mode: the driver is the executor', icon: 'memory', tone: 'infra', children: [
            { type: 'item', id: 'reserved', title: `reserved: ${reserved} MB`, sub: 'Spark’s own, always', icon: 'lock' },
            { type: 'item', id: 'user', title: `user memory: ${user} MB`, sub: '40%: your objects, UDF data', icon: 'user' },
            {
              type: 'group', id: 'unified', title: `unified: ${unified} MB`, sub: '60%: shared, the boundary moves', icon: 'layers', tone: 'store', children: [
                { type: 'item', id: 'storage', title: `storage: ${storage} MB protected`, sub: 'cached DataFrames, broadcasts', icon: 'disk' },
                { type: 'item', id: 'execution', title: `execution: ${execution} MB`, sub: 'shuffles, joins, sorts, aggregations', icon: 'cpu' },
              ],
            },
          ],
        },
        {
          type: 'group', id: 'rules', badge: 2, title: 'When it runs out', icon: 'zap', tone: 'ingest', children: [
            { type: 'item', id: 'borrow', title: 'execution borrows from storage', sub: 'evicts cached blocks above the protected half', icon: 'layers' },
            { type: 'item', id: 'spill', title: 'then a task spills to disk', sub: 'sorted runs written, merged later: slow, not fatal (§3)', icon: 'disk' },
            { type: 'item', id: 'oom', title: 'user memory has no spill', sub: 'too much there is an OutOfMemoryError', icon: 'zap', tone: 'consume' },
            { type: 'item', id: 'overhead', title: 'on a cluster: + memoryOverhead', sub: 'outside the heap: 10%, at least 384 MB', icon: 'server' },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'proof', title: `The lab, run: the Spark UI would say ${ui} MB`, icon: 'terminal', tone: 'neutral', children: [
        { type: 'code', id: 'out', terminal: true, filename: 'terminal — shopwave', code: terminal(session) },
      ],
    },
  ],
  edges: [
    { from: 'execution', to: 'borrow' },
    { from: 'borrow', to: 'spill' },
  ],
}
