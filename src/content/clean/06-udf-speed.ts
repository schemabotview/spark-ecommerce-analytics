import type { Section } from '../types'

export const udfSpeed: Section = {
  id: 'udf-speed',
  title: 'Built-ins vs pandas UDF vs Python UDF',
  scene: 'clean-udf-speed',
  narration:
    "How much does leaving the JVM cost? This experiment applies the bot rule three ways to three million user agents: October's clicks, repeated a hundred times. First, pandas and pyarrow join the requirements, for a pandas UDF. Each version runs once to warm up, then is timed. The built in version uses r like, Spark's own regular expression match, which runs inside the JVM. The pandas UDF receives whole columns at a time, as pandas series, so Python is called once per batch of ten thousand rows instead of once per row. The plain Python UDF is the one from the last section. All three find the same two hundred and forty nine thousand bots. The built in version is clearly the fastest: about twice as fast as either UDF. The surprise is that the pandas UDF and the plain UDF take about the same time. In older versions of Spark, plain Python UDFs were dramatically slower, because rows crossed to Python one at a time. Spark four point two sends plain Python UDFs in Arrow batches too, which the terminal confirms is switched on, so the gap has closed. The lesson stays the same. Every UDF pays to move data out of the JVM and back, and hides its logic from the optimiser. So first look for a built in function: Spark has hundreds, for strings, dates, arrays and maps. Silver dot clicks now detects bots with r like, and the Python UDF is gone. Reach for a UDF only for logic that truly has no built in equivalent.",
}
