import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { modelTree } from './tree'
import code from '../../../spine/model/02-join-types/project/explore/joins.py?raw'
import session from '../../../spine/model/02-join-types/session.txt?raw'

// §2 — join types. Every count is the session's.
const out = outputOf(session, 'python -m explore.joins')
const [, orders, payments] = out.match(/orders: (\d+) · payments: (\d+)/)!
const rows = Object.fromEntries([...out.matchAll(/^(\w+)\s+(\d+) rows$/gm)].map((m) => [m[1], m[2]]))

export const modelJoinTypes: SceneModel = ideFrame2({
  model: 'Which rows a join keeps',
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
        { id: 'k-inner', cells: ['inner', rows.inner, 'matched pairs'] },
        { id: 'k-left', cells: ['left', rows.left, 'every order'] },
        { id: 'k-semi', cells: ['left_semi', rows.left_semi, 'paid orders'] },
        { id: 'k-anti', cells: ['left_anti', rows.left_anti, 'unpaid orders'], tone: 'consume' },
      ],
    },
  ],
  edges: [{ from: 'o', to: 'p', label: 'order_id' }],
})
