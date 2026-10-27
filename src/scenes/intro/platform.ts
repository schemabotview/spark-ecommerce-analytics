import type { SceneModel } from '@graphlearning/graphl-flow'

// §2 — Shopwave, and what we'll build: the platform map. Every box is a course; Course 11 lights it all.
export const introPlatform: SceneModel = {
  title: 'Shopwave’s data platform, as this course builds it',
  sub: 'An online store’s exports in; answers, live numbers and recommendations out',
  nodes: [
    {
      type: 'group', id: 'map', bare: true, dir: 'row', children: [
        {
          type: 'group', id: 'sources', badge: 1, title: 'Sources', sub: 'the shop’s systems', icon: 'database', tone: 'neutral', children: [
            { type: 'item', id: 's-db', title: 'shop database', sub: 'orders, customers, products', icon: 'postgresql' },
            { type: 'item', id: 's-pay', title: 'payment provider', sub: 'Parquet, daily', icon: 'card' },
            { type: 'item', id: 's-track', title: 'site tracker', sub: 'JSON clicks, then Kafka', icon: 'globe' },
            { type: 'item', id: 's-wh', title: 'warehouse', sub: 'returns, Latin-1 CSV', icon: 'package' },
          ],
        },
        {
          type: 'group', id: 'lake', badge: 2, title: 'The lake', sub: 'Parquet, then Delta (Course 7)', icon: 'layers', tone: 'store', children: [
            { type: 'item', id: 'l-bronze', title: 'bronze: as it came', sub: 'Course 3', icon: 'disk' },
            { type: 'item', id: 'l-silver', title: 'silver: clean and conformed', sub: 'Course 4', icon: 'filter' },
            { type: 'item', id: 'l-gold', title: 'gold: a star schema', sub: 'Course 5', icon: 'table' },
          ],
        },
        {
          type: 'group', id: 'uses', badge: 3, title: 'What it answers', icon: 'chart', tone: 'ingest', children: [
            { type: 'item', id: 'u-bi', title: 'KPIs, funnels, cohorts', sub: 'Course 6', icon: 'chart' },
            { type: 'item', id: 'u-live', title: 'live revenue, abandoned carts', sub: 'Course 9: Kafka', icon: 'kafka' },
            { type: 'item', id: 'u-ml', title: 'recommendations', sub: 'Course 10: ALS', icon: 'brain' },
          ],
        },
      ],
    },
    {
      type: 'group', id: 'around', title: 'Around it', icon: 'settings', tone: 'infra', dir: 'row', children: [
        { type: 'item', id: 'r-scale', title: 'the full year, measured', sub: 'Course 8', icon: 'activity' },
        { type: 'item', id: 'r-prod', title: 'tests, checks, a cluster', sub: 'Course 11', icon: 'shield' },
        { type: 'item', id: 'r-data', title: 'our own generator', sub: 'seeded: same data every run', icon: 'python' },
      ],
    },
  ],
  edges: [
    { from: 'sources', to: 'lake', label: 'ingest' },
    { from: 'l-bronze', to: 'l-silver' },
    { from: 'l-silver', to: 'l-gold' },
    { from: 'lake', to: 'uses', label: 'gold' },
  ],
}
