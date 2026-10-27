import type { SceneModel } from '@graphlearning/graphl-flow'
import { analyticsKpis } from './kpis'
import { analyticsWindows } from './windows'
import { analyticsFrames } from './frames'
import { analyticsSessions } from './sessions'
import { analyticsFunnel } from './funnel'
import { analyticsCohorts } from './cohorts'
import { analyticsRfm } from './rfm'
import { analyticsAttribution } from './attribution'
import { analyticsSql } from './sql'

export const analyticsScenes: Record<string, SceneModel> = {
  'analytics-kpis': analyticsKpis,
  'analytics-windows': analyticsWindows,
  'analytics-frames': analyticsFrames,
  'analytics-sessions': analyticsSessions,
  'analytics-funnel': analyticsFunnel,
  'analytics-cohorts': analyticsCohorts,
  'analytics-rfm': analyticsRfm,
  'analytics-attribution': analyticsAttribution,
  'analytics-sql': analyticsSql,
}
