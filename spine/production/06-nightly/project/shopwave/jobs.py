"""The nightly run: every job, in order, behind one command.

    python -m shopwave.jobs                list them
    python -m shopwave.jobs run JOB ...    run some, in the order given
    python -m shopwave.jobs nightly        run them all

Each job's own output goes to logs/nightly.log; the terminal gets a line a job.
"""
import os
import sys
from collections.abc import Callable
from contextlib import redirect_stdout

from shopwave import bronze, checks, gold, lake, ml, silver

JOBS: dict[str, tuple[str, Callable[[], None]]] = {
    "bronze": ("land every source, as it came", bronze.main),
    "silver": ("clean and conform; quality gates", silver.main),
    "gold": ("the star schema, as Delta tables", gold.main),
    "checks": ("what gold must be true of", checks.main),
    "orders": ("gold/orders: orders since the mark",
               lambda: lake.main(["orders"])),
    "changes": ("gold/orders: the change feed merged",
                lambda: lake.main(["changes"])),
    "recommend": ("gold/recommendations: ALS, refitted", ml.main),
}


def run(names: list[str]) -> None:
    """Each job in one process: one JVM, one SparkSession, for the night.
    The first job to fail stops the rest: they would build on its output."""
    os.makedirs("logs", exist_ok=True)
    with open("logs/nightly.log", "w") as log:
        for name in names:
            try:
                with redirect_stdout(log):
                    JOBS[name][1]()
            except SystemExit as failed:
                print(f"✗ {name:10} {failed}")
                sys.exit(1)
            print(f"✓ {name:10} {JOBS[name][0]}")


def main(argv: list[str]) -> None:
    if not argv:
        for name, (what, _) in JOBS.items():
            print(f"{name:10} {what}")
    elif argv[0] == "nightly":
        run(list(JOBS))
    elif argv[0] == "run" and set(argv[1:]) <= set(JOBS):
        run(argv[1:])
    else:
        sys.exit(f"no such job: {' '.join(argv)}; python -m shopwave.jobs")


if __name__ == "__main__":
    main(sys.argv[1:])
