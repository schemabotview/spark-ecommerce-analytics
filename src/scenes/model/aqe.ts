import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { modelTree } from './tree'
import code from '../../../spine/model/08-aqe/project/explore/aqe.py?raw'
import session from '../../../spine/model/08-aqe/session.txt?raw'

// §8 — Adaptive Query Execution. Both runs' join stage are the session's (task metrics).
const out = outputOf(session, 'python -m explore.aqe')
const runs = [...out.matchAll(/AQE (on|off)\s*: join stage\s+(\d+) tasks · largest\s+(\d+) rows · median\s+(\d+) · read (\d+) rows/g)].map((m) => m.slice(1))
const off = runs.find((r) => r[0] === 'off')!, on = runs.find((r) => r[0] === 'on')!

export const modelAqe: SceneModel = ideFrame({
  tree: modelTree(['shopwave/gold.py', 'shopwave/metrics.py', 'explore/aqe.py', 'explore/skew.py'], 'explore/aqe.py', ['explore/aqe.py']),
  editor: { file: 'explore/aqe.py', code, ...view(code, 'spark = spark_session()', undefined, 0), highlight: linesFrom(code, '# AQE\'s thresholds', 'minPartitionSize') },
  session,
  side: [
    {
      type: 'group', id: 'aqe', title: 'AQE: re-plan between stages', icon: 'workflow', tone: 'store', children: [
        { type: 'item', id: 'a-stats', title: 'a stage ends: real sizes known', sub: 'bytes per shuffle partition', icon: 'chart' },
        { type: 'item', id: 'a-coalesce', title: 'merge the small partitions', sub: `${off[1]} → ${on[1]} tasks`, icon: 'filter' },
        { type: 'item', id: 'a-split', title: 'split the skewed one', sub: `${+on[4] - +off[4]} extra rows read: the product row, copied per piece`, icon: 'layers', tone: 'store' },
        { type: 'item', id: 'a-bhj', title: 'turn a join into a broadcast', sub: 'if a side proved small: off here', icon: 'network' },
      ],
    },
    {
      type: 'table', id: 'runs', title: 'The skewed join, twice', tone: 'ingest', columns: ['AQE', 'tasks', 'largest', 'median'],
      rows: [off, on].map(([w, t, big, med]) => ({ id: `r-${w}`, cells: [w, t, big, med], tone: w === 'on' ? 'store' as const : 'consume' as const })),
    },
    {
      type: 'table', id: 'knobs', title: 'Its thresholds: default, and here', tone: 'neutral', columns: ['spark.sql.adaptive.…', 'default', 'here'], rows: [
        { id: 'n-adv', cells: ['advisoryPartitionSizeInBytes', '64 MB', code.match(/advisoryPartitionSizeInBytes", "(\w+)"/)![1]] },
        { id: 'n-skew', cells: ['skewJoin.skewedPartition…', '256 MB', code.match(/skewedPartitionThresholdInBytes", "(\w+)"/)![1]] },
        { id: 'n-min', cells: ['coalescePartitions.minPartitionSize', '1 MB', code.match(/minPartitionSize", "(\w+)"/)![1]] },
      ],
    },
    { type: 'note', id: 'note', tone: 'store', text: 'AQE is on by default since Spark 3.2. Its thresholds are sized for gigabytes (a skewed partition is over 256 MB), so here they are scaled down to our month: same rules, smaller numbers.' },
  ],
  edges: [{ from: 'a-stats', to: 'a-coalesce' }, { from: 'a-coalesce', to: 'a-split' }, { from: 'a-split', to: 'a-bhj' }],
})
