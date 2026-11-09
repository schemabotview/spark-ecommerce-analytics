import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { prodTree } from './tree'
import code from '../../../spine/production/02-tests/project/tests/test_transforms.py?raw'
import session from '../../../spine/production/02-tests/session.txt?raw'

// §2 — testing Spark code. The pass count is the session's (its seconds are volatile).
const passed = outputOf(session, 'python -m pytest -q tests | tail -1').match(/(\d+) passed/)![1]
// A test's name, cut at a word to fit the side pane (the editor shows it whole).
const short = (s: string) => (s.length <= 32 ? s : s.slice(0, s.lastIndexOf(' ', 31)) + ' …')
const tests = [...code.matchAll(/^def (test_\w+)\(spark\):/gm)].map(([, t]) => t)

export const productionTests: SceneModel = ideFrame2({
  model: 'Small rows in, a DataFrame compared',
  tree: prodTree(['shopwave/', 'tests/conftest.py', 'tests/test_transforms.py', 'requirements.txt'], 'tests/test_transforms.py', ['tests/conftest.py', 'tests/test_transforms.py'], { 'requirements.txt': '+ pytest' }),
  editor: { file: 'tests/test_transforms.py', code, ...view(code, 'def test_revenue_is_qty', 'def test_latest_keeps'), highlight: linesFrom(code, 'got = gold.fact_sales(orders, items)', '[(1, Decimal("7.50"))]') },
  session,
  side: [
    {
      type: 'group', id: 'shape', title: 'Every test, the same shape', icon: 'check', tone: 'ingest', children: [
        { type: 'item', id: 't-in', title: 'a few rows, made by hand', sub: 'the cases that matter, not a day of data', icon: 'table' },
        { type: 'item', id: 't-fn', title: 'the transform, as the job calls it', sub: 'silver.orders, gold.fact_sales, lake.latest', icon: 'code' },
        { type: 'item', id: 't-eq', title: 'assertDataFrameEqual(got, expected)', sub: 'rows, types, in any order', icon: 'check', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'list', title: `${passed} passed`, tone: 'store', columns: ['test'],
      rows: tests.map((t) => ({ id: t, cells: [short(t.replace(/^test_/, '').replaceAll('_', ' '))] })),
    },
  ],
  edges: [
    { from: 't-in', to: 't-fn' },
    { from: 't-fn', to: 't-eq' },
  ],
})
