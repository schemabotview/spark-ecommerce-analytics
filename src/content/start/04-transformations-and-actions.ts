import type { Section } from '../types'

export const transformationsAndActions: Section = {
  id: 'transformations-and-actions',
  title: 'Transformations and actions: nothing runs until you ask',
  scene: 'start-lazy',
  narration:
    "First, a small tidy-up: the session builder moved into its own file, session dot py, so every job starts Spark the same way with one line. Now, an experiment. Lazy dot py counts the jobs Spark has run after each line. Reading October costs one job, the small one we saw that reads the header. Filtering to paid orders: still one job. Filtering again to German orders, and keeping two columns: still one. Those lines returned instantly, and no data was touched. Then count, and the number jumps to three: the counting ran as the two jobs we met in the last section, and found three hundred and seventy five paid German orders. This is the most important idea in Spark. There are two kinds of method. A transformation, like filter, select or group by, returns a new DataFrame at once. It does not compute anything. It only adds a step to a plan. An action, like count, show or write, asks for an answer, and that is when Spark runs a job. So a DataFrame is not data in memory, it is a description of how to get the data. Why work this way? Because when the action arrives, Spark sees the whole plan at once, and can optimise it: it can read only the two columns we kept, and drop rows as early as possible. Course four looks inside that optimiser. For now, the rule is simple: nothing runs until you ask for a result.",
}
