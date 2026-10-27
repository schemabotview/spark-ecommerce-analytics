import type { Section } from '../types'

export const idempotentRunsAndBackfills: Section = {
  id: 'idempotent-runs-and-backfills',
  title: 'Idempotent runs and backfills',
  scene: 'production-backfill',
  narration:
    "Jobs fail and get retried, and history needs rebuilding when a bug is fixed. Both are only safe if running a job twice gives the same result as running it once. Daily dot py builds one day of a daily sales table from gold, and writes it with overwrite and replace where, limited to that day: one Delta commit removes that day's rows and adds the new ones, and every other day is untouched. Built for October the fifth, the table has eleven rows. Built again, still eleven, with the same revenue. A backfill is the same job over a range: the first week of October gives eighty three rows over seven days, and running the whole backfill again gives exactly the same table. Had the job appended instead, every retry would have doubled a day. The rule for production jobs: each one replaces exactly the slice of data it owns.",
}
