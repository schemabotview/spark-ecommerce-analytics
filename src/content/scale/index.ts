import type { Course } from '../types'
import { readingAJob } from './01-reading-a-job'
import { executorMemory } from './02-executor-memory'
import { spill } from './03-spill'
import { caching } from './04-caching'
import { partitionSizing } from './05-partition-sizing'
import { thePlanAsATuningTool } from './06-the-plan-as-a-tuning-tool'
import { dataSkipping } from './07-data-skipping'
import { coresAndTime } from './08-cores-and-time'

export const scale: Course = {
  id: 'scale',
  title: 'The full year, measured',
  sections: [readingAJob, executorMemory, spill, caching, partitionSizing, thePlanAsATuningTool, dataSkipping, coresAndTime],
}
