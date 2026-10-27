"""The same year's revenue by country on 1, 2, 3 and 4 cores, timed."""
import subprocess
import sys
import time

if len(sys.argv) > 1:  # one run, in its own process: python -m explore.cores N
    from pyspark.sql import functions as F

    from shopwave import scale
    from shopwave.session import spark_session

    spark = spark_session(**{"spark.master": f"local[{sys.argv[1]}]"})
    q = scale.year_sales(spark).groupBy("country").agg(F.sum("revenue"))
    q.write.format("noop").mode("overwrite").save()  # once: warm up the JVM
    start = time.perf_counter()
    q.write.format("noop").mode("overwrite").save()
    print(f"{time.perf_counter() - start:.1f}")
else:
    base = None
    for cores in [1, 2, 3, 4]:
        run = subprocess.run([sys.executable, "-m", "explore.cores",
                              str(cores)], capture_output=True, text=True)
        seconds = float(run.stdout.split()[-1])
        base = base or seconds
        print(f"local[{cores}]: {seconds:5.1f} s · "
              f"{base / seconds:3.1f}× faster than 1 core")
