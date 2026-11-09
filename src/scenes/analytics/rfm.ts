import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { analyticsTree } from './tree'
import code from '../../../spine/analytics/07-rfm/project/shopwave/analytics.py?raw'
import session from '../../../spine/analytics/07-rfm/session.txt?raw'

// §7 — RFM segments. Every segment's numbers are the session's.
const out = outputOf(session, 'python -m explore.rfm')
const scored = out.match(/customers scored: (\d+)/)![1]
const segs = [...out.matchAll(/^(\w+)\s+(\d+) customers ·\s+([\d.]+) orders · last\s+(\d+) days ago · €\s+([\d,]+)$/gm)].map((m) => m.slice(1))

export const analyticsRfm: SceneModel = ideFrame2({
  model: 'Score each customer; segment by rules',
  tree: analyticsTree(['shopwave/analytics.py', 'explore/cohorts.py', 'explore/rfm.py'], 'shopwave/analytics.py', ['explore/rfm.py']),
  editor: { file: 'shopwave/analytics.py', code, ...view(code, 'def rfm(', undefined, 0), highlight: [...linesFrom(code, 'score = lambda', '.withColumn("m"'), ...linesFrom(code, 'segment = (F.when')] },
  session,
  side: [
    {
      type: 'group', id: 'score', title: 'ntile(4) over all customers', icon: 'chart', tone: 'ingest', children: [
        { type: 'item', id: 's-r', title: 'R: days since the last order', sub: 'fewer is better: 4', icon: 'clock' },
        { type: 'item', id: 's-f', title: 'F: how many orders', sub: 'more is better', icon: 'layers' },
        { type: 'item', id: 's-m', title: 'M: how much spent', sub: 'more is better', icon: 'card' },
      ],
    },
    {
      type: 'table', id: 'segments', title: `${scored} customers, five segments`, tone: 'store', columns: ['segment', 'customers', 'revenue'],
      rows: segs.map(([s, c, , , m]) => ({ id: `s-${s}`, cells: [s, c, `€ ${m}`], tone: s === 'champions' ? 'store' as const : s === 'lost' ? 'consume' as const : undefined })),
    },
  ],
  edges: [{ from: 'score', to: 'segments', label: 'rules' }],
})
