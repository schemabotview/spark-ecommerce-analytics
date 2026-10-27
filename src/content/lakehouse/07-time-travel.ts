import type { Section } from '../types'

export const timeTravelAndRestore: Section = {
  id: 'time-travel-and-restore',
  title: 'Time travel and restore',
  scene: 'lakehouse-time-travel',
  narration:
    "Every Delta commit leaves the files of earlier versions where they were, and the log remembers which files each version had. That makes mistakes recoverable. Here is a classic one: a day's load written with mode overwrite instead of append. Gold orders goes from twenty thousand and twenty four orders to forty seven, one day's worth. The history shows it plainly: two appends, then an overwrite. Reading with version as of one returns the table exactly as it was before the bad load, all twenty thousand and twenty four orders, because those files are still on disk. Restore makes that version current again. It does not delete the mistake: it is a new commit, version three, so the history still shows what happened and when. Time travel also answers quieter questions, like what did this report read last Tuesday, as long as the old files have not been vacuumed away, which is the last section of this course.",
}
