import type { Section } from '../types'

export const catalyst: Section = {
  id: 'catalyst',
  title: 'Catalyst: how Spark rewrites a query',
  scene: 'clean-catalyst',
  narration:
    "Why does writing order not matter much in Spark? Because the code is not run as written. This lab builds German revenue in cents the clumsy way queries really grow: a column computed before it is needed, multiplied by ten times ten, and two filters in two different places, then asks Spark to explain every stage of planning. The first box is the analyzed plan: our code, with every name checked against the data, bottom to top. Read from the relation up: project all eight columns plus cents, filter on status, project three columns, filter on country, aggregate. Then Catalyst, Spark's optimiser, rewrites it with rules, and the second box is the result. The two filters have merged into one and moved straight onto the relation. Ten times ten has become one hundred. And only the columns the answer needs survive. The table on the right lists the rules that actually changed the plan, taken from Spark's own rule metrics. Column pruning dropped the unused columns. Push down predicates moved the filters toward the data. Collapse project merged the selects. Constant folding computed ten times ten once, instead of for every row. And infer filters from constraints added is not null checks that let the scan skip rows early. The third box is the physical plan: the operators that actually run as tasks. The file scan reads just three columns and receives the filters, a partial aggregate runs in each task, an exchange shuffles by country, and a final aggregate adds up. This is also why built in functions beat UDFs: Catalyst can only optimise what it can see.",
}
