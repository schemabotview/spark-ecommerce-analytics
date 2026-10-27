"""Lab: where an executor's memory goes. local mode: the driver's JVM."""
from shopwave.session import spark_session

MB = 1024 * 1024
spark = spark_session()
sc = spark.sparkContext
conf = sc.getConf()
heap = sc._jvm.java.lang.Runtime.getRuntime().maxMemory()
reserved = 300 * MB  # Spark keeps 300 MB for itself, always
fraction = float(conf.get("spark.memory.fraction", "0.6"))
storage = float(conf.get("spark.memory.storageFraction", "0.5"))
unified = (heap - reserved) * fraction
executor = sc._jsc.sc().statusStore().executorList(True).apply(0)

print("spark.driver.memory:", conf.get("spark.driver.memory", "1g (default)"))
print(f"JVM heap Spark sees:     {heap / MB:7.0f} MB")
print(f"reserved:                {reserved / MB:7.0f} MB")
print(f"user memory (40%):       {(heap - reserved) * (1 - fraction) / MB:7.0f} MB"
      "  your objects, UDF data")
print(f"unified (60%):           {unified / MB:7.0f} MB"
      "  execution + storage, shared")
print(f"  storage, protected:    {unified * storage / MB:7.0f} MB  cached data")
print(f"  execution:             {unified * (1 - storage) / MB:7.0f} MB"
      "  shuffles, joins, sorts")
print(f"the UI's storage memory: {executor.maxMemory() / MB:7.0f} MB")
