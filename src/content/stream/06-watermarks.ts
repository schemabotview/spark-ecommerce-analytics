import type { Section } from '../types'

export const watermarks: Section = {
  id: 'watermarks',
  title: 'Watermarks',
  scene: 'stream-watermarks',
  narration:
    "Events arrive late. The tracker buffers on a phone with no signal, and one percent of Shopwave's events land hours or days after they happened. So when is the count for ten o'clock final? A watermark answers that. With event time and a delay of two hours, Spark tracks the latest event time it has seen, and the watermark is that minus two hours. A window that ends before the watermark is final: in append mode it is written once, and its state is freed. An event older than the watermark arrives too late: its window is already written, so the event is dropped. This lab counts events per hour over three days of clicks. Eight batches; seventy five hours written as final, holding two thousand eight hundred and ninety eight events. Eight events arrived later than two hours and were dropped. And three windows are still open in state at the end, the last few hours, waiting for later data to close them. The delay is a trade. A longer one keeps more late events and holds more state; a shorter one forgets sooner and drops more. Choose it from how late your data really arrives, which the bronze tables can tell you.",
}
