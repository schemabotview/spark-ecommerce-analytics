import type { Section } from '../types'

export const theWholePlatform: Section = {
  id: 'the-whole-platform',
  title: 'The whole platform',
  scene: 'production-nightly',
  narration:
    "And here is the whole platform, in one command. Nightly runs every job in order, in one Spark session, starting from nothing but the raw exports. Each job's own output goes to a log file, and the terminal gets one line per job. Bronze lands every source. Silver cleans, conforms and passes its quality gates. Gold builds the star schema as Delta tables, and the checks pass. The orders job loads every order since the high water mark, the change feed is merged into their statuses, and the recommendations are refitted and written. Seven jobs, seven ticks, and the gold folder holds every table the business, the website and the stream read from. If any job fails, the night stops at it, because everything after it would build on what it failed to write. That is the platform this course set out to build, from the first DataFrame to here.",
}
