import type { Section } from '../types'

export const exactlyOnceIntoDelta: Section = {
  id: 'exactly-once-into-delta',
  title: 'Exactly once into Delta',
  scene: 'stream-exactly-once',
  narration:
    "Here is that restart for real. To delta streams the events into a Delta table, with a checkpoint. The first run carries a bug that fails on one event in the second batch. The stream stops with stream failed. The table holds only the first batch, two hundred and ninety eight events. The second batch was planned, its offsets written, but never committed. The bug is fixed and the same query starts again. It reads the checkpoint, sees batch one was never committed, and runs it again over exactly the same range, because Kafka still holds those records. Could batch zero be written twice? No: Delta records the stream's batch ids in its own log, so a batch that was already committed is skipped. Checkpoint plus a transactional sink is exactly once. The table ends with all eight hundred and ninety seven events. But only eight hundred and ninety three distinct ids: four events were sent twice by the tracker itself. Exactly once means each Kafka record is written once; duplicates the source sent are the job of section seven.",
}
