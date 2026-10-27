import type { Section } from '../types'

export const whyNotPandas: Section = {
  id: 'why-not-pandas',
  title: 'Why not pandas',
  scene: 'intro-why-not-pandas',
  narration:
    "If you know Python, you know pandas, so why learn Spark at all? This lab answers with a measurement. It computes revenue by country from Shopwave's order exports at scale factor one, first for one day, then for the whole year, in pandas. One day is a few thousand lines and a few megabytes: instant. The whole year is over three million lines, and pandas holds every one of them in memory at once, several times the size of the files on disk, because that is how pandas works: a DataFrame is in memory, in one process. That is fine today. But ten years of history, or ten shops, needs ten times the memory, and at some point no single machine has it. Then Spark runs the same report. Its data is never all in memory at once: it streams through four tasks, each holding only its own slice, so memory is set by the size of a task, not the size of the data. Ten times the data means more tasks, or more machines, and the same code. Spark has a cost: a JVM to start and a plan to make, which is why on one day of data pandas wins easily. The rest of this course is about when that cost is worth paying, and how to make Spark fast once it is.",
}
