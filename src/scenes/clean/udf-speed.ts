import type { SceneModel } from '@graphlearning/graphl-flow'
import { lastLine, lineOf, linesFrom } from '../ide'
import { SIDE_W, ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { cleanTree } from './tree'
import code from '../../../spine/clean/06-udf-speed/project/explore/udf_speed.py?raw'
import session from '../../../spine/clean/06-udf-speed/session.txt?raw'

// §6 — the bot rule three ways, timed. The step is volatile: the seconds are READ from the session
// (never typed) and plotted, and the narration does not say them.
const out = outputOf(session, 'python -m explore.udf_speed')
const rows = out.match(/rows: (\d+)/)![1]
const arrow = out.match(/Arrow batches: (\w+)/)![1]
const runs = [...out.matchAll(/^(built-in rlike|pandas UDF|Python UDF)\s+(\d+) bots\s+([\d.]+) s$/gm)].map((m) => ({ name: m[1], s: +m[3] }))
const max = Math.ceil(Math.max(...runs.map((r) => r.s)))

export const cleanUdfSpeed: SceneModel = ideFrame2({
  model: 'Keep the rule in the JVM',
  tree: cleanTree(['shopwave/bronze.py', 'shopwave/session.py', 'shopwave/silver.py', 'explore/bots.py', 'explore/udf_speed.py', 'requirements.txt'],
    'explore/udf_speed.py', ['explore/udf_speed.py'], { 'requirements.txt': '+ pandas' }),
  editor: { file: 'explore/udf_speed.py', code, show: [[lineOf(code, 'def python_udf'), lineOf(code, 'return bool(')], [lineOf(code, 'def pandas_udf'), lineOf(code, 'return agents')], [lineOf(code, 'for name, rule in'), lineOf(code, '("Python UDF"')], [lineOf(code, 'bots = agents'), lastLine(code)]], highlight: [...linesFrom(code, 'def python_udf', 'return bool('), ...linesFrom(code, 'def pandas_udf', 'return agents'), ...linesFrom(code, 'for name, rule in', '("Python UDF"')] },
  session,
  side: [
    {
      type: 'plot', id: 'times', title: `Seconds for ${(+rows / 1e6).toFixed(1)} M user agents`, compact: true, w: SIDE_W - 34,
      x: { labels: runs.map((r) => r.name.split(' ')[0].replace('built-in', 'rlike')) }, y: { min: 0, max, label: 'seconds' },
      series: runs.map((r, i) => ({ kind: 'bar' as const, points: [[i, r.s] as [number, number]], tone: i === 0 ? 'store' as const : 'consume' as const })),
    },
    {
      type: 'table', id: 'where', title: 'Where the rule runs', tone: 'ingest', columns: ['', 'runs in', 'rows go'], rows: [
        { id: 'w-built', cells: ['built-in rlike', 'the JVM', 'never'], tone: 'store' },
        { id: 'w-pandas', cells: ['pandas UDF', 'Python', 'in batches'] },
        { id: 'w-python', cells: ['Python UDF', 'Python', arrow === 'true' ? 'in batches' : 'one by one'] },
      ],
    },
  ],
})
