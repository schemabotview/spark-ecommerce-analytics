"""The nightly run: every job, in order, behind one command.

    python -m shopwave.jobs                list them
    python -m shopwave.jobs run JOB ...    run some, in the order given
    python -m shopwave.jobs nightly        run them all
"""
import sys
from collections.abc import Callable

from shopwave import bronze, gold, lake, ml, silver

JOBS: dict[str, tuple[str, Callable[[], None]]] = {
    "bronze": ("land every source, as it came", bronze.main),
    "silver": ("clean and conform; quality gates", silver.main),
    "gold": ("the star schema, as Delta tables", gold.main),
    "orders": ("gold/orders: orders since the mark",
               lambda: lake.main(["orders"])),
    "changes": ("gold/orders: the change feed merged",
                lambda: lake.main(["changes"])),
    "recommend": ("gold/recommendations: ALS, refitted", ml.main),
}


def run(names: list[str]) -> None:
    """Each job in one process: one JVM, one SparkSession, for the night."""
    for name in names:
        print(f"▶ {name}")
        JOBS[name][1]()


def main(argv: list[str]) -> None:
    if not argv:
        for name, (what, _) in JOBS.items():
            print(f"{name:10} {what}")
    elif argv[0] == "nightly":
        run(list(JOBS))
    elif argv[0] == "run" and set(argv[1:]) <= set(JOBS):
        run(argv[1:])
    else:
        sys.exit(f"usage: python -m shopwave.jobs [run JOB ... | nightly]; "
                 f"jobs: {', '.join(JOBS)}")


if __name__ == "__main__":
    main(sys.argv[1:])
