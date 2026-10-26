import type { Section } from '../types'

export const columnar: Section = {
  id: 'columnar',
  title: 'Rows or columns: why Parquet',
  scene: 'ingest-columnar',
  narration:
    "Bronze will not store CSV. Here is why, measured. This lab writes a year of orders as Parquet and runs the same queries against both formats, reading the bytes from the same stage metrics the Spark UI shows. On disk, the CSV year is three hundred and sixty five files and nine hundred thousand bytes. As Parquet, it is one file of three hundred and seventy eight thousand: compressed, and typed. On the left is why CSV is slow. It stores one line per row, so to read one column, Spark must read and parse every line. Asking for German orders, with two columns, read the entire nine hundred thousand bytes. Parquet stores each column in its own chunk. The same question touched only the order id, country and total chunks, seventy three thousand bytes, about a twelfth. The plan at the bottom shows how: the read schema lists just those three columns, and the filter on country was pushed down into the scan itself. Parquet also keeps the smallest and largest value of every chunk. Since the file was written in order id order, asking for orders below one thousand let the scan skip almost everything: under seven thousand bytes read, against the CSV's full nine hundred thousand again. Column pruning, filter pushdown and min max skipping are why every serious data lake stores columnar files, and why everything we land from now on is Parquet.",
}
