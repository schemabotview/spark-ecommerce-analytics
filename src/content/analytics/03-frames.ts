import type { Section } from '../types'

export const frames: Section = {
  id: 'frames',
  title: 'Frames: a 7-day moving average',
  scene: 'analytics-frames',
  narration:
    "Daily GMV is noisy: weekends are busier, and one big day hides the trend. A seven day moving average smooths it, and a window can compute it with a frame: for each row, which neighbouring rows to include. Moving average orders all the days in time, and uses range between minus six and zero: the current day and the six before it. The chart shows the result. The grey line is the raw daily GMV, the blue line its seven day average, which climbs smoothly into December and carries Black Friday's spike for exactly a week. The experiment then shows the one detail that trips people up. There are two kinds of frame. Rows between counts rows. Range between counts values of the order by column, here days. When every day is present, they agree. So the script removes the twenty sixth of November and compares them. On the twenty fifth, both averages are identical. From the twenty seventh, they differ. Rows between still takes the last seven rows, which now reach back eight calendar days. Range between still takes exactly the last seven days, and simply has one row fewer in them. For anything measured in time, use range, ordered by a number of days or seconds: it is what the question means. One warning: this window has no partition by, so all three hundred and sixty five rows go to a single task. For a year of days that is fine; Spark logs a warning, because for millions of rows it would not be.",
}
