import type { Section } from '../types'

export const coresAndTime: Section = {
  id: 'cores-and-time',
  title: 'Cores and time',
  scene: 'scale-cores',
  narration:
    "The last measurement in this course: the same job, revenue by country over the year, on one, two, three and four cores. Each run is its own process, and each one runs the query once to warm up the JVM before timing the second run. The machine has four CPUs. Two cores are clearly faster than one, but not twice as fast, and every core added after that buys less. The plot shows the measured speed up against the perfect diagonal, and the gap grows. Some work does not split: planning the query, starting tasks, the final reduce that adds up a few dozen partial sums. And the cores share one disk, one memory bus and one operating system. This is Amdahl's law, and a cluster obeys it too, where the network and the shuffle are the shared parts. Adding executors is the last resort, not the first: measure where the time goes, as this course did, and fix that.",
}
