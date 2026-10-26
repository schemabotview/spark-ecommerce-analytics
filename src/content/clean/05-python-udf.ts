import type { Section } from '../types'

export const pythonUdf: Section = {
  id: 'python-udf',
  title: 'A Python UDF: spotting the bot',
  scene: 'clean-python-udf',
  narration:
    "Something in October's clicks is not human. To find it, we need a rule Spark does not have built in: does the user agent look like a bot, a crawler, a spider or a scraper? A user defined function, or UDF, lets us write that rule in plain Python. Is bot takes a user agent string, runs a regular expression over it, and returns true or false. The decorator tells Spark the result is a boolean, and silver dot clicks calls it like any other function, to make a new column. The result is striking. Two thousand four hundred and seventy seven events, eight percent of October, are bots, and they all come from one visitor, an anonymous id ten times busier than our most active customer. Its user agent openly says Shopwave Scraper. Left in, it would inflate page views, wreck the conversion funnel, and later dominate any per visitor computation. But look at what the UDF costs. Spark's executors are Java processes, and Python cannot run inside them. So every row's user agent is shipped out of the JVM to a separate Python worker process, the function runs there, and the answer is shipped back. The plan shows it as a step called batch eval Python, and in this plan it appears twice, once for the filter and once for the column. Spark cannot look inside a Python function either, so it cannot optimise it. The next section measures what that costs, and how to avoid it.",
}
