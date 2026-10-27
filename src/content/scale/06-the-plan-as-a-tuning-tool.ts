import type { Section } from '../types'

export const thePlanAsATuningTool: Section = {
  id: 'the-plan-as-a-tuning-tool',
  title: 'The plan as a tuning tool',
  scene: 'scale-plan-tuning',
  narration:
    "The same question two ways: how many orders came from Germany. The year is written as Parquet, sorted by country, so each file's minimum and maximum say which countries it holds. Written as a built in comparison, the filter appears in the plan as a pushed filter: the Parquet reader checks each file's statistics and reads only where Germany can be. Four hundred and eighty eight thousand rows read, exactly the answer. Written as a Python UDF, the filter is a black box. Spark cannot see that it compares country to a constant, so nothing is pushed, every one of the two million rows is read, and each is sent to a Python worker to be tested. The answer is identical. The work is four times bigger before the Python cost is even counted. One more thing surfaced while building this step: Spark four's default Arrow batched UDFs stalled on this scan, so the script uses the row at a time kind. Either way, the habit to take from here is to read the plan, the pushed filters and the columns read, whenever a query reads more than it should, and to keep filters in built in functions Spark can see.",
}
