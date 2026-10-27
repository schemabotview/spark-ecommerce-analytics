import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
import { scaleTree } from './tree'
import code from '../../../spine/scale/08-cores/project/explore/cores.py?raw'
import session from '../../../spine/scale/08-cores/session.txt?raw'

// §8 — cores and time. Seconds and speed-ups are volatile: the plot reads them from the session.
const out = outputOf(session, 'python -m explore.cores')
const runs = [...out.matchAll(/local\[(\d+)\]:\s+([\d.]+) s · ([\d.]+)×/g)].map(([, c, s, x]) => ({ cores: +c, secs: +s, speedup: +x }))
const cpus = outputOf(session, 'nproc').trim()

export const scaleCores: SceneModel = ideFrame({
  tree: scaleTree(['shopwave/scale.py', 'explore/cores.py'], 'explore/cores.py', ['explore/cores.py']),
  editor: { file: 'explore/cores.py', code, ...view(code, 'if len(sys.argv) > 1'), highlight: [...linesFrom(code, 'spark = spark_session(**{"spark.master"'), ...linesFrom(code, 'start = time.perf_counter()', 'print(f"{time.perf_counter()')] },
  session,
  side: [
    {
      type: 'plot', id: 'plot', title: 'Speed-up over 1 core, the same job', compact: true,
      x: { label: 'cores (local[n])', min: 0, max: runs.length, step: 1 }, y: { label: '× faster', min: 0, max: runs.length, step: 1 },
      series: [
        { kind: 'segment', from: [1, 1], to: [runs.length, runs.length], label: 'perfect' },
        { kind: 'line', points: runs.map((r) => [r.cores, r.speedup] as [number, number]), tone: 'store', label: 'measured' },
      ],
    },
    {
      type: 'group', id: 'why', title: `Why it flattens, on ${cpus} CPUs`, icon: 'cpu', tone: 'ingest', children: [
        { type: 'item', id: 'w-serial', title: 'the parts that do not split', sub: 'planning, the final reduce, starting tasks', icon: 'layers' },
        { type: 'item', id: 'w-shared', title: 'the shared machine', sub: 'one disk, one memory bus, the OS', icon: 'server' },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'More cores help until something they share runs out. On a cluster the same curve flattens on the network and the shuffle: measure before you buy.' },
  ],
})
