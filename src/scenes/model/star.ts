import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { modelTree } from './tree'
import code from '../../../spine/model/01-star/project/shopwave/gold.py?raw'
import session from '../../../spine/model/01-star/session.txt?raw'

// §1 — the star schema. Counts, the revenue check and the top categories are the session's.
const out = outputOf(session, 'python -m explore.star')
const table = (name: string) => out.match(new RegExp(`${name}\\s+(\\d+) rows\\s+(\\d+) columns`))!.slice(1)
const [salesRows, salesCols] = table('fact_sales'), [custRows] = table('dim_customer'), [prodRows] = table('dim_product')
const [, lines, orders] = out.match(/paid revenue: lines ([\d.]+) · orders ([\d.]+)/)!

export const modelStar: SceneModel = ideFrame2({
  model: 'A fact at the centre, dimensions around',
  tree: modelTree(['shopwave/bronze.py', 'shopwave/gold.py', 'shopwave/session.py', 'shopwave/silver.py', 'explore/star.py'],
    'shopwave/gold.py', ['shopwave/gold.py', 'explore/star.py']),
  editor: { file: 'shopwave/gold.py', code, ...view(code, 'def fact_sales(', undefined, 0), highlight: linesFrom(code, 'def fact_sales(', '"revenue", F.col') },
  session,
  side: [
    {
      type: 'group', id: 'star', title: 'The star', icon: 'layers', tone: 'store', children: [
        { type: 'item', id: 'fact', title: `fact_sales · ${salesRows} rows`, sub: `one per order line, ${salesCols} columns: what happened`, icon: 'table', tone: 'infra' },
        {
          type: 'group', id: 'dims', bare: true, dir: 'grid', cols: 2, children: [
            { type: 'item', id: 'dim-c', title: `dim_customer · ${custRows}`, sub: 'who bought', icon: 'users', tone: 'serve' },
            { type: 'item', id: 'dim-p', title: `dim_product · ${prodRows}`, sub: 'what was bought', icon: 'box', tone: 'serve' },
            { type: 'item', id: 'dim-d', title: 'order_date', sub: 'when: a column, here', icon: 'clock', tone: 'serve' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'check', title: 'Revenue, two ways, must agree', tone: 'store', columns: ['summed from', 'paid revenue'], rows: [
        { id: 'c-lines', cells: ['lines: qty × price', lines] },
        { id: 'c-orders', cells: ['orders: total', orders], tone: lines === orders ? 'store' : 'consume' },
        { id: 'c-verdict', cells: ['difference', lines === orders ? '0.00' : 'NOT ZERO'] },
      ],
    },
  ],
  edges: [{ from: 'fact', to: 'dims', label: 'product_id · customer_id' }],
})
