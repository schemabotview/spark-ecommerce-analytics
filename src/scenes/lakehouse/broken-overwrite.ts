import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { lakeTree } from './tree'
import code from '../../../spine/lakehouse/01-broken-overwrite/project/explore/overwrite.py?raw'
import session from '../../../spine/lakehouse/01-broken-overwrite/session.txt?raw'

// §1 — why folders of Parquet break: an overwrite that fails halfway leaves no table at all.
const out = outputOf(session, 'python -m explore.overwrite')
const before = out.match(/before: (\d+) rows/)![1]
const failed = out.match(/the job failed: (\w+)/)![1]
const after = out.match(/after: (\w+)/)![1]
const left = outputOf(session, 'ls -A lake/gold/fact_sales | wc -l').trim()

export const lakehouseBrokenOverwrite: SceneModel = ideFrame({
  tree: lakeTree(['explore/overwrite.py'], 'explore/overwrite.py', ['explore/overwrite.py'], { 'lake/gold/': 'Parquet folders' }),
  editor: { file: 'explore/overwrite.py', code, highlight: [...linesFrom(code, 'broken = sales', '.otherwise('), lineOf(code, 'broken.write.mode')] },
  session,
  side: [
    {
      type: 'group', id: 'mid', title: 'lake/gold/fact_sales, mid-write', icon: 'folder', tone: 'ingest', children: [
        { type: 'item', id: 'm-old', title: `${before} rows in part files`, sub: 'the table every report reads', icon: 'file' },
        { type: 'item', id: 'm-del', title: 'overwrite: the old files deleted first', sub: 'before a single new row is written', icon: 'disk' },
        { type: 'item', id: 'm-fail', title: `a task fails: ${failed}`, sub: 'December’s rows hit the bug', icon: 'zap', tone: 'consume' },
        { type: 'item', id: 'm-empty', title: `${left} files left`, sub: 'the half-written ones cleaned away too', icon: 'folder', tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'reader', title: 'What a reader sees', tone: 'consume', columns: ['when', 'reads'], rows: [
        { id: 'r-before', cells: ['before the job', `${before} rows`] },
        { id: 'r-during', cells: ['while it writes', 'some new files, no old ones'] },
        { id: 'r-after', cells: ['after it fails', after], tone: 'consume' },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'A folder has no idea which files make up the table: whatever is in it is the table. Delta adds a log that says so, and writes it last.' },
  ],
  edges: [
    { from: 'm-old', to: 'm-del' },
    { from: 'm-del', to: 'm-fail' },
    { from: 'm-fail', to: 'm-empty' },
  ],
})
