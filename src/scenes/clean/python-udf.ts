import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { outputOf } from '../lab'
import { cleanTree } from './tree'
import code from '../../../spine/clean/05-python-udf/project/shopwave/silver.py?raw'
import session from '../../../spine/clean/05-python-udf/session.txt?raw'

// §5 — a Python UDF. The counts, the top visitors and the plan's Python steps are the session's.
const out = outputOf(session, 'python -m explore.bots')
const top = [...out.matchAll(/^ {2}(\S+)\s+bot=(\w+)\s+(\d+) events$/gm)].map((m) => m.slice(1))
const use = lineOf(code, 'is_bot("context.user_agent")')
const steps = out.match(/plan steps that call Python: (\d+)/)![1]

export const cleanPythonUdf: SceneModel = ideFrame2({
  model: 'A Python UDF ships every row out',
  tree: cleanTree(['shopwave/bronze.py', 'shopwave/schemas.py', 'shopwave/session.py', 'shopwave/silver.py', 'explore/bots.py'],
    'shopwave/silver.py', ['explore/bots.py']),
  editor: {
    file: 'shopwave/silver.py', code,
    show: [[lineOf(code, 'BOT = '), lineOf(code, 'return bool(')], [use - 1, use]],
    highlight: [...linesFrom(code, '@F.udf(BooleanType())', 'return bool('), use],
  },
  session,
  side: [
    {
      type: 'group', id: 'trip', title: 'Every row, there and back', icon: 'network', tone: 'consume', children: [
        { type: 'item', id: 't-jvm', title: 'executor (JVM)', sub: 'holds the rows', icon: 'cpu' },
        { type: 'item', id: 't-py', title: 'a Python worker process', sub: 'runs is_bot on each user agent', icon: 'python' },
        { type: 'item', id: 't-back', title: 'back to the JVM', sub: `a BatchEvalPython step: ${steps} in this plan`, icon: 'cpu' },
      ],
    },
    {
      type: 'table', id: 'top', title: 'Busiest visitors in October', tone: 'ingest', columns: ['visitor', 'bot', 'events'],
      rows: top.map(([v, b, n], i) => ({ id: `v${i}`, cells: [v, b, n], tone: b === 'True' ? 'consume' as const : undefined })),
    },
  ],
  edges: [{ from: 't-jvm', to: 't-py', label: 'rows' }, { from: 't-py', to: 't-back', label: 'results' }],
})
