import type { Item, SceneModel } from '@graphlearning/graphl-flow'
import { terminal } from '../ide'
import { outputOf } from '../lab'
import session from '../../../spine/ml/03-distributed-als/session.txt?raw'

// §3 — ◆ full scene: distributed ALS. Blocks, jobs, factor shapes and the one dot product are the lab's.
const out = outputOf(session, 'python -m explore.als_blocks')
const [, ratings] = out.match(/(\d+) ratings · blocks/)!
const [, jobs, stages, rounds] = out.match(/fit: (\d+) jobs, (\d+) stages for (\d+) rounds/)!
const [, users, rank, items] = out.match(/customer factors: (\d+) × (\d+) · product factors: (\d+) ×/)!
const [, who, what, rated] = out.match(/customer (\d+) · product (\d+) \(rated (\d)★\)/)!
const dot = out.match(/u · v = ([\d.]+)/)![1]

const chip = (id: string, title: string, tone?: Item['tone']): Item => ({ type: 'item', id, title, chip: true, tone })

export const mlDistributedAls: SceneModel = {
  title: 'ALS: two small matrices that multiply back to the big one',
  sub: `${ratings} ratings in a ${users} × ${items} matrix → ${users} × ${rank} customers and ${items} × ${rank} products`,
  nodes: [
    {
      type: 'group', id: 'alt', bare: true, dir: 'row', children: [
        {
          type: 'group', id: 'users', badge: 1, title: `Customer factors: ${users} × ${rank}`, sub: 'split into 4 blocks, one per task', icon: 'users', tone: 'ingest',
          children: [0, 1, 2, 3].map((b) => chip(`u${b}`, `customer block ${b}`)),
        },
        {
          type: 'group', id: 'round', badge: 2, title: `${rounds} rounds, alternating`, sub: 'that is the A in ALS', icon: 'workflow', tone: 'store', children: [
            { type: 'item', id: 'r-fix-v', title: 'fix the products, solve each customer', sub: 'a small least-squares problem per row', icon: 'cpu' },
            { type: 'item', id: 'r-fix-u', title: 'fix the customers, solve each product', sub: 'blocks are shuffled to where they are needed', icon: 'cpu' },
            { type: 'item', id: 'r-jobs', title: `${jobs} jobs, ${stages} stages in all`, sub: 'from the run’s own status tracker', icon: 'layers' },
          ],
        },
        {
          type: 'group', id: 'items', badge: 3, title: `Product factors: ${items} × ${rank}`, sub: 'split into 4 blocks', icon: 'boxes', tone: 'ingest',
          children: [0, 1, 2, 3].map((b) => chip(`v${b}`, `product block ${b}`)),
        },
      ],
    },
    {
      type: 'group', id: 'proof', title: `A prediction is a dot product: customer ${who} × product ${what} = ${dot} (rated ${rated}★)`, icon: 'terminal', tone: 'neutral', children: [
        { type: 'code', id: 'out', terminal: true, filename: 'terminal — shopwave', code: terminal(session) },
      ],
    },
  ],
  edges: [
    { from: 'users', to: 'round' },
    { from: 'round', to: 'items' },
  ],
}
