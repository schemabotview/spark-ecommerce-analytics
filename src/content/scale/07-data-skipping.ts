import type { Section } from '../types'

export const dataSkipping: Section = {
  id: 'data-skipping',
  title: 'Data skipping',
  scene: 'scale-skipping',
  narration:
    "Delta keeps the same kind of statistics in its log: for every file, the minimum and maximum of its columns, written with every add action. The script writes the year of sales as a Delta table of forty eight files, with repartition by range on the order date, so each file holds a short run of days, about four files a month. Then it asks for one day, Black Friday: a hundred and forty seven thousand and eighty nine lines. Delta compares the day with each file's range before Spark plans a single task, and opens one file. Forty seven are skipped without being read. This only works when a file covers a narrow range of the column you filter on. Written in random order, every file would hold the whole year, and every file would be read. That is what Delta's clustering, and Z ordering before it, are for: they keep similar values together so the statistics can skip.",
}
