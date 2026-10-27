"""One SparkSession for the whole test run: starting a JVM takes seconds."""
import pytest

from shopwave.session import spark_session


@pytest.fixture(scope="session")
def spark():
    # Tiny frames: one shuffle partition, no web UI
    session = spark_session(**{"spark.sql.shuffle.partitions": "1",
                               "spark.ui.enabled": "false"})
    yield session
    session.stop()
