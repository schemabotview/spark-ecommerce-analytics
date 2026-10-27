import type { Section } from '../types'

export const spill: Section = {
  id: 'spill',
  title: 'Spill',
  scene: 'scale-spill',
  narration:
    "When a task runs out of execution memory, it spills. This script sorts the whole year of order lines within eight partitions, twice. With Spark's memory as it is, every task's rows fit, and nothing spills. The second run squeezes each task, with an internal setting that forces a spill after a hundred thousand rows, the way a too small executor behaves on real volumes. Now every task fills its memory, writes a sorted run to disk, carries on, and merges the runs at the end. The stage metrics show two numbers for it. Spill in memory is the size the rows took as objects; spill on disk is the same rows serialized and compressed, much smaller. The result is identical: spill is slower, never wrong. In the Spark UI a stage with spill is the first place to look when a job is slow. The fixes, in order: give each task fewer rows, with more partitions; give it more memory; or give it less data, by filtering and selecting columns before the wide operation.",
}
