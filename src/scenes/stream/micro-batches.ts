import type { Item, SceneModel } from '@graphlearning/graphl-flow'
import { terminal } from '../ide'
import { outputOf } from '../lab'
import session from '../../../spine/stream/03-micro-batches/session.txt?raw'

// §3 — ◆ full scene: micro-batches. Every batch's rows and offsets are the lab's, from the query's
// progress reports; the checkpoint's folders are its listing.
const out = outputOf(session, 'python -m explore.micro_batches')
const batches = [...out.matchAll(/batch (\d+):\s+(\d+) rows · read up to (.+)/g)].map(([, id, rows, upto]) => ({ id, rows, upto }))
const folders = out.match(/checkpoint\/: (.+)/)![1].split(', ').filter((f) => !f.startsWith('.'))

const chip = (id: string, title: string, tone?: Item['tone']): Item => ({ type: 'item', id, title, chip: true, tone })

export const streamMicroBatches: SceneModel = {
  title: 'A stream is a series of small batch jobs',
  sub: `maxOffsetsPerTrigger 300: ${batches.length} batches, each a Spark job over a range of offsets`,
  nodes: [
    {
      type: 'group', id: 'loop', bare: true, dir: 'row', children: [
        {
          type: 'group', id: 'trigger', badge: 1, title: 'Trigger', sub: 'availableNow: all there is, in batches', icon: 'clock', tone: 'ingest', children: [
            { type: 'item', id: 't-plan', title: 'plan the next range', sub: 'from the last offsets to now, ≤ 300', icon: 'search' },
          ],
        },
        {
          type: 'group', id: 'offsets', badge: 2, title: 'offsets/N, written first', sub: 'the range, before any work', icon: 'disk', tone: 'infra',
          children: batches.map((b) => chip(`o${b.id}`, `batch ${b.id}: ${b.upto}`)),
        },
        {
          type: 'group', id: 'batch', badge: 3, title: 'The batch: a Spark job', sub: 'read the range, run the query', icon: 'spark', tone: 'store',
          children: batches.map((b) => chip(`b${b.id}`, `batch ${b.id}: ${b.rows} rows`, 'store')),
        },
        {
          type: 'group', id: 'commit', badge: 4, title: 'sink, then commits/N', sub: 'done: the next batch may start', icon: 'check', tone: 'store', children: [
            { type: 'item', id: 'c-folders', title: `checkpoint/: ${folders.join(', ')}`, sub: 'what a restart reads (§4)', icon: 'folder' },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'proof', title: 'The lab, run: the query’s own progress reports', icon: 'terminal', tone: 'neutral', children: [
        { type: 'code', id: 'out', terminal: true, filename: 'terminal — shopwave', code: terminal(session) },
      ],
    },
  ],
  edges: [
    { from: 'trigger', to: 'offsets', label: 'range' },
    { from: 'offsets', to: 'batch', label: 'run' },
    { from: 'batch', to: 'commit', label: 'done' },
  ],
}
