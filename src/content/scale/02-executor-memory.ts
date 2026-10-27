import type { Section } from '../types'

export const executorMemory: Section = {
  id: 'executor-memory',
  title: 'Executor memory: where a gigabyte goes',
  scene: 'scale-memory',
  narration:
    "Most Spark failures at scale are about memory, so before tuning anything, here is where an executor's memory goes. In local mode the driver is also the executor, and by default it gets one gigabyte of heap. Spark first keeps three hundred megabytes for itself, always. Of the rest, forty percent is user memory: your own objects, and the data a Python or Scala function builds while it runs. The other sixty percent is unified memory, which Spark manages, and it is shared between two uses. Storage holds cached DataFrames and broadcast tables. Execution holds the working data of shuffles, joins, sorts and aggregations. The boundary between them moves. Half of unified memory is storage's, protected; above that, execution can take memory back from storage by evicting cached blocks, because a running task matters more than a cache. When execution itself runs out, a task does not fail: it spills, writing what it holds to disk and reading it back later, which is the next section. User memory has no such escape hatch: too much there is an out of memory error. On a real cluster each executor also gets memory overhead outside the heap, ten percent or at least three hundred and eighty four megabytes, for the JVM itself and for Python workers. The lab reads every number here from the running JVM and Spark's own settings, and the last line is what the Spark UI would call storage memory: the whole unified pool.",
}
