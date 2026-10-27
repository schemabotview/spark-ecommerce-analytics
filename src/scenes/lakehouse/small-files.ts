import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { lakeTree } from './tree'
import code from '../../../spine/lakehouse/09-small-files/project/explore/small_files.py?raw'
import session from '../../../spine/lakehouse/09-small-files/session.txt?raw'

// §9 — small files: OPTIMIZE and VACUUM. Every count is the session's.
const out = outputOf(session, 'python -m explore.small_files')
const appended = out.match(/after 31 nightly appends: (\d+) files/)![1]
const [, removed, added] = out.match(/OPTIMIZE: (\d+) files → (\d+)/)!
const deleted = out.match(/Deleted (\d+) files and directories/)![1]
const rows = out.match(/VACUUM: rows still (\d+)/)![1]
const onDisk = outputOf(session, 'ls out/daily_sales | grep -c parquet').trim()

export const lakehouseSmallFiles: SceneModel = ideFrame({
  tree: lakeTree(['explore/small_files.py', 'out/daily_sales/'], 'explore/small_files.py', ['explore/small_files.py']),
  editor: { file: 'explore/small_files.py', code, highlight: [...linesFrom(code, 'result = table.optimize()'), ...linesFrom(code, 'removed = table.vacuum(0)')] },
  session,
  side: [
    {
      type: 'table', id: 'files', title: 'out/daily_sales: December, a day at a time', tone: 'store', columns: ['after', 'files in the table', 'on disk'], rows: [
        { id: 'f-append', cells: ['31 nightly appends', appended, appended], tone: 'consume' },
        { id: 'f-opt', cells: ['OPTIMIZE', added, `${+appended + +added}`] },
        { id: 'f-vac', cells: ['VACUUM', added, onDisk], tone: 'store' },
      ],
    },
    {
      type: 'group', id: 'steps', title: 'Compaction, then clean-up', icon: 'layers', tone: 'ingest', children: [
        { type: 'item', id: 's-opt', title: `OPTIMIZE: ${removed} files → ${added}`, sub: 'one commit: removes the small, adds the big', icon: 'layers' },
        { type: 'item', id: 's-vac', title: `VACUUM: ${deleted} files and folders deleted`, sub: 'what no version still needs; time travel to them ends', icon: 'disk' },
        { type: 'item', id: 's-next', title: 'the next read opens 1 file', sub: 'not 31: the log lists only the big one', icon: 'search' },
        { type: 'item', id: 's-rows', title: `rows: still ${rows}`, sub: 'the table never changed, only its files', icon: 'check', tone: 'store' },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'Every task opens its files one by one: a table of thousands of tiny files spends its time opening them. VACUUM keeps 7 days by default; 0 is for a demo.' },
  ],
  edges: [
    { from: 's-opt', to: 's-vac' },
    { from: 's-vac', to: 's-next' },
    { from: 's-next', to: 's-rows' },
  ],
})
