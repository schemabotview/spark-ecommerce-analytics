import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { SIDE_W, ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { view } from '../fold'
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

export const scaleCache: SceneModel = ideFrame2({
  model: 'Cache what several actions reuse',
  tree: scaleTree(['shopwave/scale.py', 'explore/cache.py'], 'explore/cache.py', ['explore/cache.py']),
  editor: { file: 'explore/cache.py', code, ...view(code, 'questions = {', 'cached: {rdd'), highlight: linesFrom(code, 'if cached:', 'sales = sales.cache()') },
  session,
  side: [
    {
      type: 'plot', id: 'plot', title: 'Seconds per question: plain (orange), cached (green)', compact: true, w: SIDE_W - 34,
      x: { labels: questions.flatMap((q) => [q.replace('by ', '').replace(' ', ''), '']) }, y: { label: 'seconds', min: 0, max: Math.ceil(Math.max(...off, ...on)) },
      series: [
        { kind: 'bar', points: off.map((s, i) => [2 * i, s] as [number, number]), tone: 'infra' },
        { kind: 'bar', points: on.map((s, i) => [2 * i + 1, s] as [number, number]), tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'when', title: `cache(): ${parts} partitions, ${mem} MB in memory`, tone: 'store', columns: ['', 'helps', 'hurts'], rows: [
        { id: 'w-use', cells: ['reused', 'by several', 'once'] },
        { id: 'w-size', cells: ['size', 'fits memory', 'evicts, spills'] },
        { id: 'w-first', cells: ['1st action', 'pays to fill', 'pays for nothing'] },
      ],
    },
  ],
})
