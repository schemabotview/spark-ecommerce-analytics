import type { Section } from '../types'

export const cohortRetention: Section = {
  id: 'cohort-retention',
  title: 'Cohort retention: do customers come back?',
  scene: 'analytics-cohorts',
  narration:
    "A shop lives on customers who come back. Cohort retention measures it: group customers by the month of their first order, their cohort, then ask what share of each cohort ordered again one, two, three months later. Cohorts takes three steps. First, a window over each customer's orders finds the earliest month: that is their cohort. Second, months between gives each order's age, the number of months since the cohort month. Third, a pivot turns ages into columns, counting distinct customers in each cell, and dividing by the cohort's size in month zero. The table reads row by row. January's cohort is the largest, nine hundred and five customers, partly because the data starts in January, so everyone who was already a customer appears new then. Around half of them order again in every later month. Later cohorts are smaller, and come back somewhat less, between thirty and forty percent a month. Pivot is the step worth noticing. It turns rows into columns, which is how a spreadsheet person expects to read this, and passing the list of ages explicitly, zero to eleven, saves Spark a pass over the data to find the distinct values. Cohort tables are where retention problems show up first: a new marketing channel bringing customers who never return looks fine in daily KPIs, and terrible here.",
}
