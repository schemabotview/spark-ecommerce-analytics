import type { Course } from '../types'
import { jobsAsAPackage } from './01-jobs-as-a-package'
import { testingSparkCode } from './02-testing-spark-code'
import { dataQualityAsCode } from './03-data-quality-as-code'
import { aRealCluster } from './04-a-real-cluster'
import { idempotentRunsAndBackfills } from './05-idempotent-runs-and-backfills'
import { theWholePlatform } from './06-the-whole-platform'
import { whereNext } from './07-where-next'

export const production: Course = {
  id: 'production',
  title: 'Ship it',
  sections: [jobsAsAPackage, testingSparkCode, dataQualityAsCode, aRealCluster, idempotentRunsAndBackfills, theWholePlatform, whereNext],
}
