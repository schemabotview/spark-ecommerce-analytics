import type { Section } from '../types'

export const readingAJob: Section = {
  id: 'reading-a-job',
  title: 'Reading a job',
  scene: 'scale-event-log',
  narration:
    'This course measures. The data grows to scale factor one: the whole year, two million orders and three and a half million order lines, about two hundred megabytes of exports. Scale dot py reads them straight from the CSV folders and joins every paid order to its lines. To see what a job does, Spark can write an event log: every job, stage and task as a line of JSON. That is the same record the Spark UI is drawn from, which is why this course never needs a screenshot of it. The script switches the log on, runs revenue by country over the year, stops Spark so the log is complete, and reads every completed stage back. Two stages of twelve tasks each read a CSV folder, the orders and the order lines, and shuffle every row out, because the join needs both sides partitioned by order id. The third stage reads more than five million shuffled rows, joins them, and writes just fifty two partial sums. The last stage, one task, adds them up. The seconds column is real and changes with every run: read it as a proportion, the file reading stages take most of the time. The rest of this course works through what to do about each part.',
}
