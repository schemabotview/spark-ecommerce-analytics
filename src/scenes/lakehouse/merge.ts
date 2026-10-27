import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { lakeTree } from './tree'
import code from '../../../spine/lakehouse/05-merge/project/shopwave/lake.py?raw'
import session from '../../../spine/lakehouse/05-merge/session.txt?raw'

// §5 — CDC with MERGE. The feed's size, the refusal and both status counts are the session's.
const out = outputOf(session, 'python -m explore.merge')
const [, changes, twice] = out.match(/feed: (\d+) changes · (\d+) orders changed twice/)!
const refused = out.match(/MERGE as it comes: (\w+)/)![1]
const updated = out.match(/MERGE latest per order: (\d+) orders updated/)![1]
const status = (line: string) => Object.fromEntries([...out.match(new RegExp(`${line}\\s*\\{(.*)\\}`))![1].matchAll(/'(\w+)': (\d+)/g)].map((m) => [m[1], m[2]]))
const [before, after] = [status('status before:'), status('status after:')]
const states = [...new Set([...Object.keys(before), ...Object.keys(after)])]

export const lakehouseMerge: SceneModel = ideFrame({
  tree: lakeTree(['shopwave/lake.py', 'explore/merge.py', 'data/raw/order_changes/'], 'shopwave/lake.py', ['explore/merge.py', 'data/raw/order_changes/'], { 'data/raw/order_changes/': 'the change feed' }),
  editor: { file: 'shopwave/lake.py', code, ...view(code, 'def latest(', 'return orders.history(1)'), highlight: [...linesFrom(code, 'newest = Window', '.filter("n = 1")'), ...linesFrom(code, '(orders.alias("o").merge', '.execute())')] },
  session,
  side: [
    {
      type: 'group', id: 'flow', title: `${changes} changes, a week of them`, icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'f-latest', title: 'latest(): the newest per order', sub: `${twice} orders changed twice: MERGE refuses those`, icon: 'filter' },
        { type: 'item', id: 'f-match', title: 'matched, and newer: update', sub: 'status and updated_at', icon: 'check' },
        { type: 'item', id: 'f-commit', title: `one commit: ${updated} orders updated`, sub: 'all of them, or none', icon: 'layers' },
      ],
    },
    {
      type: 'table', id: 'status', title: 'gold/orders by status', tone: 'store', columns: ['status', 'before', 'after'],
      rows: states.map((s) => ({ id: `s-${s}`, cells: [s, before[s] ?? '—', after[s] ?? '—'], tone: before[s] !== after[s] ? 'store' as const : undefined })),
    },
    { type: 'note', id: 'note', tone: 'consume', text: `Merged as it comes, the feed fails with ${refused}: two changes to one order, and Delta will not guess which wins.` },
  ],
  edges: [
    { from: 'f-latest', to: 'f-match' },
    { from: 'f-match', to: 'f-commit' },
  ],
})
