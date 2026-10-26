import type { Section } from '../types'

export const adaptiveQueryExecution: Section = {
  id: 'adaptive-query-execution',
  title: 'Adaptive Query Execution: re-planning mid-job',
  scene: 'model-aqe',
  narration:
    "Adaptive query execution, AQE, lets Spark change its plan while a job runs, once the real sizes are known. A shuffle is a natural checkpoint: when a stage finishes, Spark knows exactly how many bytes landed in every partition, and it can re-plan the next stage with facts instead of estimates. AQE does three things with them. It merges partitions that are too small, so there are no empty tasks. It splits a partition that is far bigger than the rest, so a skewed join is shared out. And it can switch a sort merge join to a broadcast, if one side turned out to be small. That last one is switched off here, to watch the skew handling on its own. AQE's thresholds are sized for real data, where a partition counts as skewed above two hundred and fifty six megabytes. Our month is tiny, so the script scales the thresholds down to kilobytes. The rules are the same; only the numbers are smaller. Then the skewed join from the last section runs twice. With AQE off: two hundred tasks, the largest one thousand one hundred and fifty four rows. With AQE on: thirteen tasks, and the largest is eight hundred and nineteen rows, because the bestseller's partition was cut into pieces. Notice that the join read two more rows with AQE on. That is the proof of the split: product one's single dimension row was copied to each extra piece, so each piece can still be joined. AQE has been on by default since Spark three point two, which is one more reason to stay on a current version.",
}
