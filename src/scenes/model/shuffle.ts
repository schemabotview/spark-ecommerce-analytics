import type { Item, SceneModel } from '@graphlearning/graphl-flow'
import { outputOf } from '../lab'
import session from '../../../spine/model/03-shuffle/session.txt?raw'

// §3 — ◆ full scene: the shuffle. Revenue by country over fact_sales; every number is the lab's,
// read from Spark's status store (the stage table) and the final plan (AQE's coalesced read).
const out = outputOf(session, 'python -m explore.shuffle')
const [, rows, parts] = out.match(/fact_sales: (\d+) rows in (\d+) partitions/)!
const shufflePartitions = out.match(/shuffle\.partitions = (\d+)/)![1]
const countries = out.match(/countries: (\d+)/)![1]
const stages = [...out.matchAll(/stage (\d+):\s+(\d+) tasks · read\s+(\d+) rows from files · shuffle write\s+(\d+) rows\s+(\d+) B · shuffle read\s+(\d+) rows/g)]
  .map(([, id, tasks, read, wRows, wBytes, rRows]) => ({ id, tasks, read, wRows, wBytes, rRows }))
const [map, reduce] = stages
const coalesced = out.includes('AQEShuffleRead coalesced')

const chip = (id: string, title: string, tone?: Item['tone']): Item => ({ type: 'item', id, title, chip: true, tone })

export const modelShuffle: SceneModel = {
  title: 'The shuffle: where a groupBy moves data',
  sub: `Revenue by country: ${rows} order lines in, ${countries} rows out, two stages`,
  nodes: [
    {
      type: 'group', id: 'flow', bare: true, dir: 'row', children: [
        {
          type: 'group', id: 'map', badge: 1, title: `Stage ${map.id}: ${map.tasks} map tasks`, sub: 'each reads its partition, sums per country', icon: 'cpu', tone: 'ingest', children: [
            { type: 'group', id: 'map-tasks', dir: 'grid', cols: 2, children: Array.from({ length: +map.tasks }, (_, i) => chip(`m${i}`, `task ${i}: partial sums`)) },
            { type: 'item', id: 'map-read', title: `${map.read} rows read from ${parts} file partitions`, icon: 'file' },
          ],
        },
        {
          type: 'group', id: 'files', badge: 2, title: 'Shuffle files', sub: `${shufflePartitions} partitions: hash(country) decides`, icon: 'disk', tone: 'infra', children: [
            { type: 'item', id: 'write', title: `${map.wRows} rows · ${map.wBytes} bytes written`, sub: 'a few partial sums per task, not the rows', icon: 'disk' },
            { type: 'item', id: 'boundary', title: 'the stage boundary', sub: 'every map task must finish first', icon: 'layers' },
          ],
        },
        {
          type: 'group', id: 'reduce', badge: 3, title: `Stage ${reduce.id}: ${reduce.tasks} reduce task`, sub: coalesced ? `${shufflePartitions} partitions, coalesced by AQE` : 'one per partition', icon: 'cpu', tone: 'store', children: [
            chip('r0', `reads ${reduce.rRows} partial sums`, 'store'),
            { type: 'item', id: 'result', title: `${countries} countries`, sub: 'one total each', icon: 'check' },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'proof', title: 'The stage table, from Spark’s status store', icon: 'table', tone: 'neutral', children: [
        {
          type: 'table', id: 'stages', columns: ['stage', 'tasks', 'rows read', 'shuffle write', 'shuffle read'],
          rows: stages.map((s) => ({ id: `s${s.id}`, cells: [s.id, s.tasks, s.read, `${s.wRows} rows · ${s.wBytes} B`, `${s.rRows} rows`] })),
        },
      ],
    },
  ],
  edges: [
    { from: 'map', to: 'files', label: 'write' },
    { from: 'files', to: 'reduce', label: 'read' },
  ],
}
