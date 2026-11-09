import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { streamTree } from './tree'
import code from '../../../spine/stream/09-abandonment/project/shopwave/stream.py?raw'
import session from '../../../spine/stream/09-abandonment/session.txt?raw'

// §9 — cart abandonment with session windows. The alerts and the open visits are the session's.
const out = outputOf(session, 'python -m explore.abandonment')
const [, batches, alerts] = out.match(/batches: (\d+) · alerts: (\d+) · visits still open in state: (\d+)/)!
const first = [...out.matchAll(/^\s+(\S+)\s+(\d\d:\d\d)–(\d\d:\d\d)\s+(\d+) events/gm)].map(([, who, from, to, n]) => ({ who, from, to, n }))

export const streamAbandonment: SceneModel = ideFrame2({
  model: 'A session window per visitor',
  tree: streamTree(['shopwave/stream.py', 'explore/abandonment.py'], 'shopwave/stream.py', ['explore/abandonment.py']),
  editor: { file: 'shopwave/stream.py', code, ...view(code, 'def abandoned_carts('), highlight: linesFrom(code, 'visits = events.groupBy(visitor.alias("visitor")', 'return visits.filter("carted AND NOT bought")') },
  session,
  side: [
    {
      type: 'group', id: 'visit', title: 'One visitor, one session window', icon: 'user', tone: 'ingest', children: [
        { type: 'item', id: 'v-open', title: 'an event opens a window', sub: 'each new one within 30 minutes stretches it', icon: 'clock' },
        { type: 'item', id: 'v-quiet', title: '30 minutes of silence: the visit ends', sub: 'final once the watermark passes it', icon: 'layers' },
        { type: 'item', id: 'v-alert', title: 'carted, never bought: an alert', sub: 'written once, then the state freed', icon: 'bell', tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'alerts', title: `${alerts} alerts from one day, ${batches} batches`, tone: 'consume', columns: ['visitor', 'visit', 'events'],
      rows: first.map((a, i) => ({ id: `a${i}`, cells: [a.who, `${a.from}–${a.to}`, a.n] })),
    },
  ],
  edges: [
    { from: 'v-open', to: 'v-quiet' },
    { from: 'v-quiet', to: 'v-alert' },
  ],
})
