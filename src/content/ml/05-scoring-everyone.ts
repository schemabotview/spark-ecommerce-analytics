import type { Section } from '../types'

export const scoringEveryone: Section = {
  id: 'scoring-everyone',
  title: 'Scoring everyone',
  scene: 'ml-score',
  narration:
    "A model is only useful once its answers are where the website can read them. The recommend job fits the average plus ALS on every rating so far, then scores every customer against every product: one thousand eight hundred and thirty three customers times fifty products. A window ranks each customer's scores, keeps the best five, and the result is written to a gold Delta table, nine thousand one hundred and sixty five rows, one per customer and rank. Does it make sense? Customer one, from the first section of this course, rates fashion and electronics highest. The five recommendations are sunglasses, a power bank, headphones, a rain jacket and a keyboard: every one of them fashion or electronics. Nobody told the model about categories; it found the taste in the ratings alone. A production version would also leave out what the customer already owns, and refit on a schedule. Course eleven makes this job part of the nightly run.",
}
