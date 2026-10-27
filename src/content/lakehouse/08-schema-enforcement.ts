import type { Section } from '../types'

export const schemaEnforcementAndEvolution: Section = {
  id: 'schema-enforcement-and-evolution',
  title: 'Schema enforcement and evolution',
  scene: 'lakehouse-schema',
  narration:
    "A Delta table has a schema in its log, and every write is checked against it before anything is committed. The script appends two December orders three ways. First with the total as a string: refused, Delta cannot merge a string into a decimal column. Second with a new column, channel, that marketing has started sending: refused too, the write's schema does not match the table's. Third, the same write with merge schema set to true, a deliberate decision to evolve the table. It is written, and the table now has nine columns. The twenty thousand and twenty four older rows read the new column as null, without being rewritten, and the two new rows carry app. Compare a folder of Parquet: it accepts any write. The wrong type lands in new files, and the failure surfaces later, in the next reader, far from the job that caused it. Delta moves the failure to the writer, where it belongs.",
}
