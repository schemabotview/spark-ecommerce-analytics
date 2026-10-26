from session import spark_session

spark = spark_session()
tracker = spark.sparkContext.statusTracker()


def jobs() -> int:
    """How many jobs Spark has run so far."""
    return len(tracker.getJobIdsForGroup())


orders = spark.read.csv("data/raw/orders/", header=True)
print("read October:      ", jobs(), "job")
paid = orders.filter(orders.status == "paid")
print("kept paid orders:  ", jobs(), "job")
german = paid.filter(paid.country == "DE").select("order_id", "total")
print("kept German ones:  ", jobs(), "job")
print("count():", german.count())
print("after count():     ", jobs(), "jobs")
