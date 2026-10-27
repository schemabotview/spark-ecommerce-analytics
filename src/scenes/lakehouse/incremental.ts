import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { view } from '../fold'
import { lakeTree } from './tree'
import code from '../../../spine/lakehouse/04-incremental/project/shopwave/lake.py?raw'
import session from '../../../spine/lakehouse/04-incremental/session.txt?raw'

// §4 — incremental loads: a high-water mark. The three runs' counts are the session's.
const runs = [...session.matchAll(/^\$ python -m shopwave\.lake orders(.*)\n(?:.*\n)*?gold\/orders: \+(\d+) rows, (\d+) in all/gm)]
  .map(([, args, added, total]) => ({ args: args.trim() || '(none)', added, total }))

export const lakehouseIncremental: SceneModel = ideFrame({
  tree: lakeTree(['shopwave/lake.py'], 'shopwave/lake.py', ['shopwave/lake.py'], { 'shopwave/lake.py': 'Delta jobs' }),
  editor: { file: 'shopwave/lake.py', code, ...view(code, 'def load_orders(', 'return new.count()'), highlight: linesFrom(code, 'if DeltaTable.isDeltaTable', 'orders = orders.filter(F.col("order_date") > mark)') },
  session,
  side: [
    {
      type: 'group', id: 'hwm', title: 'One night’s load', icon: 'clock', tone: 'ingest', children: [
        { type: 'item', id: 'h-mark', title: 'max(order_date) in gold/orders', sub: 'the high-water mark: loaded up to here', icon: 'table' },
        { type: 'item', id: 'h-new', title: 'silver orders after the mark', sub: 'only those are read and written', icon: 'filter' },
        { type: 'item', id: 'h-append', title: 'append: one Delta commit', sub: 'the mark moves with it, or not at all', icon: 'layers' },
      ],
    },
    {
      type: 'table', id: 'runs', title: 'Three runs of the same job', tone: 'store', columns: ['arguments', 'added', 'in all'],
      rows: runs.map((r, i) => ({ id: `r${i}`, cells: [r.args, `+${r.added}`, r.total], tone: r.added === '0' ? 'store' as const : undefined })),
    },
    {
      type: 'table', id: 'ways', title: 'Ways to find what is new', tone: 'ingest', columns: ['way', 'works when'], rows: [
        { id: 'w-mark', cells: ['a high-water mark', 'rows are only added'], tone: 'store' },
        { id: 'w-cdc', cells: ['a change feed (§5)', 'rows change after landing'] },
        { id: 'w-full', cells: ['rebuild everything', 'the table is small'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'store', text: 'Run it twice and the second run adds nothing: the mark is read from the table itself, so a job that crashed or ran again never loads a day twice.' },
  ],
  edges: [
    { from: 'h-mark', to: 'h-new' },
    { from: 'h-new', to: 'h-append' },
  ],
})
