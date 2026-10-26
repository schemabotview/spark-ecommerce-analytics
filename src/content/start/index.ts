import type { Course } from '../types'
import { aProject } from './01-a-project'
import { firstDataframe } from './02-first-dataframe'
import { whereAJobRuns } from './03-where-a-job-runs'
import { transformationsAndActions } from './04-transformations-and-actions'
import { dailyRevenue } from './05-daily-revenue'
import { twoErrors } from './06-two-errors'

export const start: Course = {
  id: 'start',
  title: 'The first job',
  sections: [aProject, firstDataframe, whereAJobRuns, transformationsAndActions, dailyRevenue, twoErrors],
}
