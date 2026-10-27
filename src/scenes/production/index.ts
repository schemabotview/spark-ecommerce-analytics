import type { SceneModel } from '@graphlearning/graphl-flow'
import { productionJobs } from './jobs'
import { productionTests } from './tests'
import { productionChecks } from './checks'
import { productionCluster } from './cluster'
import { productionBackfill } from './backfill'
import { productionNightly } from './nightly'
import { productionWhereNext } from './where-next'

export const productionScenes: Record<string, SceneModel> = {
  'production-jobs': productionJobs,
  'production-tests': productionTests,
  'production-checks': productionChecks,
  'production-cluster': productionCluster,
  'production-backfill': productionBackfill,
  'production-nightly': productionNightly,
  'production-where-next': productionWhereNext,
}
