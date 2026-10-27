import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { analyticsTree } from './tree'
import code from '../../../spine/analytics/07-rfm/project/shopwave/analytics.py?raw'
import session from '../../../spine/analytics/07-rfm/session.txt?raw'

// §7 — RFM segments. Every segment's numbers are the session's.
const out = outputOf(session, 'python -m explore.rfm')
const scored = out.match(/customers scored: (\d+)/)![1]
const segs = [...out.matchAll(/^(\w+)\s+(\d+) customers ·\s+([\d.]+) orders · last\s+(\d+) days ago · €\s+([\d,]+)$/gm)].map((m) => m.slice(1))

export const analyticsRfm: SceneModel = ideFrame({
  tree: analyticsTree(['shopwave/analytics.py', 'explore/cohorts.py', 'explore/rfm.py'], 'shopwave/analytics.py', ['explore/rfm.py']),
  editor: { file: 'shopwave/analytics.py', code, ...view(code, 'def rfm(', undefined, 0), highlight: [...linesFrom(code, 'score = lambda', '.withColumn("m"'), ...linesFrom(code, 'segment = (F.when')] },
  session,
  side: [
    {
      type: 'table', id: 'segments', title: `${scored} customers, five segments`, tone: 'store', columns: ['segment', 'customers', 'orders', 'last order', 'revenue'],
      rows: segs.map(([s, c, f, r, m]) => ({ id: `s-${s}`, cells: [s, c, f, `${r} d ago`, `€ ${m}`], tone: s === 'champions' ? 'store' as const : s === 'lost' ? 'consume' as const : undefined })),
    },
    {
      type: 'group', id: 'score', title: 'ntile(4) over all customers', icon: 'chart', tone: 'ingest', children: [
        { type: 'item', id: 's-r', title: 'R: days since the last order', sub: 'fewer is better: 4', icon: 'clock' },
        { type: 'item', id: 's-f', title: 'F: how many orders', sub: 'more is better', icon: 'layers' },
        { type: 'item', id: 's-m', title: 'M: how much spent', sub: 'more is better', icon: 'card' },
      ],
    },
    {
      type: 'table', id: 'rules', title: 'Segment rules, first match wins', tone: 'neutral', columns: ['segment', 'when'], rows: [
        { id: 'r-champ', cells: ['champions', 'R = 4 and F = 4'] },
        { id: 'r-loyal', cells: ['loyal', 'F ≥ 3'] },
        { id: 'r-new', cells: ['new', 'R = 4'] },
        { id: 'r-lost', cells: ['lost', 'R = 1'] },
        { id: 'r-occ', cells: ['occasional', 'the rest'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'A window with no partitionBy puts every customer in one partition, on one task: fine for two thousand, a bottleneck for millions (Spark warns in its log).' },
  ],
})
