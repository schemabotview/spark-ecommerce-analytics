import type { Section } from '../types'

export const nulls: Section = {
  id: 'nulls',
  title: 'Nulls and conditions',
  scene: 'clean-nulls',
  narration:
    "An anonymous visitor has no user id. Spark stores that as null: not zero, not empty, but unknown. And unknown behaves strangely in comparisons. The experiment counts October's thirty one thousand and forty six events. Eleven thousand three hundred and ninety seven have a null user id. Twenty one belong to customer two three nine. So how many do not belong to customer two three nine? Equals not, says nineteen thousand six hundred and twenty eight. Add the twenty one, and you get nineteen thousand six hundred and forty nine, not thirty one thousand. The anonymous events vanished from both answers. A comparison with null is itself null, unknown, and a filter keeps only rows where the condition is true. Is that event from customer two three nine? Unknown, so it is dropped, either way. When nulls should count as not equal, the null safe operator says so: not, user id null safe equals two three nine, keeps all thirty one thousand and twenty five. Silver also stops passing the problem on. A new column, visitor, uses coalesce, which returns its first argument that is not null: the customer's id when they are logged in, otherwise the browser's anonymous id. Every event now has a visitor. And when otherwise, Spark's if then else, labels each event as from a customer, or anonymous. The rule of thumb: decide what null means for each column once, in silver, and never let a query downstream rediscover it.",
}
