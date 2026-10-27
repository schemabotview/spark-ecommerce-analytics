import type { SceneModel } from '@graphlearning/graphl-flow'
import { terminal } from '../ide'
import { outputOf } from '../lab'
import session from '../../../spine/intro/03-why-not-pandas/session.txt?raw'

// §3 — ◆ full scene: why not pandas. Lines, memory and seconds are the lab's (volatile: the scene
// reads them, the narration never says them).
const out = outputOf(session, 'python why_not_pandas.py')
const runs = [...out.matchAll(/pandas, (one day|the year)\s*:\s+(\d+) lines ·\s+(\d+) MB in memory ·\s+([\d.]+) s/g)].map(([, label, lines, mb, s]) => ({ label, lines, mb, s }))
const [day, year] = runs
const spark = out.match(/Spark,\s+the year\s+: (\d+) countries · data streamed through (\d+) tasks ·\s+([\d.]+) s/)!

export const introWhyNotPandas: SceneModel = {
  title: 'Why not pandas? It holds everything, in one process',
  sub: 'Revenue by country at scale factor 1: one day, then the year; pandas, then Spark',
  nodes: [
    {
      type: 'group', id: 'cmp', bare: true, dir: 'row', children: [
        {
          type: 'group', id: 'pandas', badge: 1, title: 'pandas', sub: 'every row in memory, at once', icon: 'pandas', tone: 'ingest', children: [
            { type: 'item', id: 'p-day', title: `one day: ${day.lines} lines`, sub: `${day.mb} MB in memory`, icon: 'table' },
            { type: 'item', id: 'p-year', title: `the year: ${year.lines} lines`, sub: `${year.mb} MB in memory, ${year.s} s`, icon: 'memory', tone: 'consume' },
            { type: 'item', id: 'p-next', title: 'ten years, or ten shops', sub: 'ten times the memory: a bigger machine, then none', icon: 'zap', tone: 'consume' },
          ],
        },
        {
          type: 'group', id: 'spark', badge: 2, title: 'Spark', sub: 'the data streams through tasks', icon: 'spark', tone: 'store', children: [
            { type: 'item', id: 's-year', title: `the year: ${spark[1]} countries`, sub: `${spark[2]} tasks, ${spark[3]} s`, icon: 'cpu', tone: 'store' },
            { type: 'item', id: 's-mem', title: 'each task holds its partition', sub: 'memory set by the task, not the data', icon: 'layers' },
            { type: 'item', id: 's-next', title: 'ten times the data', sub: 'more tasks, or more machines: the same code', icon: 'network', tone: 'store' },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'proof', title: 'The lab, run', icon: 'terminal', tone: 'neutral', children: [
        { type: 'code', id: 'out', terminal: true, filename: 'terminal — shopwave', code: terminal(session) },
      ],
    },
  ],
  edges: [{ from: 'pandas', to: 'spark', label: 'outgrows' }],
}
