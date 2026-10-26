import type { Section } from '../types'

export const timeZones: Section = {
  id: 'time-zones',
  title: 'Timestamps and time zones',
  scene: 'clean-timezones',
  narration:
    "On which day was an order placed? It sounds trivial, until the customers live in thirteen countries. Every timestamp in this platform is stored in UTC, one universal clock, and the session pins Spark to UTC too, so a time never shifts depending on whose laptop runs the job. But the business asks about days, and a German customer's Saturday starts two hours before UTC's does. Silver dot orders keeps both. Order date is the UTC day. For the local date, a map from country to time zone, built with create map, picks the zone for each row, from UTC timestamp converts the instant to that zone's clock, and to date takes the day. The experiment shows the difference. Ninety three of October's one thousand five hundred and forty six orders fall on a different day locally. This German order was placed at twenty two twenty two UTC, which in Berlin is already twenty past midnight on the next day. Customers in India, four and a half hours ahead of Berlin, often cross midnight too. And a customer in New York, at half past three in the morning UTC, was still on the previous evening. Which one is right? Both: finance closes its books in UTC, while marketing measuring a Black Friday in Berlin wants the German day. Silver keeps the instant and both days, so nobody has to redo the conversion, and nobody does it slightly differently.",
}
