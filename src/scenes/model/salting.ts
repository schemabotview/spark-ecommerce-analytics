import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
import { modelTree } from './tree'
import code from '../../../spine/model/09-salting/project/explore/salting.py?raw'
import session from '../../../spine/model/09-salting/session.txt?raw'

// §9 — salting. Both joins' task numbers are the session's.
const out = outputOf(session, 'python -m explore.salting')
const runs = [...out.matchAll(/^(plain|salted)\s*:\s+(\d+) busy tasks · largest\s+(\d+) rows · median\s+(\d+)/gm)].map((m) => m.slice(1))
const salts = code.match(/SALTS = (\d+)/)![1]

export const modelSalting: SceneModel = ideFrame2({
  model: 'Salt splits one hot key',
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
  ],
  edges: [{ from: 's-key', to: 's-keys', label: 'hash % 8' }],
})
