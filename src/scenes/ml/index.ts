import type { SceneModel } from '@graphlearning/graphl-flow'
import { mlRatings } from './ratings'
import { mlPipeline } from './pipeline'
import { mlDistributedAls } from './distributed-als'
import { mlEvaluate } from './evaluate'
import { mlScore } from './score'
import { mlWithoutSpark } from './without-spark'

export const mlScenes: Record<string, SceneModel> = {
  'ml-ratings': mlRatings,
  'ml-pipeline': mlPipeline,
  'ml-distributed-als': mlDistributedAls,
  'ml-evaluate': mlEvaluate,
  'ml-score': mlScore,
  'ml-without-spark': mlWithoutSpark,
}
