import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { streamTree } from './tree'
import code from '../../../spine/stream/08-stream-static/project/shopwave/stream.py?raw'
import session from '../../../spine/stream/08-stream-static/session.txt?raw'

// §8 — stream-static joins. The batches, the dimension's size and the per-category table are the session's.
const out = outputOf(session, 'python -m explore.stream_static')
const [, batches, products] = out.match(/batches: (\d+) · dim_product: (\d+) products/)!
const rows = [...out.matchAll(/^\|\s*(\w+)\|\s*(\d+)\|\s*(\d+)\|\s*(\d+)\|$/gm)].map(([, c, v, a, p]) => ({ c, v, a, p }))

export const streamStaticJoin: SceneModel = ideFrame2({
  model: 'Stream joined to a table, each batch',
  tree: streamTree(['shopwave/stream.py', 'explore/stream_static.py', 'lake/gold/dim_product/'], 'shopwave/stream.py', ['explore/stream_static.py'], { 'lake/gold/dim_product/': 'Delta' }),
  editor: { file: 'shopwave/stream.py', code, ...view(code, 'def with_products('), highlight: linesFrom(code, 'items = events.select("event_id"', 'return items.join(products') },
  session,
  side: [
    {
      type: 'group', id: 'join', title: 'A stream joined to a table', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'j-stream', title: 'clicks from Kafka: one row per item', sub: 'explode(items), each batch', icon: 'kafka' },
        { type: 'item', id: 'j-static', title: `gold/dim_product: ${products} rows`, sub: 'a Delta table, read again every batch', icon: 'table' },
        { type: 'item', id: 'j-out', title: 'each item with its category', sub: `${batches} batches, counted per category`, icon: 'chart', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'live', title: 'Live, by category', tone: 'store', columns: ['category', 'views', 'carts', 'buys'],
      rows: rows.map((r) => ({ id: `r-${r.c}`, cells: [r.c, r.v, r.a, r.p] })),
    },
  ],
  edges: [
    { from: 'j-stream', to: 'j-static', label: 'join' },
    { from: 'j-static', to: 'j-out' },
  ],
})
