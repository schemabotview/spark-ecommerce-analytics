import type { Section } from '../types'

export const sessionization: Section = {
  id: 'sessionization',
  title: 'Sessionization: clicks into visits',
  scene: 'analytics-sessions',
  narration:
    "The clickstream records events, but marketing thinks in visits: someone arrives, browses, maybe buys, and leaves. There is no visit id in the data, so we build one. This is called sessionization, and it is a classic job for window functions. Sessions partitions the events by visitor, in time order. Lag gives each event the time of the one before it. If there is no previous event, or the gap is more than thirty minutes, this event starts a new session, marked with a one, otherwise a zero. Then a running sum of those ones, over all the visitor's events so far, numbers the sessions: one, one, one, then two after a long gap. Visitor one, on the right, shows it. Four events within a few minutes on the second of October form session one; the next afternoon's visit is session two. October holds about twenty seven thousand events from four thousand people, cut into six thousand one hundred and seventy sessions, about four events each. The bot is different. Its two thousand three hundred events come in four hundred and one sessions, all from one visitor, which means one task in the window computes them all. That is the skew from Course five again, now inside a window instead of a join, and windows have no adaptive split. Every later question about visits, funnels and attribution builds on these session ids.",
}
