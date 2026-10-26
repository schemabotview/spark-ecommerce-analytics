import type { Section } from '../types'

export const schemas: Section = {
  id: 'schemas',
  title: 'Schemas: declare every type',
  scene: 'ingest-schemas',
  narration:
    "Course three lands every Shopwave source in the lake, and it starts with types. First, the project grows up: the session moves into a package called shopwave, and the experiments of each section live in an explore folder. Course two left every column a string. There are two ways out. The quick one is infer schema: Spark reads the data and guesses each column's type. The other is to declare the types ourselves, and schemas dot py does that for the orders. The order id is a long, the timestamp a timestamp, and the total a decimal with two places, which the file calls money. The experiment reads October both ways. Guessing cost two jobs before we had asked a single question: one to read the header, and one to scan every file just to guess. On a year of data, that scan is not free. The declared read ran no jobs at all. Then the types. Spark guessed an integer for the order id, which will overflow one day, and a double for the total. A double is a binary fraction, and most amounts in cents cannot be stored exactly. Summing October's revenue per day, twenty one of thirty one days came out a hair off, like this one, five thousand six hundred and fifty six point one two nine nine nine and so on. The decimal sum is exactly five thousand six hundred and fifty six point one three. A finance team will notice the difference. So from now on, every source the platform reads has a declared schema, in one file, and money is always a decimal.",
}
