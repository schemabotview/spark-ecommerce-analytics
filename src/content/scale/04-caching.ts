import type { Section } from '../types'

export const caching: Section = {
  id: 'caching',
  title: 'Caching',
  scene: 'scale-cache',
  narration:
    "Three questions about the same year of sales: total revenue, lines per country, and how many lines have more than two items. Without a cache, each question reads both CSV folders and joins them again from scratch. With cache, the first action computes the joined data and keeps it in storage memory, and the next two read it from there. The timings show both sides of caching. The first cached question is no faster, often a little slower, because it also fills the cache. The next two are much faster. The cache itself holds two hundred partitions, the join's output, in memory, and nothing spilled to disk. So cache a DataFrame when several actions reuse it and it fits in storage memory. Do not cache something used once: that only costs memory. And call unpersist when you are done, or the cache holds memory that execution could have used.",
}
