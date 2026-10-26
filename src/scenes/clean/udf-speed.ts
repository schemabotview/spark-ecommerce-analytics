import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { view } from '../fold'
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

export const cleanUdfSpeed: SceneModel = ideFrame({
  tree: cleanTree(['shopwave/bronze.py', 'shopwave/session.py', 'shopwave/silver.py', 'explore/bots.py', 'explore/udf_speed.py', 'requirements.txt'],
    'explore/udf_speed.py', ['explore/udf_speed.py'], { 'requirements.txt': '+ pandas' }),
  editor: { file: 'explore/udf_speed.py', code, ...view(code, '@F.udf(BooleanType())', undefined, 0), highlight: [...linesFrom(code, '@F.udf(BooleanType())', 'return bool('), ...linesFrom(code, '@F.pandas_udf', 'return agents'), ...linesFrom(code, 'for name, rule in', '("Python UDF"')] },
  session,
  side: [
    {
      type: 'plot', id: 'times', title: `Seconds for ${(+rows / 1e6).toFixed(1)} M user agents`, compact: true,
      x: { labels: runs.map((r) => r.name) }, y: { min: 0, max, label: 'seconds' },
      series: runs.map((r, i) => ({ kind: 'bar' as const, points: [[i, r.s] as [number, number]], tone: i === 0 ? 'store' as const : 'consume' as const })),
    },
    {
      type: 'table', id: 'where', title: 'Where the rule runs', tone: 'ingest', columns: ['', 'runs in', 'rows travel'], rows: [
        { id: 'w-built', cells: ['built-in rlike', 'the JVM', 'never'], tone: 'store' },
        { id: 'w-pandas', cells: ['pandas UDF', 'Python', 'as Arrow batches'] },
        { id: 'w-python', cells: ['Python UDF', 'Python', `as Arrow batches: ${arrow}`] },
      ],
    },
    {
      type: 'table', id: 'run', title: 'The run', tone: 'neutral', columns: ['', ''], rows: [
        { id: 'r-rows', cells: ['user agents', rows] },
        { id: 'r-each', cells: ['each rule', 'run twice, the second timed'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'store', text: 'Spark 4.2 sends plain Python UDFs in Arrow batches too, so they keep up with pandas UDFs. A built-in never leaves the JVM: silver.clicks now uses rlike.' },
  ],
})
