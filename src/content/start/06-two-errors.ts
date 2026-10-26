import type { Section } from '../types'

export const twoErrors: Section = {
  id: 'two-errors',
  title: 'Two kinds of error: in the plan, and in a task',
  scene: 'start-two-errors',
  narration:
    "Things will go wrong, and in Spark they go wrong in two different places. This script makes both mistakes on purpose. The first selects a column called totl, a typo. It fails immediately, on the select line, before any job has run: an analysis exception. While building the plan, the driver checks every name against the data's columns, and Spark even suggests the column we probably meant, total. The second mistake is subtler. We cast the total to an integer, to get whole euros. That line runs without complaint, because it is a transformation, and nothing has been computed. The error only appears at show, when a task actually meets a total with cents, which is not a whole number. Spark four is strict here: rather than quietly dropping the cents, or returning nothing, it stops the job. So, a wrong name fails as you write the line. A wrong value fails only when a task reaches it, possibly after a long job has been running for an hour. Notice how both errors are reported. Each one names a condition, in capitals: unresolved column, and cast invalid input. That condition is the thing to search for, in the documentation or anywhere else. The terminal stayed readable, because the full details, including the failed task's stack trace, went to logs slash spark dot log, where grep finds them. With a working session, a first real job, and a way to read its failures, Course three starts on the real problem: Shopwave's data, from every source, with all its flaws.",
}
