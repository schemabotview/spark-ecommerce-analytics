#!/usr/bin/env bash
# A standalone Spark cluster on this machine: one master, two workers of
# 2 cores and 1 GB each. pip's PySpark has no start-master.sh, but it has
# the script those call: sbin/spark-daemon.sh.        ./cluster.sh start|stop
set -euo pipefail
export SPARK_HOME=$(python -c "import pyspark; print(pyspark.__path__[0])")
export SPARK_LOG_DIR=$PWD/logs/cluster SPARK_PID_DIR=$PWD/logs/cluster
daemon="$SPARK_HOME/sbin/spark-daemon.sh"
master=org.apache.spark.deploy.master.Master
worker=org.apache.spark.deploy.worker.Worker
case "$1" in
  start)
    "$daemon" start $master 1 --host 127.0.0.1 --port 7077 > /dev/null
    for n in 1 2; do
      "$daemon" start $worker $n spark://127.0.0.1:7077 --host 127.0.0.1 \
        --cores 2 --memory 1g --webui-port $((8080 + n)) \
        --work-dir "$SPARK_LOG_DIR/work" > /dev/null
    done
    sleep 5  # the workers register with the master
    echo "master spark://127.0.0.1:7077 · 2 workers × 2 cores";;
  stop)
    for n in 1 2; do "$daemon" stop $worker $n > /dev/null; done
    "$daemon" stop $master 1 > /dev/null
    echo "cluster stopped";;
esac
