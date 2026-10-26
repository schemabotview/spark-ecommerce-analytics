import type { Course } from '../types'
import { schemas } from './01-schemas'
import { corruptRecords } from './02-corrupt-records'
import { json } from './03-json'
import { explode } from './04-explode'
import { schemaDrift } from './05-schema-drift'
import { jdbc } from './06-jdbc'
import { columnar } from './07-columnar'
import { bronze } from './08-bronze'

export const ingest: Course = {
  id: 'ingest',
  title: 'Land every source (bronze)',
  sections: [schemas, corruptRecords, json, explode, schemaDrift, jdbc, columnar, bronze],
}
