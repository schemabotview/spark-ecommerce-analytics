import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { modelTree } from './tree'
import code from '../../../spine/model/06-partitions/project/explore/partitions.py?raw'
import session from '../../../spine/model/06-partitions/session.txt?raw'

// §6 — partitions. Task counts and file counts are the session's.
const out = outputOf(session, 'python -m explore.partitions')
const runs = [...out.matchAll(/shuffle\.partitions=\s*(\d+): (\d+) days ·\s+(\d+) tasks,\s+(\d+) with any rows/g)].map((m) => m.slice(1))
const files = [...out.matchAll(/^(\S+)\s+→ (\d+) file/gm)].map((m) => m.slice(1))

export const modelPartitions: SceneModel = ideFrame({
  tree: modelTree(['shopwave/gold.py', 'shopwave/metrics.py', 'explore/broadcast.py', 'explore/partitions.py'], 'explore/partitions.py', ['explore/partitions.py']),
  editor: { file: 'explore/partitions.py', code, ...view(code, 'spark = spark_session()', undefined, 0), highlight: [...linesFrom(code, 'spark.conf.set("spark.sql.shuffle.partitions"', 'daily = by_day()'), ...linesFrom(code, 'for name, df in [("coalesce(1)"', '("repartition(4)"')] },
  session,
  side: [
    {
      type: 'table', id: 'tasks', title: `${runs[0][1]} days, grouped`, tone: 'infra', columns: ['shuffle.partitions', 'tasks', 'with any rows'],
      rows: runs.map(([n, , t, busy]) => ({ id: `p${n}`, cells: [n, t, busy], tone: +busy < +t ? 'consume' as const : 'store' as const })),
    },
    {
      type: 'group', id: 'ways', title: 'Changing the number of partitions', icon: 'layers', tone: 'ingest', children: [
        { type: 'item', id: 'w-coalesce', title: 'coalesce(n)', sub: 'merges neighbours: no shuffle, only fewer', icon: 'filter' },
        { type: 'item', id: 'w-repartition', title: 'repartition(n)', sub: 'a full shuffle: more or fewer, even sizes', icon: 'network', tone: 'infra' },
        { type: 'item', id: 'w-conf', title: 'spark.sql.shuffle.partitions', sub: 'how many partitions every shuffle makes', icon: 'settings' },
      ],
    },
    {
      type: 'table', id: 'files', title: 'Written: one file per partition', tone: 'store', columns: ['before the write', 'files'],
      rows: files.map(([how, n]) => ({ id: `f-${how.split('(')[0]}`, cells: [how, n] })),
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'The default of 200 suits gigabytes, not a month of orders: most of those tasks had nothing to do. Course 5.8 lets Spark pick the number while the job runs.' },
  ],
  edges: [{ from: 'w-coalesce', to: 'w-repartition', label: 'or' }, { from: 'w-repartition', to: 'w-conf', label: 'or' }],
})
