import type { Section } from '../types'

export const jobsAsAPackage: Section = {
  id: 'jobs-as-a-package',
  title: 'Jobs as a package',
  scene: 'production-jobs',
  narration:
    "The platform works, but running it means remembering six commands in the right order. Production starts by giving it one front door. Jobs dot py lists every job of the night, in order, each with a line saying what it does and the function that runs it: bronze, silver, gold, the incremental orders load, the change feed merge, and the recommendations. With no arguments, it prints that list, which is now the platform's own documentation. Run with job names, it runs those in the order given; nightly runs them all. They all run in one process, so the night starts one JVM and one Spark session and every job shares it, instead of paying a JVM's start-up for each. And a typo is no longer silent: asking for a job that does not exist prints the usage and the real job names, and exits with an error a scheduler will notice.",
}
