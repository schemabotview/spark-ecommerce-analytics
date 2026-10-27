import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { analyticsTree } from './tree'
import code from '../../../spine/analytics/06-cohorts/project/shopwave/analytics.py?raw'
import session from '../../../spine/analytics/06-cohorts/session.txt?raw'

// §6 — cohort retention. The table is the session's, month by month.
const out = outputOf(session, 'python -m explore.cohorts')
const rows = [...out.matchAll(/^(\d{4}-\d{2})\s+(\d+)\s+(.+)$/gm)].map((m) => [m[1], m[2], ...m[3].trim().split(/\s+/)])

export const analyticsCohorts: SceneModel = ideFrame({
  tree: analyticsTree(['shopwave/analytics.py', 'explore/cohorts.py', 'explore/funnel.py'], 'shopwave/analytics.py', ['explore/cohorts.py']),
  editor: { file: 'shopwave/analytics.py', code, ...view(code, 'def cohorts(', undefined, 0), highlight: [...linesFrom(code, 'first = Window', 'orders = orders.withColumn'), ...linesFrom(code, 'active = later.groupBy', 'F.countDistinct')] },
  session,
  side: [
    {
      type: 'table', id: 'grid', title: 'Of each month’s new customers, back after n months', tone: 'store', columns: ['first order', 'size', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6'],
      rows: rows.map((r) => ({ id: `c-${r[0]}`, cells: r })),
    },
    {
      type: 'group', id: 'how', title: 'Three steps', icon: 'users', tone: 'ingest', children: [
        { type: 'item', id: 'h-cohort', title: 'cohort = the month of the first order', sub: 'min(month) over each customer: a window', icon: 'users' },
        { type: 'item', id: 'h-age', title: 'age = months since', sub: 'months_between(month, cohort)', icon: 'clock' },
        { type: 'item', id: 'h-pivot', title: 'pivot on age', sub: 'distinct customers per cell, ÷ month 0', icon: 'table', tone: 'store' },
      ],
    },
    { type: 'note', id: 'note', tone: 'store', text: 'January’s cohort is the biggest (the year starts the data) and its customers keep coming back: around half order again in any later month.' },
  ],
  edges: [{ from: 'h-cohort', to: 'h-age' }, { from: 'h-age', to: 'h-pivot' }],
})
