import type { Section } from '../types'

export const cdcWithMerge: Section = {
  id: 'cdc-with-merge',
  title: 'CDC with MERGE',
  scene: 'lakehouse-merge',
  narration:
    "Orders do not stay paid. They ship, and then they are delivered, and the shop's database publishes every change as an event: a change data capture feed. A week of it is one thousand nine hundred and seventy six changes, and five hundred and thirty seven orders changed twice in that week, shipped one day and delivered a few days later. Merge is how Delta applies such a feed: match each source row to a target row by order id, and update the matched ones. Merged as it comes, the feed fails. Two source rows match the same order, and Delta refuses to guess which one wins. So latest keeps only the newest change per order, with row number over a window, and the merge also checks that the change is newer than what the table already holds, so an old event replayed late cannot undo a new one. The result: one thousand four hundred and thirty nine orders updated, in a single commit. Paid orders fall, shipped and delivered appear, and cancelled and placed orders are untouched. In a folder of Parquet, an update means rewriting the whole table. Merge rewrites only the files that hold matched rows.",
}
