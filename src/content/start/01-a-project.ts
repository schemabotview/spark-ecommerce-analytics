import type { Section } from '../types'

export const aProject: Section = {
  id: 'a-project',
  title: 'Java, a virtual environment and PySpark',
  scene: 'start-project',
  narration:
    "Shopwave is an online store, and its data team has a problem: a year of orders, clicks and payments, and questions nobody can answer quickly. We will build the platform that answers them, with Apache Spark, starting from an empty project. The editor shows what we start with: one file per day of orders, exported every night from the shop's database. Each line is one order: its id, when it was placed, the customer, their country, its status, and the total in euros. October holds thirty one of these files. Spark is a program for the Java virtual machine, so the first question in the terminal is which Java we have: version twenty one, which this version of Spark supports. Then the same start as any Python project: a virtual environment, activated, and one requirement installed, pyspark, pinned to version four point two. Look at the side pane to see what that one install brought. The pyspark package is the Python API we will write against. Py four J is a bridge: every Spark call we make in Python is carried across it to the Java side. And the jars folder holds two hundred and seventy seven jar files. That is Spark itself, written in Scala, and the reason this one package weighs four hundred and eighty five megabytes. So pip install pyspark does not install a client for some Spark somewhere: it installs all of Spark, ready to run on this machine. The one thing it cannot bring is Java, which runs those jars. With Java, PySpark and a month of orders, we can run the first job.",
}
