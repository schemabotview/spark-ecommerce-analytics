#!/usr/bin/env python3
"""Carry an edit to one step's file into the steps AFTER it that held the same old text.

  python scripts/propagate.py <course/NN-step> <path in project> <old file>

The spine is cumulative: a file a step introduced is copied, unchanged, into every step after
it. Fixing it in one step (a typo, a line over 79 columns) must fix it in each copy, or the
chain check fails. This replaces each copy whose bytes equal <old file> with the step's new file.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'spine'
step, rel, old = sys.argv[1], sys.argv[2], Path(sys.argv[3]).read_bytes()
new = (ROOT / step / 'project' / rel).read_bytes()
sys.path.insert(0, str(ROOT.parent / 'scripts'))
from spine import lineage_of  # noqa: E402  (a step's ancestors, oldest first)

for other in sorted(ROOT.glob(f'*/*/project/{rel}')):
    other_step = next(p.parent for p in other.parents if p.name == 'project')
    later = ROOT / step in lineage_of(other_step)[:-1]
    if later and other.read_bytes() == old:
        other.write_bytes(new)
        print('updated', other.relative_to(ROOT))
