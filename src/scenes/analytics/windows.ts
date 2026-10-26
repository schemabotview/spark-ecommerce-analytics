import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { analyticsTree } from './tree'
import code from '../../../spine/analytics/02-windows/project/shopwave/analytics.py?raw'
import session from '../../../spine/analytics/02-windows/session.txt?raw'

// §2 — window functions. The ranking per category is the session's.
const out = outputOf(session, 'python -m explore.windows')
const cats = [...out.matchAll(/^(\w+)\s+1\. (.+?) · 2\. (.+?) · 3\. (.+)$/gm)].map((m) => m.slice(1))

export const analyticsWindows: SceneModel = ideFrame({
  tree: analyticsTree(['shopwave/analytics.py', 'explore/kpis.py', 'explore/windows.py'], 'shopwave/analytics.py', ['explore/windows.py']),
  editor: { file: 'shopwave/analytics.py', code, ...view(code, 'def top_products(', undefined, 0), highlight: linesFrom(code, 'in_category = Window', 'ranked = revenue') },
  session,
  side: [
    {
      type: 'group', id: 'how', title: 'rank() over a window', icon: 'layers', tone: 'ingest', children: [
        { type: 'item', id: 'h-part', title: 'partitionBy("category")', sub: 'one window per category', icon: 'layers' },
        { type: 'item', id: 'h-order', title: 'orderBy(desc("revenue"))', sub: 'the best seller first, inside it', icon: 'filter' },
        { type: 'item', id: 'h-rank', title: 'rank(): 1, 2, 3 …', sub: 'every row KEPT, a number added', icon: 'check', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'top', title: 'Top three per category, 2026', tone: 'store', columns: ['category', '1', '2', '3'],
      rows: cats.map(([c, a, b, d]) => ({ id: `c-${c}`, cells: [c, a, b, d] })),
    },
    { type: 'note', id: 'note', tone: 'ingest', text: 'A groupBy collapses each category to one row. A window keeps every row and computes over its neighbours: a rank, a running total, the row before.' },
  ],
  edges: [{ from: 'h-part', to: 'h-order' }, { from: 'h-order', to: 'h-rank' }],
})
