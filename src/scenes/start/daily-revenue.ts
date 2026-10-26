import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { explorer } from './tree'
import code from '../../../spine/start/05-daily-revenue/project/daily_revenue.py?raw'
import session from '../../../spine/start/05-daily-revenue/session.txt?raw'

// §5 — daily revenue, and what a write leaves behind. The step is volatile for the part file's
// UUID only (spine.py masks it), so the part file's name is read from the session.
const listing = outputOf(session, 'ls out/daily_revenue').split('\n')
const part = listing.find((f) => f.startsWith('part-'))!
const short = part.replace(/^(part-\d+)-.*(\.csv)$/, '$1-…$2')

export const startDailyRevenue: SceneModel = ideFrame({
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
      type: 'table', id: 'tasks', title: 'Who does each step', tone: 'infra', columns: ['step', 'done by'], rows: [
        { id: 't-read', cells: ['read, filter', 'each task, on its own partition'] },
        { id: 't-shuffle', cells: ['groupBy', 'a shuffle: rows move to their day’s task'], tone: 'infra' },
        { id: 't-write', cells: ['write', 'each task writes its own part file'] },
      ],
    },
    {
      type: 'table', id: 'folder', title: 'ls out/daily_revenue', tone: 'store', columns: ['file', 'what it is'], rows: [
        { id: 'f-success', cells: ['_SUCCESS', 'empty: the write finished'] },
        { id: 'f-part', cells: [short, 'CSV: a header, then one line per day'], tone: 'store' },
      ],
    },
    { type: 'note', id: 'note', tone: 'store', text: 'Spark writes one file per partition, in parallel. Here Spark merged the tiny partitions into one before writing, so there is one part file.' },
  ],
  edges: [
    { from: 'j-read', to: 'j-filter' },
    { from: 'j-filter', to: 'j-group' },
    { from: 'j-group', to: 'j-write' },
  ],
})
