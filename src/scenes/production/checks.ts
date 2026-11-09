import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { prodTree } from './tree'
import code from '../../../spine/production/03-checks/project/shopwave/checks.py?raw'
import session from '../../../spine/production/03-checks/session.txt?raw'

// §3 — data quality as code. Every check's mark and bad-row count are the session's.
const out = outputOf(session, 'python -m shopwave.checks; echo "exit code $?"')
const checks = [...out.matchAll(/^([✓✗!]) (.+?)\s+(\d+) bad rows$/gm)].map(([, mark, what, bad]) => ({ mark, what, bad }))

export const productionChecks: SceneModel = ideFrame2({
  model: 'Checks after gold stop a bad night',
  tree: prodTree(['shopwave/checks.py', 'shopwave/jobs.py'], 'shopwave/checks.py', ['shopwave/checks.py']),
  editor: { file: 'shopwave/checks.py', code, ...view(code, 'ROWS = [', 'LEFT ANTI JOIN dim_product p'), highlight: linesFrom(code, 'ROWS = [', '("error", "dim_product"') },
  session,
  side: [
    {
      type: 'table', id: 'checks', title: 'After gold: every check', tone: 'store', columns: ['', 'check', 'bad rows'],
      rows: checks.map((c, i) => ({ id: `c${i}`, cells: [c.mark, c.what, c.bad], tone: c.mark === '✓' ? undefined : 'consume' as const })),
    },
    {
      type: 'group', id: 'night', title: 'In the nightly run', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'n-gold', title: 'gold is built', sub: 'Delta tables, one commit each', icon: 'table' },
        { type: 'item', id: 'n-check', title: 'checks run on it', sub: 'each a query, each a count', icon: 'check' },
        { type: 'item', id: 'n-stop', title: 'an error: the night stops', sub: 'nothing builds on bad data', icon: 'zap', tone: 'consume' },
      ],
    },
  ],
  edges: [
    { from: 'n-gold', to: 'n-check' },
    { from: 'n-check', to: 'n-stop' },
  ],
})
