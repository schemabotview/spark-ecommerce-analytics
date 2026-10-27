import type { Section } from '../types'

export const whyFoldersBreak: Section = {
  id: 'why-folders-break',
  title: 'Why folders of Parquet break',
  scene: 'lakehouse-broken-overwrite',
  narration:
    'Gold is a set of folders of Parquet files, and every report reads them. Here is what happens when a nightly rebuild goes wrong. The script rebuilds the sales fact table in place, with mode overwrite, and plants the kind of bug real jobs have: a row from December raises an error. Before the job, the table holds thirty five thousand and forty three rows. The job starts, and the first thing an overwrite does is delete the old files, before a single new row exists. Then tasks start writing new part files, one of them reaches December, and the job fails. Spark cleans up the half written files, as it should. What is left is an empty folder. Reading the table now does not return old data or new data: it fails, because there is nothing to infer a schema from. And while the job was running, a dashboard reading the folder would have seen some new files and none of the old ones, a table that never existed. The root problem is that a folder has no idea which files make up the table. Whatever is in it, is the table. That is the problem Delta Lake solves, with a log that says which files are the table, written last.',
}
