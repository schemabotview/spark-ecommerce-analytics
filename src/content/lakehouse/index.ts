import type { Course } from '../types'
import { whyFoldersBreak } from './01-why-folders-break'
import { aDeltaTable } from './02-a-delta-table'
import { convertingTheLake } from './03-converting-the-lake'
import { incrementalLoads } from './04-incremental-loads'
import { cdcWithMerge } from './05-cdc-with-merge'
import { scdType2 } from './06-scd-type-2'
import { timeTravelAndRestore } from './07-time-travel'
import { schemaEnforcementAndEvolution } from './08-schema-enforcement'
import { smallFilesAndLayout } from './09-small-files'

export const lakehouse: Course = {
  id: 'lakehouse',
  title: 'Delta Lake',
  sections: [whyFoldersBreak, aDeltaTable, convertingTheLake, incrementalLoads, cdcWithMerge, scdType2, timeTravelAndRestore, schemaEnforcementAndEvolution, smallFilesAndLayout],
}
