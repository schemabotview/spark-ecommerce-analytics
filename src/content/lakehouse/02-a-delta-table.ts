import type { Section } from '../types'

export const aDeltaTable: Section = {
  id: 'a-delta-table',
  title: 'A Delta table: Parquet files and a log',
  scene: 'lakehouse-delta-log',
  narration:
    "A Delta table is two things in one folder: ordinary Parquet files, and a folder called underscore delta log. This lab writes the product dimension as a Delta table, then appends two rows, and looks at what is on disk. The log holds one JSON file per commit, numbered from zero. Commit zero carries a commit info action naming the operation, a metadata action with the table's schema, a protocol action, and one add action per data file, each with statistics: the row count, and the minimum and maximum of every column. Commit one is smaller: commit info, and one add for the new file. Reading the table means reading the log first, then exactly the files it adds, and no others. There are six Parquet files on disk but only five adds: the append's empty task still wrote a file with no rows, and no commit ever added it, so no reader ever sees it. The same is true of a file a failed job half wrote. A commit is a single file, created atomically: if two writers race for commit number two, only one of them can create it, and the other must retry. That one rule gives a folder of files transactions. And the statistics are why Delta can skip files without opening them, which comes back in Course eight.",
}
