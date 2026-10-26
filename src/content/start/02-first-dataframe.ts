import type { Section } from '../types'

export const firstDataframe: Section = {
  id: 'first-dataframe',
  title: 'SparkSession: the first DataFrame',
  scene: 'start-first-dataframe',
  narration:
    "Every Spark program begins by building a SparkSession, and this is ours. Master local four says: run Spark on this machine, with up to four tasks at a time. The app name labels the run. The last setting points Spark at a small log configuration we added in the conf folder. Spark logs a great deal about its own work, and that file sends all of it to a log file, so the terminal shows only what our job prints. Get or create starts Spark: the Java side launches behind the scenes, and the session is our way in. Then one line reads the first of October's orders. Header true tells Spark that the first line holds the column names. What comes back is a DataFrame: rows with named columns, much like a table. Show three prints the first three rows, as a small grid, and the terminal confirms it is only showing the top three. The first line of output is not ours: it is a notice from the Java virtual machine, which appears every time Spark starts, and is harmless. Then the last line prints the column types, and the side pane lays them out. Every column is a string. The order id, the timestamp, even the total. A CSV file is only text, and Spark does not guess types unless we ask it to. Strings are fine for printing, but we cannot add up a string, and that will matter in a moment. Course three gives the orders a real schema. For now, we have Spark running, and a month of data it can read.",
}
