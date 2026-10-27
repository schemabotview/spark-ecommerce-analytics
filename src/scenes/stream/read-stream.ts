import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { streamTree } from './tree'
import code from '../../../spine/stream/02-read-stream/project/shopwave/stream.py?raw'
import session from '../../../spine/stream/02-read-stream/session.txt?raw'

// §2 — readStream. The record's columns and the events per partition are the session's.
const out = outputOf(session, 'python -m explore.read_stream')
const columns = out.match(/a record: (.+)/)![1].split(', ').map((c) => c.split(':'))
const read = out.match(/events read: (\d+)/)![1]
const parts = [...out.matchAll(/^\|\s+(\d+)\|\s+(\d+)\|$/gm)].map(([, p, n]) => ({ p, n }))

export const streamReadStream: SceneModel = ideFrame({
  tree: streamTree(['shopwave/tracker.py', 'shopwave/stream.py', 'explore/read_stream.py'], 'shopwave/stream.py', ['shopwave/stream.py', 'explore/read_stream.py']),
  editor: { file: 'shopwave/stream.py', code, ...view(code, 'def kafka(', 'e.*", "partition", "offset")'), highlight: [...linesFrom(code, 'reader = (spark.readStream'), ...linesFrom(code, 'event = F.from_json')] },
  session,
  side: [
    {
      type: 'table', id: 'record', title: 'A Kafka record, as a row', tone: 'ingest', columns: ['column', 'type'],
      rows: columns.map(([c, t]) => ({ id: `c-${c}`, cells: [c, t], tone: c === 'value' ? 'ingest' as const : undefined })),
    },
    {
      type: 'group', id: 'parse', title: 'value → an event', icon: 'code', tone: 'store', children: [
        { type: 'item', id: 'p-bytes', title: 'value: bytes', sub: 'Kafka stores no types', icon: 'file' },
        { type: 'item', id: 'p-json', title: 'from_json(…, schemas.CLICKS)', sub: 'bronze’s schema, from Course 3', icon: 'code' },
        { type: 'item', id: 'p-row', title: `${read} events, as columns`, sub: 'partition and offset kept', icon: 'table', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'parts', title: 'Read per partition', tone: 'neutral', columns: ['partition', 'events'],
      rows: parts.map((r) => ({ id: `r${r.p}`, cells: [r.p, r.n] })),
    },
  ],
  edges: [
    { from: 'p-bytes', to: 'p-json' },
    { from: 'p-json', to: 'p-row' },
  ],
})
