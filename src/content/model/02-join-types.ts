import type { Section } from '../types'

export const joinTypes: Section = {
  id: 'join-types',
  title: 'Join types: what each one keeps',
  scene: 'model-join-types',
  narration:
    "A join pairs rows from two tables on a key, but which rows survive depends on the kind of join, and choosing the wrong one quietly changes answers. The experiment joins Shopwave's orders that were not cancelled, four thousand one hundred of them, to the payment provider's four thousand and sixty eight payments, on order id. An inner join keeps only pairs that match: four thousand and sixty eight rows. A left join keeps every order, with its payment if there is one, or nulls if not: four thousand one hundred and twelve rows. Why more rows than orders? Because twelve orders were paid twice, and a join pairs each order with every matching payment. That is the classic way joins inflate revenue. Then two joins that people often forget. A left semi join keeps the orders that have a payment, without adding any payment columns, and without duplicating anything: four thousand and fifty six. And a left anti join keeps the orders that have no payment at all: forty four orders, placed and never paid. One line of code finds money the shop is owed. Here are the first three. Semi and anti joins answer exists and does not exist questions, which in SQL you would write with exists or not in. Use them instead of a left join followed by a null filter: they say what you mean, never duplicate rows, and Spark can execute them more cheaply.",
}
