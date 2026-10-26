import type { Section } from '../types'

export const qualityGates: Section = {
  id: 'quality-gates',
  title: 'Quality gates: write only what makes sense',
  scene: 'clean-quality',
  narration:
    "A job that runs without errors can still produce wrong data. A source sends half a file, a join silently drops rows, a column fills with nulls. Silver dot py's main function therefore never writes blindly. It builds every silver table, then passes the important ones through a gate, in quality dot py. A gate counts the rows that came in and the rows that came out, and checks that key columns, like the order id, the timestamp, the total and the visitor, have no nulls at all. If cleaning dropped more than a set share of the rows, or a key column has a null, the gate fails. Two percent is the default, because removing duplicates legitimately drops about half a percent. The first run passes. Orders lose nothing, and clicks lose the one hundred and forty five duplicates, under half a percent, so all seven silver tables are written. The second run shows a gate doing its job. With the limit tightened to a tenth of a percent through an environment variable, the clicks gate fails, the job prints that nothing was written, and exits with code one. That exit code is the important part. A scheduler running these jobs every night stops at a failed step, so a broken silver table never reaches gold or a dashboard. Silver is now complete: clean, typed, deduplicated, with visitors, local days and bots identified. Course five builds the gold layer on top of it, and meets the most expensive operation in Spark.",
}
