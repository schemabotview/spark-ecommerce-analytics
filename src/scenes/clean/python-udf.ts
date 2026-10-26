import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, lineOf, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { cleanTree } from './tree'
import code from '../../../spine/clean/05-python-udf/project/shopwave/silver.py?raw'
import session from '../../../spine/clean/05-python-udf/session.txt?raw'

// §5 — a Python UDF. The counts, the top visitors and the plan's Python steps are the session's.
const out = outputOf(session, 'python -m explore.bots')
const byFlag = Object.fromEntries([...out.matchAll(/is_bot=(\w+)\s+(\d+) events/g)].map((m) => [m[1], m[2]]))
const top = [...out.matchAll(/^ {2}(\S+)\s+bot=(\w+)\s+(\d+) events$/gm)].map((m) => m.slice(1))
const agent = out.match(/its user agent: (.+)/)![1]
const use = lineOf(code, 'is_bot("context.user_agent")')
const steps = out.match(/plan steps that call Python: (\d+)/)![1]

export const cleanPythonUdf: SceneModel = ideFrame({
  tree: cleanTree(['shopwave/bronze.py', 'shopwave/schemas.py', 'shopwave/session.py', 'shopwave/silver.py', 'explore/bots.py'],
    'shopwave/silver.py', ['explore/bots.py']),
  editor: {
    file: 'shopwave/silver.py', code,
    show: [[lineOf(code, 'import re'), lineOf(code, 'return bool(')], [lineOf(code, 'def clicks('), lineOf(code, 'def clicks(')], [use - 2, use + 1]],
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
    {
      type: 'table', id: 'flags', title: 'is_bot, October', tone: 'consume', columns: ['is_bot', 'events'], rows: [
        { id: 'b-false', cells: ['False', byFlag.False] },
        { id: 'b-true', cells: ['True', byFlag.True], tone: 'consume' },
      ],
    },
    { type: 'note', id: 'note', tone: 'consume', text: `${byFlag.True} of ${+byFlag.True + +byFlag.False} events come from one scraper: "${agent}". A UDF is plain Python, and every row crosses into a Python process to run it.` },
  ],
  edges: [{ from: 't-jvm', to: 't-py', label: 'rows' }, { from: 't-py', to: 't-back', label: 'results' }],
})
