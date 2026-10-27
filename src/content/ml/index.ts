import type { Course } from '../types'
import { ratings } from './01-ratings'
import { mlPipelines } from './02-ml-pipelines'
import { distributedAls } from './03-distributed-als'
import { evaluatingHonestly } from './04-evaluating-honestly'
import { scoringEveryone } from './05-scoring-everyone'
import { whenNotToUseSpark } from './06-when-not-to-use-spark'

export const ml: Course = {
  id: 'ml',
  title: 'Recommendations',
  sections: [ratings, mlPipelines, distributedAls, evaluatingHonestly, scoringEveryone, whenNotToUseSpark],
}
