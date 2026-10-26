import type { Section } from '../types'

export const json: Section = {
  id: 'json',
  title: 'Nested JSON: the clickstream',
  scene: 'ingest-json',
  narration:
    "The website's tracker sends every click as a line of JSON, one folder per day, and this is where Spark starts to earn its keep: a year of clicks is far bigger than a year of orders. Each event is nested. Beside plain fields like its id, time and type, it holds a context, an object describing the device, browser and campaign, and a list of items, each with a product id, a quantity and a price. Schemas dot py now declares that shape as CLICKS. A struct type holds the context, and an array type of structs holds the items. The experiment reads one day both ways. Guessing finds the nesting by itself, but it reads the event time as a plain string, because JSON has no timestamp type, and the price as a double again. Declared, the time is a real timestamp and the price is money. With the schema in place, the first of October holds eight hundred and ninety seven events. Most are product views, then page views, then items added to a cart, and forty seven checkouts, each followed by a purchase. Nested data is not a problem to flatten away as fast as possible. Spark reads it natively, and a field inside a struct is reached with a dot, like context dot campaign. The list of items is the harder part: one event can carry several products, and to count what was bought, each item has to become a row of its own.",
}
