import type { Section } from '../types'

export const whenNotToUseSpark: Section = {
  id: 'when-not-to-use-spark',
  title: 'When not to use Spark',
  scene: 'ml-without-spark',
  narration:
    "An honest end to this course: none of it needed Spark. Nine and a half thousand ratings are about one megabyte in memory. This lab answers the same question with pandas and scikit-learn, in one Python process, with no Java and no cluster. It reads the review files, joins each to its product's category, and fits a plain ridge regression on one-hot features: one per customer and category pair, which is exactly a customer's taste, and one per product, its quality. On the same test months, its error is zero point eight eight stars, slightly better than ALS, because those features say directly what ALS had to discover. It reads, fits and scores in well under a second. The point is not that ALS is bad. It is that Spark earns its overhead when the data does not fit on one machine, or keeps arriving, or is already in the lake next to everything else. Shopwave at scale factor one would have two hundred thousand customers and five thousand products, and the year's clicks as implicit feedback would run to tens of millions of rows. That is where Spark's ALS belongs. For a megabyte, use the simplest tool that works: pandas, Polars or DuckDB.",
}
