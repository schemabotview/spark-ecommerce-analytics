import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { explorer } from './tree'
import code from '../../../spine/start/05-daily-revenue/project/daily_revenue.py?raw'
import session from '../../../spine/start/05-daily-revenue/session.txt?raw'

// §5 — daily revenue, and what a write leaves behind. The step is volatile for the part file's
// UUID only (spine.py masks it), so the part file's name is read from the session.
const listing = outputOf(session, 'ls out/daily_revenue').split('\n')
const part = listing.find((f) => f.startsWith('part-'))!
const short = part.replace(/^(part-\d+)-.*(\.csv)$/, '$1-…$2')

export const startDailyRevenue: SceneModel = ideFrame2({
  model: 'Read, filter, shuffle, write',
  tree: explorer({ conf: 'plain', logs: true, out: true, session: 'plain', py: [['first_job.py', undefined], ['lazy.py', undefined], ['daily_revenue.py', 'active']] }),
  editor: { file: 'daily_revenue.py', code, highlight: [...linesFrom(code, '.groupBy(', '.alias("revenue")'), ...linesFrom(code, 'daily.write')] },
  session,
  side: [
    {
      type: 'group', id: 'job', title: 'October → revenue per day', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'j-read', title: 'read: 31 files', sub: 'every order in October', icon: 'file' },
        { type: 'item', id: 'j-filter', title: 'filter: paid', sub: 'each partition on its own', icon: 'filter' },
        { type: 'item', id: 'j-group', title: 'groupBy(day) · count, sum', sub: 'one day’s orders must meet in one place', icon: 'layers', tone: 'infra' },
        { type: 'item', id: 'j-write', title: 'write.csv(out/daily_revenue)', sub: 'a folder, not a file', icon: 'disk', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'folder', title: 'ls out/daily_revenue', tone: 'store', columns: ['file', 'what it is'], rows: [
        { id: 'f-success', cells: ['_SUCCESS', 'empty: it finished'] },
        { id: 'f-part', cells: [short, 'CSV: a line per day'], tone: 'store' },
      ],
    },
  ],
  edges: [
    { from: 'j-read', to: 'j-filter' },
    { from: 'j-filter', to: 'j-group' },
    { from: 'j-group', to: 'j-write' },
  ],
})
