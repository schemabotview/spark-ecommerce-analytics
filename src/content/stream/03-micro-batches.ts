import type { Section } from '../types'

export const microBatches: Section = {
  id: 'micro-batches',
  title: 'A stream is a series of small batch jobs',
  scene: 'stream-micro-batches',
  narration:
    'How does Spark run a query on data that never ends? It does not, quite: it runs a series of small batch jobs, called micro batches. This lab limits each batch to three hundred records and reads its own progress reports. Each batch starts with a trigger: Spark looks at the end offsets in every partition and plans a range, no more than three hundred records, spread across the partitions in proportion. Before running anything, it writes that range to the checkpoint, in a file named after the batch number under offsets. Then the batch runs, as an ordinary Spark job over exactly that range. When the sink has the results, Spark writes a matching file under commits. Here that is four batches: two hundred and ninety eight records, two hundred and ninety nine, two hundred and ninety nine, and the last single record. Offsets and commits each hold four files, zero to three. That pair of folders is the whole trick. If the query stops, a restart reads the checkpoint, finds the last batch that was planned but not committed, and runs exactly that range again.',
}
