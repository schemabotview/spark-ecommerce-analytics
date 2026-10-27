import type { Section } from '../types'

export const windowFunctions: Section = {
  id: 'window-functions',
  title: 'Window functions: top products per category',
  scene: 'analytics-windows',
  narration:
    "Which three products sell best in each category? A group by cannot answer that alone, because grouping by category collapses each category to one row, and the products disappear. This needs a window function. Top products first adds up revenue per product, and joins the product dimension to get each one's name and category. Then it defines a window: partition by category, order by revenue, descending. Partition by splits the rows into one group per category, like a group by, but nothing is collapsed: every product row stays. Order by sorts the rows inside each group. Rank, computed over that window, numbers them: one for the best seller in its category, two for the next, and so on. Filtering to ranks up to three leaves eighteen rows, three per category, and the terminal lists them: perfume leads beauty, a thriller leads books, headphones lead electronics. Under the hood, a window is computed by shuffling the rows so each partition lands in one task, then sorting inside it. That is the same shuffle as a group by, so the same lessons about skew apply. Rank, dense rank and row number differ only in how they treat ties. Rank leaves gaps after a tie, dense rank does not, and row number breaks ties arbitrarily, which is exactly what the payments deduplication needed back in Course four.",
}
