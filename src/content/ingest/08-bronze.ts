import type { Section } from '../types'

export const bronze: Section = {
  id: 'bronze',
  title: 'The bronze layer',
  scene: 'ingest-bronze',
  narration:
    "Everything comes together in bronze dot py's main function, which lands every source in the lake. Bronze is the first layer of three. It changes nothing in the data itself: it only fixes the format and the types. Each file-based reader now adds two columns: underscore source file, the name of the file a row came from, and underscore file date, the day in the file's path. When something looks wrong next month, those two columns say exactly where it came from. The four daily sources, orders, their lines, payments and clicks, are written as Parquet partitioned by file date, so each day gets its own folder, as the listing of the clicks table shows. A query for one day can then read only that day's folder. Returns, which arrive monthly, are written whole, and their bad lines go to a quarantine folder as JSON, readable by anyone. Customers and products come over JDBC, four queries each. The run prints what landed. One thousand five hundred and forty six orders with two thousand seven hundred and forty eight order lines, one thousand four hundred and eighty four payments, two thousand seven hundred click events across three days, fifty eight returns, two thousand customers and fifty products, plus three quarantined lines. Two of those numbers already disagree: there are more orders than payments. Some orders were cancelled, some were never paid, and some were paid twice. Finding and fixing that is the work of the silver layer, in Course four.",
}
