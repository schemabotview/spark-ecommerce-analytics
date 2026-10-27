import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { scaleTree } from './tree'
import code from '../../../spine/scale/03-spill/project/explore/spill.py?raw'
import session from '../../../spine/scale/03-spill/session.txt?raw'

// §3 — spill. Both runs' spill sizes are the session's, read from the sort stage's metrics.
const out = outputOf(session, 'python -m explore.spill')
const runs = [...out.matchAll(/^(\w+)\s+tasks (\d+) · spilled\s+(\d+) MB in memory,\s+(\d+) MB on disk/gm)]
  .map(([, label, tasks, mem, disk]) => ({ label, tasks, mem, disk }))
const squeezed = runs.find((r) => r.label === 'squeezed')!

export const scaleSpill: SceneModel = ideFrame({
  tree: scaleTree(['shopwave/scale.py', 'shopwave/metrics.py', 'explore/spill.py'], 'explore/spill.py', ['explore/spill.py']),
  editor: { file: 'explore/spill.py', code, highlight: [...linesFrom(code, 'conf = {"spark.shuffle', 'if limit else {}'), ...linesFrom(code, 'ordered = sales.sortWithinPartitions')] },
  session,
  side: [
    {
      type: 'table', id: 'runs', title: 'The sort stage, twice', tone: 'store', columns: ['memory', 'tasks', 'spilled (memory)', 'spilled (disk)'],
      rows: runs.map((r) => ({ id: `r-${r.label}`, cells: [r.label, r.tasks, `${r.mem} MB`, `${r.disk} MB`], tone: r.label === 'squeezed' ? 'consume' as const : undefined })),
    },
    {
      type: 'group', id: 'sort', title: 'One task, sorting its rows', icon: 'cpu', tone: 'ingest', children: [
        { type: 'item', id: 's-fill', title: 'rows sorted in execution memory', sub: 'until the task’s share is full', icon: 'memory' },
        { type: 'item', id: 's-spill', title: 'a sorted run written to disk', sub: `${squeezed.mem} MB as rows → ${squeezed.disk} MB serialized`, icon: 'disk', tone: 'consume' },
        { type: 'item', id: 's-merge', title: 'the runs merged at the end', sub: 'the same result, read back from disk', icon: 'layers' },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'Spill is how Spark survives too little memory: slower, never wrong. The fixes: more memory per task, fewer rows per task (more partitions), or less data (filter and select first).' },
  ],
  edges: [
    { from: 's-fill', to: 's-spill' },
    { from: 's-spill', to: 's-merge' },
  ],
})
