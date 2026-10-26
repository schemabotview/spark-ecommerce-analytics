import type { Section } from '../types'

export const skew: Section = {
  id: 'skew',
  title: 'Skew: one product, one slow task',
  scene: 'model-skew',
  narration:
    "Shopwave has a bestseller. Product one is sixteen percent of all order lines, one thousand one hundred and fifty three of seven thousand three hundred and eighty nine. That is normal in retail, and it is a problem for joins. A shuffle sends every row with the same key to the same task, so when the fact table is joined to the product dimension, every sale of product one goes to one task. The experiment runs that join with adaptive execution off, and reads every task's row count from the task metrics. To make sure Spark computes every column, it uses a no op write, which runs the whole query and writes nothing: a plain count would let Spark skip all but the product id, and measure almost nothing. The plot shows the largest six tasks and the median. The largest task read one thousand one hundred and fifty four rows, the bestseller; the median task read eighty four. That is fourteen times the typical work. Here it costs milliseconds. On a real Black Friday, with millions of lines, that one task runs for minutes while every other task is finished and idle, and the stage cannot end until it does. This is data skew, and it is the most common reason a Spark job that ran fine yesterday is slow today. Adding machines does not help: one key always lands in one task. The fix has to split the hot key.",
}
