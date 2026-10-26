import type { Section } from '../types'

export const columnExpressions: Section = {
  id: 'column-expressions',
  title: 'Column expressions: bronze to silver',
  scene: 'clean-columns',
  narration:
    "Bronze kept every source as it came. Silver is the next layer: the same data, made clean and consistent, so every later question starts from the same trustworthy tables. Silver dot py starts with the clicks, and it is one select. Each argument is a column expression. A plain string, like event id, just picks a column. F dot col of context dot device reaches into the struct and, with alias, gives the result a new name, device. A function like to date makes a new column out of an existing one: the event's calendar day. Thirteen expressions in, and the nested context has become four flat columns that any tool can read. Bronze had ten columns; silver has thirteen. An expression is not a value. Printed, it is only a description, isNull of context dot campaign, just like a DataFrame is only a plan. It is computed inside an action, for every row, by the executors. The terminal shows the first clicks that came from a campaign, with their day and device. This style, one select listing every column of the output, is worth the extra lines: a reader sees the whole shape of the silver table in one place, and nothing sneaks in from upstream. Silver tables are what analysts, dashboards and the rest of this course will read, so their columns are chosen on purpose, one by one.",
}
