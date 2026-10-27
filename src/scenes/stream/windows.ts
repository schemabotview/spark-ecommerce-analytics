import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { streamTree } from './tree'
import code from '../../../spine/stream/05-windows/project/shopwave/stream.py?raw'
import session from '../../../spine/stream/05-windows/session.txt?raw'

// §5 — live revenue in tumbling windows. The busiest hours are the session's.
const out = outputOf(session, 'python -m explore.live_revenue')
const [, batches, hours] = out.match(/batches: (\d+) · hours with sales: (\d+)/)!
const top = [...out.matchAll(/(\d\d-\d\d \d\d:\d\d)–(\d\d:\d\d)\s+(\d+) orders\s+€\s+([\d.]+)/g)].map(([, from, to, orders, eur]) => ({ from, to, orders, eur }))

export const streamWindows: SceneModel = ideFrame({
  tree: streamTree(['shopwave/stream.py', 'explore/live_revenue.py'], 'shopwave/stream.py', ['explore/live_revenue.py']),
  editor: { file: 'shopwave/stream.py', code, ...view(code, 'def purchases(', 'F.sum("revenue").alias("revenue"))'), highlight: linesFrom(code, 'return purchases.groupBy(F.window("event_ts", width))') },
  session,
  side: [
    {
      type: 'table', id: 'top', title: `The busiest of ${hours} hours, after ${batches} batches`, tone: 'store', columns: ['window', 'orders', 'revenue'],
      rows: top.map((t, i) => ({ id: `w${i}`, cells: [`${t.from}–${t.to}`, t.orders, `€ ${t.eur}`], tone: i === 0 ? 'store' as const : undefined })),
    },
    {
      type: 'group', id: 'tumble', title: 'window("event_ts", "1 hour")', icon: 'clock', tone: 'ingest', children: [
        { type: 'item', id: 'w-event', title: 'a purchase at 15:42', sub: 'its event time, not when it arrived', icon: 'card' },
        { type: 'item', id: 'w-bucket', title: 'lands in 15:00–16:00', sub: 'tumbling: one window each, no overlap', icon: 'layers' },
        { type: 'item', id: 'w-state', title: 'the window’s sum, kept in state', sub: 'updated by every batch that adds to it', icon: 'memory', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'modes', title: 'Output modes', tone: 'neutral', columns: ['mode', 'writes after a batch'], rows: [
        { id: 'o-complete', cells: ['complete', 'the whole result table'], tone: 'store' },
        { id: 'o-update', cells: ['update', 'the rows that changed'] },
        { id: 'o-append', cells: ['append', 'final rows only, once (§6)'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'Complete mode writes the whole result table after every batch, and keeps every window in state for ever. Fine for a day; §6 shows how to let windows close.' },
  ],
  edges: [
    { from: 'w-event', to: 'w-bucket' },
    { from: 'w-bucket', to: 'w-state' },
  ],
})
