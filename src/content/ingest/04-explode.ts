import type { Section } from '../types'

export const explode: Section = {
  id: 'explode',
  title: 'explode: one row per item',
  scene: 'ingest-explode',
  narration:
    "Turning a list into rows is what explode does. Selecting explode of items produces one row for every element of every event's list, with the event's other columns repeated beside it. The side pane follows one purchase. As an event, it is a single row with three items in its list. After explode, it is three rows, one per product, each with its quantity and price, and the same event id. That is the shape every product question needs: what sold, how many, at what price. The counts show the catch. The day has eight hundred and ninety seven events, but only six hundred and thirty eight carry any items, because a page view lists no products. Explode produced seven hundred and eighteen item rows, and the two hundred and fifty nine events with an empty list simply vanished. That is right when we are counting items, and wrong when we are counting events. Explode outer keeps them: every event with an empty list stays as a single row with a null item, giving nine hundred and seventy seven rows in total. Neither is a default to reach for without thinking. Ask which question the rows are for, then pick the function that keeps the right ones. The terminal's table also shows show truncating long values: the event ids are cut to eight characters, so they fit the screen.",
}
