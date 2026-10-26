import type { Section } from '../types'

export const dailyRevenue: Section = {
  id: 'daily-revenue',
  title: 'Daily revenue: the first real job',
  scene: 'start-daily-revenue',
  narration:
    "Now the first question the business actually asked: how much did we sell each day in October? Daily revenue dot py reads the month, keeps the paid orders, and groups them by day. To date turns each timestamp into its calendar day. For each day it counts the orders, and sums the totals. The totals are strings, so we cast them to a decimal with two places, an exact type for money. Order by day sorts the result. The terminal shows the first three days: forty four orders and five thousand one hundred and fifty one euros on the first of October. The side pane follows the job. Reading and filtering happen inside each partition, independently. Grouping is different: all of one day's orders must end up in the same place to be added up, and they start out scattered across partitions. So Spark moves rows between tasks. That move is called a shuffle, and Course five is about why it is the expensive part. The last line writes the result as CSV, and here is a surprise: out slash daily revenue is a folder, not a file. Spark writes in parallel, one file per partition, so every write produces a folder of part files. The underscore success file is empty, and only says the write finished. This time there is a single part file, with a header and thirty one days, because Spark noticed the result was tiny and merged its partitions before writing. On a bigger job you would see many part files, written at the same time. That is our first useful output: revenue per day, computed by Spark.",
}
