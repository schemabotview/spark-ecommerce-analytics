import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { modelTree } from './tree'
import code from '../../../spine/model/09-salting/project/explore/salting.py?raw'
import session from '../../../spine/model/09-salting/session.txt?raw'

// §9 — salting. Both joins' task numbers are the session's.
const out = outputOf(session, 'python -m explore.salting')
const runs = [...out.matchAll(/^(plain|salted)\s*:\s+(\d+) busy tasks · largest\s+(\d+) rows · median\s+(\d+)/gm)].map((m) => m.slice(1))
const salts = code.match(/SALTS = (\d+)/)![1]

export const modelSalting: SceneModel = ideFrame({
  tree: modelTree(['shopwave/gold.py', 'shopwave/metrics.py', 'explore/aqe.py', 'explore/salting.py'], 'explore/salting.py', ['explore/salting.py']),
  editor: { file: 'explore/salting.py', code, ...view(code, '# Each sale gets a salt', undefined, 0), highlight: linesFrom(code, 'salted = sales.withColumn', '"salted": salted.join') },
  session,
  side: [
    {
      type: 'group', id: 'salt', title: `One hot key becomes ${salts}`, icon: 'layers', tone: 'store', children: [
        { type: 'item', id: 's-key', title: 'product 1', sub: 'every sale of the bestseller', icon: 'box', tone: 'consume' },
        { type: 'group', id: 's-keys', dir: 'grid', cols: 4, children: Array.from({ length: +salts }, (_, i) => ({ type: 'item' as const, id: `k${i}`, title: `(1, ${i})`, chip: true })) },
        { type: 'item', id: 's-dim', title: `dim_product × ${salts}`, sub: 'each product copied once per salt', icon: 'table' },
      ],
    },
    {
      type: 'table', id: 'runs', title: 'AQE off, the same join', tone: 'ingest', columns: ['join', 'busy tasks', 'largest', 'median'],
      rows: runs.map(([w, busy, big, med]) => ({ id: `r-${w}`, cells: [w, busy, big, med], tone: w === 'salted' ? 'store' as const : 'consume' as const })),
    },
    {
      type: 'table', id: 'when', title: 'A skewed join: what to try, in order', tone: 'neutral', columns: ['', ''], rows: [
        { id: 'w-1', cells: ['1', 'broadcast the small side'] },
        { id: 'w-2', cells: ['2', 'AQE, on by default'] },
        { id: 'w-3', cells: ['3', 'salt the hot key'], tone: 'store' },
      ],
    },
    { type: 'note', id: 'note', tone: 'store', text: 'Salting is AQE’s split, by hand: for when AQE is off or cannot help (a full outer join). The price: the small side is copied, and the code is harder to read.' },
  ],
  edges: [{ from: 's-key', to: 's-keys', label: 'hash % 8' }],
})
