import type { Section } from '../types'

export const partitions: Section = {
  id: 'partitions',
  title: 'Partitions: how many tasks, how many files',
  scene: 'model-partitions',
  narration:
    "How many tasks does a shuffle use? Whatever spark dot sql dot shuffle dot partitions says, and the default is two hundred. The experiment switches off adaptive execution, to see Spark's raw behaviour, and groups October and November's sales by day. Sixty one days of results, and two hundred tasks to compute them, but only fifty five of those tasks received any rows at all. The other one hundred and forty five were scheduled, started and finished with nothing to do. Two hundred is a sensible number for gigabytes of data. For a month, it is mostly overhead. Set it to eight, and the same query runs as eight tasks, all of them busy. The number of partitions also decides the number of files a write produces, one per partition. To change it before writing there are two tools. Coalesce, to a smaller number, merges neighbouring partitions without a shuffle, which is cheap but can leave uneven sizes: coalesce one wrote a single file. Repartition does a full shuffle and produces partitions of even size, more or fewer: repartition four wrote four files. A note on the code: the query is built again after changing the setting, because a DataFrame keeps the plan it made the first time it ran. Choosing these numbers by hand for every job does not scale, and the right number changes as data grows. Two sections from now, Spark picks it while the job runs.",
}
