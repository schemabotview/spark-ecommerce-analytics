import type { Section } from '../types'

export const smallFilesAndLayout: Section = {
  id: 'small-files-and-layout',
  title: 'Small files and layout',
  scene: 'lakehouse-small-files',
  narration:
    "A nightly job that appends one day at a time writes small files, and a table of many small files gets slow: a task opens its files one after another, and opening a file costs more than reading a small one. The script appends December's sales one day at a time, thirty one appends, and the table has thirty one files. Optimize compacts them: one commit removes the thirty one small files from the table and adds one file with the same rows. The table now has one file, but the disk still holds all thirty two, because older versions still need the small ones for time travel. Vacuum deletes the files no version within the retention period needs. The default retention is seven days; this demo sets it to zero, which a real table should never do while anything might still be reading it. Thirty seven files and folders deleted, and the rows are unchanged, three thousand six hundred and seventy two. On a large table, Delta's liquid clustering goes further, and keeps rows with similar keys in the same files, so the file statistics can skip more of them.",
}
