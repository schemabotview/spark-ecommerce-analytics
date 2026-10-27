import type { Section } from '../types'

export const partitionSizing: Section = {
  id: 'partition-sizing',
  title: 'Partition sizing',
  scene: 'scale-partition-size',
  narration:
    'How many tasks read a folder of files is decided before the job starts. At scale factor one, the order items are three hundred and sixty five files, seventy megabytes, about two hundred kilobytes each. Spark packs files into input partitions of up to max partition bytes, a hundred and twenty eight megabytes by default. But it also charges every file an open cost of four megabytes, because opening a file is not free. Three hundred and sixty five files times four megabytes is a lot of pretend data, so the default gives twelve partitions, not one. At sixteen megabytes, ninety two. At one megabyte, smaller than a single file plus its open cost, every file gets at least one partition: three hundred and sixty nine. The usual target is around a hundred and twenty eight megabytes of real data per task, and a few tasks per core. Too few partitions leave cores idle; too many spend their time starting tasks and opening files. When a table is many small files, the fix is not a setting. It is compacting the files, as optimize did in the lakehouse course.',
}
