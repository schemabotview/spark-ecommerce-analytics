import type { Course } from '../types'
import { whatSparkIs } from './01-what-spark-is'
import { shopwave } from './02-shopwave'
import { whyNotPandas } from './03-why-not-pandas'

export const intro: Course = {
  id: 'intro',
  title: 'Spark, Shopwave, and why one machine is not enough',
  sections: [whatSparkIs, shopwave, whyNotPandas],
}
