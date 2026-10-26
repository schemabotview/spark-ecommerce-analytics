import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { modelTree } from './tree'
import code from '../../../spine/model/02-join-types/project/explore/joins.py?raw'
import session from '../../../spine/model/02-join-types/session.txt?raw'

// §2 — join types. Every count is the session's.
const out = outputOf(session, 'python -m explore.joins')
const [, orders, payments] = out.match(/orders: (\d+) · payments: (\d+)/)!
const rows = Object.fromEntries([...out.matchAll(/^(\w+)\s+(\d+) rows$/gm)].map((m) => [m[1], m[2]]))
const [, unpaid, twice] = out.match(/never paid: (\d+) · paid twice: (\d+)/)!
const first = out.match(/first unpaid: (.+)/)![1]

export const modelJoinTypes: SceneModel = ideFrame({
  tree: modelTree(['shopwave/gold.py', 'shopwave/silver.py', 'explore/joins.py', 'explore/star.py'], 'explore/joins.py', ['explore/joins.py']),
  editor: { file: 'explore/joins.py', code, highlight: [...linesFrom(code, 'for how in', 'print(f"{how'), ...linesFrom(code, 'unpaid = orders.join', 'twice = ')] },
  session,
  side: [
    {
      type: 'group', id: 'sides', title: 'orders ⋈ payments on order_id', icon: 'workflow', tone: 'ingest', dir: 'row', children: [
        { type: 'item', id: 'o', title: `${orders} orders`, sub: 'not cancelled', icon: 'table' },
        { type: 'item', id: 'p', title: `${payments} payments`, sub: 'from the provider', icon: 'card' },
      ],
    },
    {
      type: 'table', id: 'kinds', title: 'What each join keeps', tone: 'ingest', columns: ['how', 'rows', 'keeps'], rows: [
        { id: 'k-inner', cells: ['inner', rows.inner, 'pairs that match'] },
        { id: 'k-left', cells: ['left', rows.left, 'every order, payment or null'] },
        { id: 'k-semi', cells: ['left_semi', rows.left_semi, 'orders that have a payment'] },
        { id: 'k-anti', cells: ['left_anti', rows.left_anti, 'orders that have none'], tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'sql', title: 'The same, in SQL terms', tone: 'neutral', columns: ['join', 'SQL'], rows: [
        { id: 'q-semi', cells: ['left_semi', 'WHERE EXISTS (…)'] },
        { id: 'q-anti', cells: ['left_anti', 'WHERE NOT EXISTS (…)'] },
        { id: 'q-left', cells: ['left', 'LEFT OUTER JOIN'] },
      ],
    },
    {
      type: 'table', id: 'found', title: 'What the joins found', tone: 'consume', columns: ['', 'orders'], rows: [
        { id: 'f-unpaid', cells: ['never paid', unpaid], tone: 'consume' },
        { id: 'f-twice', cells: ['paid twice', twice], tone: 'consume' },
        { id: 'f-matched', cells: ['paid once or more', rows.left_semi] },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: `left is ${+rows.left - +orders} rows longer than the orders: each order paid twice appears twice. First unpaid: ${first}.` },
  ],
  edges: [{ from: 'o', to: 'p', label: 'order_id' }],
})
