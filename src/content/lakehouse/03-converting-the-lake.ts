import type { Section } from '../types'

export const convertingTheLake: Section = {
  id: 'converting-the-lake',
  title: 'Converting the lake',
  scene: 'lakehouse-delta-gold',
  narration:
    "Now the lake moves to Delta. PySpark needs two things for it: the delta spark package, whose version must match Spark's, in requirements, and its two jars in jars dot txt. The session gains two settings that switch on Delta's SQL commands and let the catalog know Delta tables. In gold, the change is one word per write: format delta. Then the experiment from section one runs again, the same bug, the same failing December row, against the Delta table. The job fails just as before, the error is a failed write task instead of the raised exception, but a reader afterwards still sees all thirty five thousand and forty three rows, and the history holds only version zero. Delta never deletes the old files during an overwrite: it writes new ones, and only a final commit swaps them in. The failed job never committed, so as far as any reader knows, it never happened. Tables that already exist as Parquet do not need rewriting. Convert to delta lists the files of bronze's orders, three hundred and sixty five of them, one per day, and writes a first commit that adds them all, in place. The same twenty thousand and twenty four rows, now a table with a history.",
}
