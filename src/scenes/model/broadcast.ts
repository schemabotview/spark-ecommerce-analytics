import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { modelTree } from './tree'
import code from '../../../spine/model/05-broadcast/project/shopwave/gold.py?raw'
import session from '../../../spine/model/05-broadcast/session.txt?raw'

// §5 — broadcast. Both joins' bytes shuffled and the euro total are the session's.
const out = outputOf(session, 'python -m explore.broadcast')
const [, payments, rates] = out.match(/payments: (\d+) · fx rates: (\d+)/)!
const runs = [...out.matchAll(/^(shuffle both|broadcast)\s+(\w+)\s+(\d+) rows ·\s+(\d+) B shuffled$/gm)].map((m) => m.slice(1))
const total = out.match(/total € ([\d.]+)/)![1]

export const modelBroadcast: SceneModel = ideFrame({
  tree: modelTree(['shopwave/bronze.py', 'shopwave/gold.py', 'shopwave/schemas.py', 'shopwave/silver.py', 'explore/broadcast.py'], 'shopwave/gold.py', ['explore/broadcast.py'],
    { 'shopwave/bronze.py': '+ fx_rates' }),
  editor: { file: 'shopwave/gold.py', code, ...view(code, 'def fact_payments(', undefined, 0), highlight: [...linesFrom(code, 'joined = paid.join(F.broadcast'), ...linesFrom(code, 'rate = F.coalesce')] },
  session,
  side: [
    {
      type: 'group', id: 'bc', title: `F.broadcast(rates): ${rates} rows`, icon: 'network', tone: 'store', children: [
        { type: 'item', id: 'driver', title: 'the driver collects the small side', sub: 'a few kilobytes', icon: 'spark' },
        { type: 'group', id: 'tasks', dir: 'grid', cols: 4, children: [0, 1, 2, 3].map((i) => ({ type: 'item' as const, id: `t${i}`, title: `task ${i}: all rates`, chip: true })) },
      ],
    },
    {
      type: 'table', id: 'runs', title: `The same join, ${payments} payments`, tone: 'ingest', columns: ['strategy', 'plan', 'shuffled'],
      rows: runs.map(([name, join, , bytes]) => ({ id: `j-${name.split(' ')[0]}`, cells: [name, join, `${bytes} B`], tone: name === 'broadcast' ? 'store' as const : 'infra' as const })),
    },
    {
      type: 'plot', id: 'bytes', title: 'Bytes through the shuffle', compact: true,
      x: { labels: runs.map((r) => r[0]) }, y: { min: 0, max: Math.ceil(Math.max(...runs.map((r) => +r[3])) / 10000) * 10000, label: 'bytes' },
      series: runs.map((r, i) => ({ kind: 'bar' as const, points: [[i, +r[3]] as [number, number]], tone: r[0] === 'broadcast' ? 'store' as const : 'infra' as const })),
    },
    { type: 'note', id: 'note', tone: 'store', text: `Each task holds every rate, so the payments never move: only a few bytes cross a shuffle. All payments in euros: € ${total}. Spark broadcasts on its own under 10 MB; the hint makes it explicit.` },
  ],
  edges: [{ from: 'driver', to: 'tasks', label: 'a copy each' }],
})
