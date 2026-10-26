import type { Course } from '../types'
import { columnExpressions } from './01-column-expressions'
import { nulls } from './02-nulls'
import { deduplication } from './03-deduplication'
import { timeZones } from './04-time-zones'
import { pythonUdf } from './05-python-udf'
import { udfSpeed } from './06-udf-speed'
import { catalyst } from './07-catalyst'
import { qualityGates } from './08-quality-gates'

export const clean: Course = {
  id: 'clean',
  title: 'Clean and conform (silver)',
  sections: [columnExpressions, nulls, deduplication, timeZones, pythonUdf, udfSpeed, catalyst, qualityGates],
}
