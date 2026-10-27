import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { scaleTree } from './tree'
import code from '../../../spine/scale/04-cache/project/explore/cache.py?raw'
import session from '../../../spine/scale/04-cache/session.txt?raw'

// §4 — caching. Seconds are volatile: the plot and table read them from the session; the narration
// never says them.
const out = outputOf(session, 'python -m explore.cache')
const questions = ['revenue', 'by country', 'qty > 2']
const secs = (label: string) => out.match(new RegExp(`cache ${label}\\s+(.+)`))![1].trim().split(/\s+/).map(Number)
const [off, on] = [secs('off'), secs('on')]
const [, parts, mem] = out.match(/cached: (\d+) partitions · (\d+) MB in memory/)!

export const scaleCache: SceneModel = ideFrame({
  tree: scaleTree(['shopwave/scale.py', 'explore/cache.py'], 'explore/cache.py', ['explore/cache.py']),
  editor: { file: 'explore/cache.py', code, highlight: linesFrom(code, 'if cached:', 'sales = sales.cache()') },
  session,
  side: [
    {
      type: 'plot', id: 'plot', title: 'Seconds per question: plain, then cached', compact: true,
      x: { labels: questions.flatMap((q) => [q.replace('by ', ''), 'cached']) }, y: { label: 'seconds', min: 0 },
      series: [
        { kind: 'bar', points: off.map((s, i) => [2 * i, s] as [number, number]), tone: 'infra' },
        { kind: 'bar', points: on.map((s, i) => [2 * i + 1, s] as [number, number]), tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'when', title: `cache(): ${parts} partitions, ${mem} MB in memory`, tone: 'store', columns: ['', 'cache helps', 'cache hurts'], rows: [
        { id: 'w-use', cells: ['reused', 'by several actions', 'used once'] },
        { id: 'w-size', cells: ['size', 'fits in storage memory', 'evicts, or spills'] },
        { id: 'w-first', cells: ['first action', 'pays to fill it', 'pays for nothing'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: 'cache() is lazy: the first action fills it and runs no faster. Free it with unpersist() when you are done.' },
  ],
})
