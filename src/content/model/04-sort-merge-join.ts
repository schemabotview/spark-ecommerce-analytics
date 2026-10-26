import type { Section } from '../types'

export const sortMergeJoin: Section = {
  id: 'sort-merge-join',
  title: 'Sort-merge join: shuffle both sides',
  scene: 'model-sort-merge',
  narration:
    "How does Spark join two big tables? This experiment joins order lines to orders, and first switches off broadcasting, which our small month would otherwise use, so we see the join Spark uses when both sides are large: the sort merge join. The plan, printed by the script and drawn on the right, reads from the bottom. Each side is scanned, then goes through an exchange, which is a shuffle on order id: every row is sent to the task that owns its order id's partition. So order lines and orders with the same id meet in the same task. Each side is then sorted by order id. And finally the merge join walks the two sorted lists together, like merging two sorted decks of cards, emitting every matching pair in a single pass. It needs no table to fit in memory, which is why it works at any size and is Spark's default for large joins. The cost is in the exchanges. Both sides cross the shuffle in full: one hundred and sixty thousand bytes here for seven thousand rows, and on a real year, gigabytes. The same join will be needed again and again, so it is worth asking whether one side could avoid moving at all. When one side is small, it can.",
}
