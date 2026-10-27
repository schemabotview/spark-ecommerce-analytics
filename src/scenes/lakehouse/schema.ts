import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { lakeTree } from './tree'
import code from '../../../spine/lakehouse/08-schema/project/explore/schema.py?raw'
import session from '../../../spine/lakehouse/08-schema/session.txt?raw'

// §8 — schema enforcement and evolution. The refusals' conditions and the counts are the session's.
const out = outputOf(session, 'python -m explore.schema')
const refusal = (name: string) => out.match(new RegExp(`${name}: refused, (\\w+)`))![1]
const columns = out.match(/columns now: (\d+)/)![1]
const [, oldNulls, newRows] = out.match(/channel on old rows: (\d+) nulls · on new rows: (\d+)/)!

export const lakehouseSchema: SceneModel = ideFrame({
  tree: lakeTree(['explore/schema.py', 'lake/gold/orders/'], 'explore/schema.py', ['explore/schema.py'], { 'lake/gold/orders/': 'Delta' }),
  editor: { file: 'explore/schema.py', code, ...view(code, 'orders = spark.read'), highlight: [...linesFrom(code, 'wrong_type ='), ...linesFrom(code, 'extra ='), ...linesFrom(code, 'append(extra, mergeSchema')] },
  session,
  side: [
    {
      type: 'table', id: 'writes', title: 'Three appends to gold/orders', tone: 'store', columns: ['write', 'Delta says'], rows: [
        { id: 'w-type', cells: ['total as a string', refusal('total as a string')], tone: 'consume' },
        { id: 'w-col', cells: ['a new column', refusal('a new column')], tone: 'consume' },
        { id: 'w-merge', cells: ['the same, mergeSchema', `written: ${columns} columns`], tone: 'store' },
      ],
    },
    {
      type: 'group', id: 'rules', title: 'Enforced, then evolved', icon: 'shield', tone: 'ingest', children: [
        { type: 'item', id: 'r-check', title: 'every write checked against the table', sub: 'before any file is committed', icon: 'shield' },
        { type: 'item', id: 'r-refuse', title: 'a mismatch: the write fails', sub: 'no files committed, the table unchanged', icon: 'zap', tone: 'consume' },
        { type: 'item', id: 'r-evolve', title: 'mergeSchema: a column added on purpose', sub: `old rows: ${oldNulls} nulls · new rows: ${newRows}`, icon: 'layers' },
      ],
    },
    {
      type: 'table', id: 'opts', title: 'Changing a schema on purpose', tone: 'ingest', columns: ['option', 'with', 'does'], rows: [
        { id: 'o-merge', cells: ['mergeSchema', 'append', 'adds new columns'], tone: 'store' },
        { id: 'o-over', cells: ['overwriteSchema', 'overwrite', 'replaces the schema'] },
        { id: 'o-none', cells: ['neither', 'any write', 'refused if it differs'], tone: 'consume' },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'A folder of Parquet takes any write: the wrong type lands in new files, and the next reader fails, not the writer. Delta refuses the write itself.' },
  ],
  edges: [
    { from: 'r-check', to: 'r-refuse' },
    { from: 'r-refuse', to: 'r-evolve' },
  ],
})
