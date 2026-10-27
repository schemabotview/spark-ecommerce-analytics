import type { Section } from '../types'

export const cartAbandonment: Section = {
  id: 'cart-abandonment',
  title: 'Cart abandonment',
  scene: 'stream-abandonment',
  narration:
    "The last streaming feature: an alert when someone fills a cart and leaves. A visit has no fixed length, so a tumbling window will not do. A session window is defined by activity instead. The first event opens a window for that visitor, every event within thirty minutes stretches it, and thirty minutes of silence closes it. Abandoned carts groups the stream by visitor and session window, records whether the visit added to the cart and whether it bought, and keeps the visits that carted but never bought. The visitor is the logged in user, or the anonymous id, cast to the same type; the first run failed on exactly that, when the bot's anonymous id met a numeric user id. With a ten minute watermark, a visit is only final once the watermark passes its end, because until then a purchase could still arrive. One day of clicks gives sixty one alerts, each written once. Four visits were still open when the stream stopped: no one can know yet whether they will buy. That is the honest answer a streaming system gives, and why a real alert waits for the watermark rather than firing early.",
}
