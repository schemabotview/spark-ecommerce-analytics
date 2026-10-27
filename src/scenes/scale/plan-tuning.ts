import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { scaleTree } from './tree'
import code from '../../../spine/scale/06-plan-tuning/project/explore/plan_tuning.py?raw'
import session from '../../../spine/scale/06-plan-tuning/session.txt?raw'

// §6 — the plan as a tuning tool. Rows read and the pushed filters are the session's.
const out = outputOf(session, 'python -m explore.plan_tuning')
const runs = [...out.matchAll(/^(built-in|Python UDF)\s+(\d+) rows · read\s+(\d+) · pushed (\[.*\])$/gm)]
  .map(([, name, rows, read, pushed]) => ({ name, rows, read, pushed }))
const [builtin, udf] = runs

export const scalePlanTuning: SceneModel = ideFrame({
  tree: scaleTree(['explore/plan_tuning.py', 'out/orders/'], 'explore/plan_tuning.py', ['explore/plan_tuning.py'], { 'out/orders/': 'sorted by country' }),
  editor: { file: 'explore/plan_tuning.py', code, ...view(code, 'arrow = '), highlight: [...linesFrom(code, 'orders.orderBy("country")'), ...linesFrom(code, 'queries = {"built-in"', '"Python UDF": orders')] },
  session,
  side: [
    {
      type: 'table', id: 'runs', title: 'The same filter, two ways', tone: 'store', columns: ['filter', 'rows read', 'PushedFilters'],
      rows: runs.map((r) => ({ id: `r-${r.name.replace(' ', '-')}`, cells: [r.name, r.read, r.pushed], tone: r === udf ? 'consume' as const : 'store' as const })),
    },
    {
      type: 'group', id: 'plans', bare: true, dir: 'row', children: [
        {
          type: 'group', id: 'p-builtin', title: 'country = \'DE\'', icon: 'search', tone: 'store', children: [
            { type: 'item', id: 'b-scan', title: 'Scan: PushedFilters', sub: 'min/max skips other countries', icon: 'filter' },
            { type: 'item', id: 'b-count', title: `${builtin.rows} rows`, icon: 'check' },
          ],
        },
        {
          type: 'group', id: 'p-udf', title: 'is_german(country)', icon: 'python', tone: 'consume', children: [
            { type: 'item', id: 'u-scan', title: 'Scan: every row', sub: 'Spark cannot see inside', icon: 'file' },
            { type: 'item', id: 'u-eval', title: 'BatchEvalPython', sub: 'each row to Python', icon: 'python' },
            { type: 'item', id: 'u-count', title: `${udf.rows} rows`, icon: 'check' },
          ],
        },
      ],
    },
    {
      type: 'table', id: 'lost', title: 'What a UDF hides from Catalyst', tone: 'neutral', columns: ['optimization', 'built-in', 'UDF'], rows: [
        { id: 'o-push', cells: ['filter pushdown', 'yes', 'no'] },
        { id: 'o-part', cells: ['partition pruning', 'yes', 'no'] },
        { id: 'o-fold', cells: ['constant folding', 'yes', 'no'] },
        { id: 'o-cost', cells: ['rows to Python', 'none', 'every one'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'The answer is the same; the work is not. Read PushedFilters in explain() first when a query reads more than it should.' },
  ],
  edges: [
    { from: 'b-scan', to: 'b-count' },
    { from: 'u-scan', to: 'u-eval' },
    { from: 'u-eval', to: 'u-count' },
  ],
})
