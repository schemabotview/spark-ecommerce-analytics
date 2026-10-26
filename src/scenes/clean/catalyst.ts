import type { SceneModel } from '@graphlearning/graphl-flow'
import { outputOf } from '../lab'
import session from '../../../spine/clean/07-catalyst/session.txt?raw'

// §7 — ◆ full scene: Catalyst. The four plans and the rules that fired are the lab's
// (explain(mode="extended") and RuleExecutor's metrics); expression ids (#3) are dropped for
// reading, and each plan is cut to its operators.
const out = outputOf(session, 'python -m explore.catalyst')
const section = (title: string) => {
  const start = out.indexOf(`== ${title} ==`)
  const rest = out.slice(start).split('\n').slice(1)
  const end = rest.findIndex((l) => l.startsWith('== ') || l === '' || l.startsWith('answer:'))
  return rest.slice(0, end < 0 ? undefined : end)
}
// Expression ids (#3) dropped; a relation's 8 columns named once; long lines WRAPPED at a
// boundary (", " or " AND ", else a space), the continuation indented under its operator, never cut.
const tidy = (line: string, width: number) => {
  const l = line.replace(/#\d+L?/g, '')
    .replace(/(Relation|FileScan parquet) \[order_id,order_ts,customer_id,country,status,total,_source_file,_file_date\]/, '$1 [all 8 columns]')
    .replace(/\[order_id, order_ts, customer_id, country, status, total, _source_file, _file_date, /, '[all 8 columns, ')
    .replace(/, ENSURE_REQUIREMENTS, \[plan_id=\d+\]/, '')
    .replace(/ Batched: .*?PushedFilters: (\[[^\]]*\]).*$/, ' PushedFilters: $1')
  const indent = ' '.repeat(l.search(/\S/) + 3)
  const out: string[] = []
  let rest = l
  while (rest.length > width) {
    let cut = Math.max(rest.lastIndexOf(', ', width), rest.lastIndexOf(' AND ', width))
    if (cut <= indent.length) cut = rest.lastIndexOf(' ', width)  // else any space
    if (cut <= indent.length) break
    out.push(rest.slice(0, cut + 1).trimEnd())
    rest = indent + rest.slice(cut + 1).trimStart()
  }
  return [...out, rest].join('\n')
}
const plan = (title: string, width = 60) => section(title).map((l) => tidy(l, width)).join('\n')
const rules = [...out.matchAll(/^(\w+)\s+ran (\d+)x$/gm)].map((m) => m[1])
const answer = out.match(/answer: (\S+)/)![1]
const WHAT: Record<string, string> = {
  ColumnPruning: 'reads 3 of 8 columns',
  PushDownPredicates: 'moves filters to the scan',
  CollapseProject: 'merges the selects',
  ConstantFolding: '10 * 10 becomes 100',
  InferFiltersFromConstraints: 'adds isnotnull checks',
}

export const cleanCatalyst: SceneModel = {
  title: 'Catalyst: the plan Spark really runs',
  sub: `German revenue in cents (${answer}), written clumsily on purpose, through Spark's optimizer`,
  nodes: [
    {
      type: 'group', id: 'plans', bare: true, dir: 'row', children: [
        { type: 'group', id: 'analyzed', badge: 1, title: 'Analyzed', sub: 'your code, names checked', icon: 'code', tone: 'source', children: [
          { type: 'code', id: 'p1', lang: 'text', code: plan('Analyzed Logical Plan').split('\n').slice(1).join('\n') },
        ] },
        { type: 'group', id: 'optimized', badge: 2, title: 'Optimized', sub: 'rewritten by rules', icon: 'workflow', tone: 'ingest', children: [
          { type: 'code', id: 'p2', lang: 'text', code: plan('Optimized Logical Plan') },
        ] },
      ],
    },
    {
      type: 'group', id: 'bottom', bare: true, dir: 'row', children: [
        { type: 'group', id: 'physical', badge: 3, title: 'Physical', sub: 'operators that run as tasks', icon: 'cpu', tone: 'infra', children: [
          { type: 'code', id: 'p3', lang: 'text', code: plan('Physical Plan').split('\n').slice(1).join('\n') },
        ] },
        { type: 'group', id: 'rules', badge: 4, title: 'Rules that changed the plan', sub: 'from Spark’s own rule metrics', icon: 'check', tone: 'store', children: [
          { type: 'table', id: 'fired', columns: ['rule', 'did'], rows: rules.map((r) => ({ id: `r-${r}`, cells: [r, WHAT[r] ?? ''] })) },
        ] },
      ],
    },
  ],
  edges: [
    { from: 'analyzed', to: 'optimized', label: 'optimize' },
    { from: 'optimized', to: 'physical', label: 'plan' },
  ],
}
