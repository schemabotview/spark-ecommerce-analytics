import type { Section } from '../types'

export const shopwave: Section = {
  id: 'shopwave',
  title: 'Shopwave, and what we will build',
  scene: 'intro-platform',
  narration:
    "We will learn Spark by building one thing: the data platform of Shopwave, a fictional online store. Its data comes from four systems. The shop's database holds orders, customers and products. A payment provider sends a Parquet file every day. A tracker on the website records every click, first as JSON files and later as a live Kafka stream. And the warehouse sends returns as a CSV file in an old encoding. All of it comes from a seeded generator, so every run of every step in this course produces exactly the same data, and every number on screen is one a real run printed. The data is not clean, on purpose: there is a Black Friday twenty times bigger than a normal day, one product that is fifteen percent of all sales, a schema change in June, duplicate and late events, a bot, unpaid orders and malformed rows. Each one is a lesson waiting to happen. The platform grows in layers. Bronze lands every source as it came. Silver cleans and conforms it. Gold is a star schema the business can ask questions of. On top of it we build analytics, live revenue and abandoned carts from Kafka, and product recommendations. Then we measure it all at full scale, and ship it: tests, quality checks, and a real cluster.",
}
