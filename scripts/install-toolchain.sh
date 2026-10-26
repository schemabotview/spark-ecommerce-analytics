#!/usr/bin/env bash
# Install the course's pinned toolchain, as on a learner's machine (COURSE-PLAN.md, "Versions, pinned"):
#   CPython 3.14.9 in /usr/local as `python` and `python3.14` — PySpark 4.2.0 supports 3.10–3.14,
#     so the course runs on 3.14, not the Python course's 3.15
#   a Java 21 runtime — Spark is a JVM program; `pip install pyspark` brings Spark, not Java
# Usable as a cloud environment's setup script. Needs network access to PyPI and GitHub.
set -euo pipefail
PIN=3.14.9
if [ "$(python -c 'import platform; print(platform.python_version())' 2>/dev/null)" != "$PIN" ] ||
   [ "$(python3.14 -c 'import platform; print(platform.python_version())' 2>/dev/null)" != "$PIN" ]; then
  work=$(mktemp -d)
  python3 -m pip download "uv==0.13.5" --no-deps -q -d "$work"
  python3 -m zipfile -e "$work"/uv-*.whl "$work/uv"
  uv=$(find "$work/uv" -path '*data/scripts/uv'); chmod +x "$uv"
  "$uv" python install "$PIN" --install-dir "$work/py"
  cp -a "$work/py/cpython-$PIN-linux-x86_64-gnu/." /usr/local/
  ln -sf python3.14 /usr/local/bin/python
  # uv links python3.14 into ~/.local/bin, AHEAD of /usr/local/bin on PATH: a venv made through it
  # would record a scratch path in pyvenv.cfg.
  rm -f ~/.local/bin/python3.14
  rm -rf "$work"
fi
python -c 'import platform; assert platform.python_version() == "'$PIN'"'
if ! java -version 2>&1 | grep -q 'version "21\.'; then
  if command -v apt-get >/dev/null; then apt-get install -y -q openjdk-21-jre-headless >/dev/null; fi
fi
java -version 2>&1 | grep -q 'version "21\.' || { echo "✗ Java 21 is required (java -version)"; exit 1; }
echo "python $PIN in /usr/local; java 21 on PATH"
