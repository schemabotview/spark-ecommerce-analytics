import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { scaleTree } from './tree'
import code from '../../../spine/scale/05-partition-size/project/explore/partition_size.py?raw'
import session from '../../../spine/scale/05-partition-size/session.txt?raw'

// §5 — partition sizing. The file counts and each setting's partitions are the session's.
const out = outputOf(session, 'python -m explore.partition_size')
const [, files, total, each] = out.match(/(\d+) files · (\d+) MB · about (\d+) KB each/)!
const sizes = [...out.matchAll(/maxPartitionBytes\s+(\w+):\s+(\d+) partitions/g)].map(([, size, parts]) => ({ size, parts }))

export const scalePartitionSize: SceneModel = ideFrame2({
  model: 'Files are packed into partitions',
  tree: scaleTree(['explore/partition_size.py'], 'explore/partition_size.py', ['explore/partition_size.py'], { 'data/sf1/': `${files} files a table` }),
  editor: { file: 'explore/partition_size.py', code, highlight: linesFrom(code, 'for size in', 'f"{items.rdd.getNumPartitions()') },
  session,
  side: [
    {
      type: 'table', id: 'sizes', title: `order_items: ${files} files, ${total} MB`, tone: 'store', columns: ['maxPartitionBytes', 'partitions = tasks'],
      rows: sizes.map((s) => ({ id: `s-${s.size}`, cells: [s.size, s.parts], tone: s.size === '128m' ? 'store' as const : undefined })),
    },
    {
      type: 'group', id: 'rule', title: 'How Spark packs files into tasks', icon: 'boxes', tone: 'ingest', children: [
        { type: 'item', id: 'r-cost', title: 'each file costs 4 MB more', sub: 'openCostInBytes: opening one is not free', icon: 'file' },
        { type: 'item', id: 'r-pack', title: `${files} files × (${each} KB + 4 MB)`, sub: `packed into 128 MB partitions: ${sizes[0].parts}`, icon: 'boxes' },
        { type: 'item', id: 'r-small', title: 'a limit below one file', sub: 'one partition a file, or more', icon: 'layers' },
      ],
    },
  ],
  edges: [
    { from: 'r-cost', to: 'r-pack' },
  ],
})
