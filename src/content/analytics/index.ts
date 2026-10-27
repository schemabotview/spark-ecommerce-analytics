import type { Course } from '../types'
import { kpis } from './01-kpis'
import { windowFunctions } from './02-window-functions'
import { frames } from './03-frames'
import { sessionization } from './04-sessionization'
import { theFunnel } from './05-the-funnel'
import { cohortRetention } from './06-cohort-retention'
import { rfmSegments } from './07-rfm-segments'
import { attribution } from './08-attribution'
import { sparkSql } from './09-spark-sql'

export const analytics: Course = {
  id: 'analytics',
  title: 'Answer the business',
  sections: [kpis, windowFunctions, frames, sessionization, theFunnel, cohortRetention, rfmSegments, attribution, sparkSql],
}
