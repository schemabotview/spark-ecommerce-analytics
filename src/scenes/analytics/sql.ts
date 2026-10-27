import type { SceneModel } from '@graphlearning/graphl-flow'
import { ideFrame, linesFrom } from '../ide'
import { outputOf } from '../lab'
import { analyticsTree } from './tree'
import code from '../../../spine/analytics/09-sql/project/sql/funnel.sql?raw'
import session from '../../../spine/analytics/09-sql/session.txt?raw'

// §9 — Spark SQL. Both answers and the plan comparison are the session's.
const out = outputOf(session, 'python -m explore.sql')
const parse = (who: string) => Object.entries(JSON.parse(out.match(new RegExp(`${who}:\\s+(\\{.+\\})`))![1].replaceAll("'", '"')) as Record<string, number>)
const sql = parse('SQL'), df = parse('DataFrame')
const same = out.match(/same optimized plan: (\w+)/)![1]

export const analyticsSql: SceneModel = ideFrame({
  tree: analyticsTree(['shopwave/analytics.py', 'sql/funnel.sql', 'explore/attribution.py', 'explore/sql.py'], 'sql/funnel.sql', ['sql/funnel.sql', 'explore/sql.py']),
  editor: { file: 'sql/funnel.sql', code, lang: 'sql', highlight: linesFrom(code, 'FROM visits', 'GROUP BY session_id') },
  session,
  side: [
    {
      type: 'group', id: 'paths', title: 'Two ways in, one engine', icon: 'workflow', tone: 'ingest', children: [
        {
          type: 'group', id: 'front', bare: true, dir: 'row', children: [
            { type: 'item', id: 'p-sql', title: 'spark.sql(funnel.sql)', sub: 'over the view "visits"', icon: 'code' },
            { type: 'item', id: 'p-df', title: 'analytics.funnel(df)', sub: 'the DataFrame API', icon: 'python' },
          ],
        },
        { type: 'item', id: 'p-catalyst', title: `Catalyst: the same optimized plan: ${same}`, sub: 'and so the same tasks', icon: 'spark', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'answers', title: 'October’s funnel, both ways', tone: 'store', columns: ['step', 'SQL', 'DataFrame'],
      rows: sql.map(([k, v], i) => ({ id: `a-${k}`, cells: [k, v, df[i][1]] })),
    },
    {
      type: 'table', id: 'which', title: 'Which to write', tone: 'neutral', columns: ['', 'reads best for'], rows: [
        { id: 'w-sql', cells: ['SQL', 'analysts; long declarative queries'] },
        { id: 'w-df', cells: ['DataFrame API', 'reuse, tests, logic in functions'] },
        { id: 'w-both', cells: ['both', 'Python builds tables; SQL asks'] },
      ],
    },
    { type: 'note', id: 'note', tone: 'ingest', text: 'createOrReplaceTempView gives a DataFrame a SQL name for this session. Pick whichever reads better; neither is faster.' },
  ],
  edges: [{ from: 'front', to: 'p-catalyst', label: 'parse → plan' }],
})
