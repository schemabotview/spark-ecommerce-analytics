import type { SceneModel } from '@graphlearning/graphl-flow'
import { startProject } from './project'
import { startFirstDataframe } from './first-dataframe'
import { startDriverExecutors } from './driver-executors'
import { startLazy } from './lazy'
import { startDailyRevenue } from './daily-revenue'
import { startTwoErrors } from './two-errors'

export const startScenes: Record<string, SceneModel> = {
  'start-project': startProject,
  'start-first-dataframe': startFirstDataframe,
  'start-driver-executors': startDriverExecutors,
  'start-lazy': startLazy,
  'start-daily-revenue': startDailyRevenue,
  'start-two-errors': startTwoErrors,
}
