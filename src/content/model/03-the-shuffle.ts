import type { Section } from '../types'

export const theShuffle: Section = {
  id: 'the-shuffle',
  title: 'The shuffle: where a groupBy moves data',
  scene: 'model-shuffle',
  narration:
    "Every join and every group by in Spark rests on one operation, the shuffle, and this lab shows it from Spark's own metrics. The query is revenue by country over the fact table. It runs as two stages. In the first, four map tasks each read their own partition of the order lines, seven thousand three hundred and eighty nine rows between them, and each one sums revenue per country, but only for the rows it holds. Each task then writes its partial sums to shuffle files on local disk, sorted into partitions by a hash of the country, so that every partial sum for Germany, from every task, lands in the same partition. Here that is only fifty two rows, a few hundred bytes per task, because the sums were combined before writing. That is a stage boundary. No task of the next stage can start until every map task has finished writing, because any of them might hold part of Germany's answer. In the second stage, reduce tasks read their partitions across the network and add the partial sums together into thirteen country totals. There are two hundred shuffle partitions by default, but adaptive query execution saw how little data there was and gave them all to a single task. The table at the bottom is the stage table the Spark UI shows. Shuffles are the expensive part of Spark: disk writes, network reads, and a barrier where the whole job waits for its slowest task. Most of Spark tuning is about shuffling less, or shuffling evenly.",
}
