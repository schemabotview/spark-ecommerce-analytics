import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { SIDE_W, ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { analyticsTree, csvRows } from './tree'
import code from '../../../spine/analytics/05-funnel/project/shopwave/analytics.py?raw'
import session from '../../../spine/analytics/05-funnel/session.txt?raw'
import funnelCsv from '../../../spine/analytics/05-funnel/captured/out/funnel.csv?raw'

// §5 — the funnel. The bars are the captured CSV; the shares and conversion are the session's.
const out = outputOf(session, 'python -m explore.funnel')
const steps = csvRows(funnelCsv).map(([s, n]) => [s, +n] as [string, number])
const conversion = out.match(/conversion: ([\d.]+%)/)![1]
const share = Object.fromEntries([...out.matchAll(/^(\w+)\s+\d+ sessions\s+([\d.]+%)$/gm)].map((m) => [m[1], m[2]]))

export const analyticsFunnel: SceneModel = ideFrame2({
  model: 'Each step loses visitors',
  tree: analyticsTree(['shopwave/analytics.py', 'explore/funnel.py', 'explore/sessions.py'], 'shopwave/analytics.py', ['explore/funnel.py']),
  editor: { file: 'shopwave/analytics.py', code, ...view(code, 'STEPS = ', undefined, 0), highlight: linesFrom(code, 'reached = people.groupBy', 'return reached.agg') },
  session,
  side: [
    {
      type: 'plot', id: 'bars', title: 'October’s visits, by the furthest step reached', compact: true, w: SIDE_W - 34,
      x: { labels: steps.map(([s]) => ({ page_view: 'page', product_view: 'product', add_to_cart: 'cart', purchase: 'buy' } as Record<string, string>)[s] ?? s) }, y: { min: 0, max: Math.ceil(steps[0][1] / 1000) * 1000, label: 'sessions' },
      series: [{ kind: 'bar', points: steps.map(([, n], i) => [i, n] as [number, number]), tone: 'ingest' }],
    },
    {
      type: 'table', id: 'shares', title: `Conversion: ${conversion} of visits buy`, tone: 'store', columns: ['step', 'sessions', 'of all visits'],
      rows: steps.map(([s, n]) => ({ id: `s-${s}`, cells: [s, n, share[s]], tone: s === 'purchase' ? 'store' as const : undefined })),
    },
  ],
})
