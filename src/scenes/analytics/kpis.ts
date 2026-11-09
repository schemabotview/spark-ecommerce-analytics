import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { SIDE_W, ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { analyticsTree, csvRows } from './tree'
import code from '../../../spine/analytics/01-kpis/project/shopwave/analytics.py?raw'
import session from '../../../spine/analytics/01-kpis/session.txt?raw'
import daily from '../../../spine/analytics/01-kpis/captured/out/daily_kpis.csv?raw'

// §1 — KPIs. The year's totals and the top days are the session's; the chart is the captured CSV
// the script wrote (one point per day), so every point is real.
const out = outputOf(session, 'python -m explore.kpis')
const [, days, orders, gmv] = out.match(/(\d+) days · (\d+) paid orders · GMV € ([\d.]+)/)!
const aov = out.match(/average order value: € ([\d.]+)/)![1]
const median = out.match(/median day: ([\d.]+)/)![1]
const points = csvRows(daily).map(([, , g], i) => [i + 1, Math.round(+g)] as [number, number])
const peak = Math.max(...points.map((p) => p[1]))

export const analyticsKpis: SceneModel = ideFrame2({
  model: 'A year of KPIs',
  tree: analyticsTree(['shopwave/analytics.py', 'shopwave/gold.py', 'explore/kpis.py'], 'shopwave/analytics.py', ['shopwave/analytics.py', 'explore/kpis.py']),
  editor: { file: 'shopwave/analytics.py', code, highlight: linesFrom(code, '.groupBy("order_date")', '.withColumn("aov"') },
  session,
  side: [
    {
      type: 'plot', id: 'gmv', title: `GMV per day, 2026 (€): the spike is Black Friday`, compact: true, w: SIDE_W - 34,
      x: { min: 0, max: 366, step: 61, label: 'day of the year' }, y: { min: 0, max: Math.ceil(peak / 20000) * 20000, label: '€' },
      series: [{ kind: 'line', points, tone: 'ingest' }],
    },
    {
      type: 'table', id: 'year', title: `The year: ${days} days`, tone: 'store', columns: ['KPI', 'value'], rows: [
        { id: 'y-orders', cells: ['paid orders', orders] },
        { id: 'y-gmv', cells: ['GMV', `€ ${gmv}`], tone: 'store' },
        { id: 'y-aov', cells: ['average order value', `€ ${aov}`] },
        { id: 'y-median', cells: ['median day', `€ ${median}`] },
      ],
    },
  ],
})
