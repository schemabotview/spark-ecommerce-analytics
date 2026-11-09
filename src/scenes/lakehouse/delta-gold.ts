import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { lakeTree } from './tree'
import code from '../../../spine/lakehouse/03-delta-gold/project/shopwave/gold.py?raw'
import session from '../../../spine/lakehouse/03-delta-gold/session.txt?raw'
import parquetSession from '../../../spine/lakehouse/01-broken-overwrite/session.txt?raw'

// §3 — converting the lake: gold written as Delta, the same failed overwrite run again, bronze's
// orders converted in place. Both runs' outcomes are their sessions'.
const delta = outputOf(session, 'python -m explore.overwrite')
const parquet = outputOf(parquetSession, 'python -m explore.overwrite')
const before = delta.match(/before: (\d+) rows/)![1]
const outcome = (out: string) => ({ failed: out.match(/the job failed: (\w+)/)![1], after: out.match(/after: (\w+)/)![1] })
const [p, d] = [outcome(parquet), outcome(delta)]
const versions = delta.match(/versions: (.+)/)![1]
const convert = outputOf(session, 'python -m explore.convert')
const files = convert.match(/converted: (\d+) parquet files/)![1]
const [, rows, log] = convert.match(/rows: (\d+) · log: (\S+)/)!

export const lakehouseDeltaGold: SceneModel = ideFrame2({
  model: 'A log makes a folder a table',
  tree: lakeTree(['shopwave/session.py', 'shopwave/gold.py', 'explore/overwrite.py', 'explore/convert.py', 'jars.txt', 'requirements.txt'], 'shopwave/gold.py', ['explore/convert.py'], { 'lake/gold/': 'Delta now' }),
  editor: { file: 'shopwave/gold.py', code, ...view(code, 'def main('), highlight: [lineOf(code, 'df.write.format("delta")')] },
  session,
  side: [
    {
      type: 'table', id: 'twice', title: `The same failed overwrite, ${before} rows before`, tone: 'store', columns: ['', 'a reader after it'], rows: [
        { id: 't-parquet', cells: ['Parquet', p.after], tone: 'consume' },
        { id: 't-delta', cells: ['Delta', `${d.after} rows`], tone: 'store' },
        { id: 't-log', cells: ['Delta’s log', `versions: ${versions}`] },
      ],
    },
    {
      type: 'group', id: 'convert', title: 'CONVERT TO DELTA: bronze orders', icon: 'layers', tone: 'ingest', children: [
        { type: 'item', id: 'c-files', title: `${files} Parquet files, kept where they are`, sub: 'nothing rewritten', icon: 'file' },
        { type: 'item', id: 'c-log', title: '_delta_log/: version 0', sub: `${log}: adds every file`, icon: 'folder' },
        { type: 'item', id: 'c-rows', title: `${rows} rows, read as Delta`, sub: 'the same rows, now a table', icon: 'table', tone: 'store' },
      ],
    },
  ],
  edges: [
    { from: 'c-files', to: 'c-log' },
    { from: 'c-log', to: 'c-rows' },
  ],
})
