import type { Section } from '../types'

export const incrementalLoads: Section = {
  id: 'incremental-loads',
  title: 'Incremental loads',
  scene: 'lakehouse-incremental',
  narration:
    "Until now every job rebuilt its tables from scratch. That stops working as the history grows, and gold orders is the first table to load incrementally. Lake dot py is a new module for the jobs that keep Delta tables up to date. Load orders reads the newest order date already in the table, the high water mark, and reads only the silver orders after it. The new rows are appended in one Delta commit. The first run, told to stop at the end of November, loads seventeen thousand nine hundred and forty four orders. The next run finds the mark at November the thirtieth, and adds December's two thousand and eighty. The third run finds nothing newer and adds nothing. That last run matters most. The mark is read from the table itself, inside the same transaction that moves it, so a job that crashed halfway, or was started twice by a scheduler, never loads a day twice. A mark kept anywhere else, in a file or a variable, can drift from the data it describes.",
}
