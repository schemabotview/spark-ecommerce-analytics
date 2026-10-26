import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { cleanTree } from './tree'
import code from '../../../spine/clean/01-columns/project/shopwave/silver.py?raw'
import session from '../../../spine/clean/01-columns/session.txt?raw'

// §1 — column expressions. The column counts and the printed Column are the session's.
const out = outputOf(session, 'python -m explore.columns')
const [, bronzeCols, silverCols] = out.match(/bronze: (\d+) columns · silver: (\d+)/)!
const column = out.match(/Column<'(.+)'>/)![1]

export const cleanColumns: SceneModel = ideFrame({
  tree: cleanTree(['shopwave/bronze.py', 'shopwave/schemas.py', 'shopwave/session.py', 'shopwave/silver.py', 'explore/columns.py'],
    'shopwave/silver.py', ['shopwave/silver.py', 'explore/columns.py']),
  editor: { file: 'shopwave/silver.py', code, highlight: [lineOf(code, 'F.to_date("event_ts")'), ...linesFrom(code, 'F.col("context.device")', 'F.col("context.campaign")')] },
  session,
  side: [
    {
      type: 'group', id: 'expr', title: 'One column, as an expression', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'e-col', title: 'F.col("context.device")', sub: 'a reference: no data yet', icon: 'code' },
        { type: 'item', id: 'e-alias', title: '.alias("device")', sub: 'the new column’s name', icon: 'code' },
        { type: 'item', id: 'e-select', title: 'select(…13 expressions)', sub: 'a new DataFrame, one column each', icon: 'table', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'ways', title: 'Three ways to name a column', tone: 'ingest', columns: ['write', 'when'], rows: [
        { id: 'w-str', cells: ['"event_id"', 'just pick it'] },
        { id: 'w-col', cells: ['F.col("context.device")', 'compute with it'] },
        { id: 'w-fn', cells: ['F.to_date("event_ts")', 'a function of it'] },
        { id: 'w-lit', cells: ['F.lit(False)', 'a constant'] },
      ],
    },
    {
      type: 'table', id: 'shape', title: 'clicks, bronze → silver', tone: 'store', columns: ['', 'bronze', 'silver'], rows: [
        { id: 's-cols', cells: ['columns', bronzeCols, silverCols] },
        { id: 's-ctx', cells: ['context', 'a struct', '4 flat columns'] },
        { id: 's-date', cells: ['event_date', '–', 'to_date(event_ts)'], tone: 'store' },
      ],
    },
    { type: 'note', id: 'note', tone: 'ingest', text: `print(expr) shows ${column}: an expression is a description, like a DataFrame. It is computed only inside an action.` },
  ],
  edges: [{ from: 'e-col', to: 'e-alias' }, { from: 'e-alias', to: 'e-select' }],
})
