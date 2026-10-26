import type { Section } from '../types'

export const salting: Section = {
  id: 'salting',
  title: 'Salting: splitting a hot key by hand',
  scene: 'model-salting',
  narration:
    "Adaptive execution cannot always help. It might be switched off on an older cluster, or the join might be a kind it cannot split, such as a full outer join. The manual technique is called salting. The idea: make the hot key into several keys. Each sale gets a salt, a number from zero to seven, computed from a hash of its order id and line, so it is the same on every run. The product dimension is copied eight times, once for each salt value. Then the join is on the product id and the salt together. Product one, which was a single key going to one task, is now eight keys, product one with salt zero up to product one with salt seven, spread over eight tasks. With AQE off, the plain join has forty four busy tasks, and the largest reads one thousand one hundred and fifty four rows. The salted join has one hundred and seventy nine busy tasks, and its largest reads three hundred and twenty nine. The work is spread far more evenly. Salting has a price. The small side is copied once per salt value, so it grows eight times, and the code is harder to read: the next person to see that salt column needs a comment explaining it. Reach for salting only when a skewed join is still slow with AQE on. Gold is now complete: a star schema, payments in euros, and the tools to keep joins fast when the data is uneven. Course six puts it to work answering the business's questions.",
}
