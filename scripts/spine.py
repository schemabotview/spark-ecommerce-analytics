#!/usr/bin/env python3
"""Replay every spine step and compare its terminal transcript with what the code really prints.

The spine is the course's one project, `shopwave`, kept as real files: one snapshot per step in
spine/<course>/<step>/project/. Each step's session.txt is the terminal pane a scene shows — `$ `
lines are commands, everything else is their output. Scenes import these files with Vite's `?raw`,
so a frame can only show what this script has verified.

  python scripts/spine.py            check every step (exit 1 on any difference)
  python scripts/spine.py --write    re-run every step and rewrite its session.txt / captures
  python scripts/spine.py start/03   only the steps whose path starts with an argument

Ported from python-expense-tracker's spine.py; what differs is Spark's:

- Each step is replayed in a FIXED directory, $SPINE_ROOT/home/shopwave (default /tmp/shopwave-spine),
  shown as /home/ana/shopwave. A PySpark venv is ~500 MB and takes most of a minute to install, so a
  step with {"venv": true} reuses one venv per requirements.txt: built once at the project's path,
  moved aside after the step and moved back for the next one. A venv's scripts carry absolute paths,
  which stay valid because it always comes back to the same place.
- The JVM: Java 21 is required, and the environment's JAVA_TOOL_OPTIONS (a proxy setup) is dropped,
  or every JVM start would print "Picked up JAVA_TOOL_OPTIONS". SPARK_LOCAL_IP is set because a
  container's hostname resolves to loopback, which Spark warns about on every start; a learner's
  laptop does not.
- `volatile` also masks UUIDs (Spark names every part file with one).
- DATA IS GENERATED, NOT COMMITTED. {"generated": {...}} (or a list of them) on a step names
  `python -m shopwave_gen` arguments; the step and every step after it on the chain replay with that
  data in data/raw. A scene that shows a data file captures it (`capture`). jars/ likewise: a
  project's jars.txt lists Maven Central URLs, fetched once and cached.
- A project with a compose.yaml gets its services restarted from scratch before the step
  (`docker compose down -v`, then `up -d --wait` unless {"services": false}).

Each step is replayed by ONE bash process, so `cd` and `source .venv/bin/activate` carry from command
to command as they do in a real terminal. A command followed by `>>> ` lines is an interactive session:
it is run in a pseudo-terminal and fed those lines.

THE SPINE IS CUMULATIVE. Every step is the step before it plus the changes it declares, and this
script fails a step whose project differs from its parent's anywhere it did not declare — so nothing
written for the platform is thrown away or edited silently. Each step.json says where it sits:

  {"first": true}               starts the chain
  {"from": "start/02-first",    continues that step; `changes` lists every path it adds, edits or
   "changes": ["job.py"]}       removes (a directory covers everything under it). A declared path
                                that did not change fails too: the list is the section's diff.
  {"lab": true}                 a standalone lab outside the chain: the real output a concept scene
                                shows (Course 1, and every full-scene detour)

step.json (other keys, all optional):
  {"venv": true}                start with the shared PySpark venv (requirements.txt) activated
  {"capture": ["path", ...]}    files the session creates that a scene shows; saved to captured/
  {"project": "name"}           the folder's name (default shopwave): a lab is not the spine
  {"volatile": true}            output carries ids or timings that change every run: compared with
                                digits, hex addresses and UUIDs masked; or a list of only the kinds
                                to mask, e.g. ["uuid"] (a part file's name) or ["digits"]
  {"setup": ["cmd", ...]}       run silently before the transcript (after the venv)
  {"generated": {"sf": 0.01, "from": "2026-10-01", "to": "2026-10-31", "only": ["orders"]}}
                                data this step adds to its chain's (see above)
  {"services": false}           do not start compose.yaml's services: the session starts them
"""
import hashlib
import json
import os
import pty
import re
import select
import shlex
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
ROOT = REPO / 'spine'
# Every output in the course is produced on this interpreter (COURSE-PLAN.md, "Versions, pinned").
PINNED = 'Python 3.14.9'
INTERPRETERS = ('python', 'python3.14')
PREFIX = '/usr/local'
JAVA = 'version "21.'
# Run outputs, the venv, and what materialize() puts in: never part of a step's snapshot.
IGNORED = {'__pycache__', '.venv', 'logs', 'out', 'spark-warehouse', 'lake', 'checkpoints', 'jars', 'data', 'metastore_db'}
SHOWN_HOME = '/home/ana'
PROJECT = 'shopwave'
SPINE_ROOT = Path(os.environ.get('SPINE_ROOT', '/tmp/shopwave-spine'))
ANSI = re.compile(r'\x1b\[[0-9;?]*[@-~]|\x1b[=>]|\r')
MARK = '__SPINE_MARK__'
UUID = re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')


def commands(session: str) -> list[tuple[str, list[str]]]:
    """Split a transcript into (command, REPL input lines) pairs."""
    out: list[tuple[str, list[str]]] = []
    for line in session.splitlines():
        if line.startswith('$ '):
            out.append((line[2:], []))
        elif out and (line.startswith('>>> ') or line == '>>>'):
            out[-1][1].append(line[4:])
        elif out and (line.startswith('... ') or line == '...'):
            # Python 3.13+'s REPL indents a block for you: typed WITHOUT the transcript's indentation.
            out[-1][1].append(line[4:].lstrip())
    return out


def repl(cwd: Path, env: dict, inputs: list[str], argv: list[str]) -> str:
    """Run an interactive command in a pty, type each input line, return the screen."""
    pid, fd = pty.fork()
    if pid == 0:
        os.chdir(cwd)
        os.execvpe(argv[0], argv, {**env, 'TERM': 'xterm-256color'})
    screen = b''

    def drain(timeout: float) -> None:
        nonlocal screen
        end = time.time() + timeout
        while time.time() < end:
            ready, _, _ = select.select([fd], [], [], 0.05)
            if ready:
                try:
                    chunk = os.read(fd, 4096)
                except OSError:
                    return
                if not chunk:
                    return
                screen += chunk
                end = time.time() + 1.0

    drain(30)
    for line in inputs:
        os.write(fd, line.encode() + b'\r')
        drain(30)
    for _ in range(300):
        if os.waitpid(pid, os.WNOHANG)[0]:
            break
        time.sleep(0.1)
    else:
        os.kill(pid, 9)
        os.waitpid(pid, 0)
        screen += b'\n[the session did not exit: check the >>> lines in session.txt]'
    text = ANSI.sub('', screen.decode(errors='replace'))
    return '\n'.join(l.rstrip() for l in text.split('\n')).strip('\n')


def environment(home: Path) -> dict:
    env = {k: v for k, v in os.environ.items() if k not in ('JAVA_TOOL_OPTIONS', '_JAVA_OPTIONS', 'JDK_JAVA_OPTIONS', 'VIRTUAL_ENV')}
    return {**env, 'HOME': str(home), 'NO_COLOR': '1', 'PYTHON_COLORS': '0', 'TERM': 'dumb', 'PS1': '',
            'SPARK_LOCAL_IP': '127.0.0.1', 'PIP_DISABLE_PIP_VERSION_CHECK': '1',
            # The step's HOME would give pip an empty cache every step: keep the real one.
            'PIP_CACHE_DIR': os.environ.get('PIP_CACHE_DIR', str(Path.home() / '.cache' / 'pip'))}


def venv_key(project: Path) -> str:
    req = project / 'requirements.txt'
    if not req.exists():
        sys.exit(f'✗ {project}: "venv": true needs a requirements.txt')
    return hashlib.sha256(req.read_bytes()).hexdigest()[:16]


def replay(step: Path) -> tuple[str, dict[str, str]]:
    config = config_of(step)
    session = (step / 'session.txt').read_text()
    home = SPINE_ROOT / 'home'
    shutil.rmtree(home, ignore_errors=True)
    home.mkdir(parents=True)
    project = home / config.get('project', PROJECT)
    if (step / 'project').exists():
        shutil.copytree(step / 'project', project)
    else:
        project.mkdir()
    env = environment(home)
    materialize(step, project)
    parked = None
    if config.get('venv'):
        parked = SPINE_ROOT / 'venvs' / venv_key(project)
        if parked.exists():
            parked.rename(project / '.venv')
        else:
            subprocess.run(['python', '-m', 'venv', '.venv'], cwd=project, env=env, check=True)
            subprocess.run([str(project / '.venv/bin/pip'), 'install', '-q', '-r', 'requirements.txt'], cwd=project, env=env, check=True)
        env['PATH'] = f"{project / '.venv' / 'bin'}:{env['PATH']}"
        env['VIRTUAL_ENV'] = str(project / '.venv')
    try:
        if (project / 'compose.yaml').exists():
            # Every step starts its services from scratch: a database initialised from this step's data.
            compose = ['docker', 'compose', '--progress', 'quiet']
            subprocess.run([*compose, 'down', '-v', '--remove-orphans'], cwd=project, env=env, check=True, capture_output=True)
            if config.get('services', True):
                subprocess.run([*compose, 'up', '-d', '--wait'], cwd=project, env=env, check=True, capture_output=True)
        for cmd in config.get('setup', []):
            r = subprocess.run(['bash', '-c', cmd], cwd=project, env=env, capture_output=True, text=True)
            if r.returncode:
                sys.exit(f'✗ {step.relative_to(ROOT)}: setup `{cmd}` failed:\n{r.stdout}{r.stderr}')
        cwd = project
        blocks: list[str] = []
        state = SPINE_ROOT / '.spine-state'
        state.unlink(missing_ok=True)
        for cmd, inputs in commands(session):
            if inputs:
                output = repl(cwd, env, inputs, shlex.split(cmd))
            else:
                script = f'cd {cwd!s}\n{{ {cmd}\n}} 2>&1\necho "{MARK}$PWD"\n'
                if state.exists():
                    script = state.read_text() + script
                r = subprocess.run(['bash', '-c', script + f'declare -p VIRTUAL_ENV PATH 2>/dev/null > {state}'],
                                   env=env, capture_output=True, text=True)
                output, _, after = r.stdout.partition(MARK)
                if after:
                    cwd = Path(after.split('\n')[0])
                output = output.rstrip('\n')
                if state.exists():
                    saved = state.read_text()
                    state.write_text(saved.replace('declare -x', 'export').replace('declare --', 'export') + '\n')
            blocks.append(f'$ {cmd}' + (f'\n{output}' if output else ''))
        transcript = '\n'.join(blocks)
        captured = {name: (project / name).read_text() for name in config.get('capture', [])}
    finally:
        if parked is not None and (project / '.venv').exists():
            parked.parent.mkdir(parents=True, exist_ok=True)
            if not parked.exists():
                (project / '.venv').rename(parked)
    fix = lambda s: s.replace(str(home), SHOWN_HOME)
    return fix(transcript).rstrip('\n') + '\n', {k: fix(v) for k, v in captured.items()}


def masked(text: str, step: Path) -> str:
    """For a volatile step, hide what legitimately changes from run to run."""
    kinds = config_of(step).get('volatile')
    if not kinds:
        return text
    kinds = {'uuid', 'hex', 'digits'} if kinds is True else set(kinds)
    if 'uuid' in kinds:
        text = UUID.sub('<uuid>', text)
    if 'hex' in kinds:
        text = re.sub(r'0x[0-9a-f]+', '0x#', text)
    # A number's padding goes with it: f'{s:5.1f}' pads 8.6 one space more than 10.1
    return re.sub(r' *\d+(?:[.,]\d+)*', ' #', text) if 'digits' in kinds else text


def config_of(step: Path) -> dict:
    return json.loads((step / 'step.json').read_text()) if (step / 'step.json').exists() else {}


def files(step: Path) -> dict[str, bytes]:
    """A step's project as {relative path: bytes}, without caches, the venv and run outputs."""
    root = step / 'project'
    if not root.exists():
        return {}
    return {
        p.relative_to(root).as_posix(): p.read_bytes()
        for p in sorted(root.rglob('*'))
        if p.is_file() and not IGNORED & set(p.relative_to(root).parts) and p.suffix != '.pyc'
    }


def lineage(step: Path) -> list[str]:
    """Why this step is not its parent plus its declared changes (empty when it is)."""
    name = step.relative_to(ROOT)
    config = config_of(step)
    kinds = [k for k in ('first', 'from', 'lab') if config.get(k)]
    if len(kinds) != 1:
        return [f'{name}: step.json needs exactly one of "first", "from", "lab" (has {kinds or "none"})']
    if 'from' not in kinds:
        return [f'{name}: "changes" only means something with "from"'] if config.get('changes') else []
    parent = ROOT / config['from']
    if not (parent / 'session.txt').exists():
        return [f'{name}: "from" names {config["from"]}, which is not a step']
    if config_of(parent).get('lab'):
        return [f'{name}: "from" names a lab, which is outside the chain']
    changes = config.get('changes') or []
    if not changes:
        return [f'{name}: "from" without "changes" — a step that changes nothing is not a section']
    under = lambda path, c: path == c or path.startswith(c.rstrip('/') + '/')
    covered = lambda path: any(under(path, c) for c in changes)
    before, after = files(parent), files(step)
    differs = {path for path in before.keys() | after.keys() if before.get(path) != after.get(path)}
    out = [f'{name}: {path} differs from {config["from"]} but is not in "changes"' for path in sorted(differs) if not covered(path)]
    out += [f'{name}: "changes" lists {c}, which did not change' for c in changes if not any(under(p, c) for p in differs)]
    return out


def lineage_of(step: Path) -> list[Path]:
    """The step and every ancestor through `from`, oldest first."""
    chain = [step]
    while config_of(chain[0]).get('from'):
        chain.insert(0, ROOT / config_of(chain[0])['from'])
    return chain


def data_specs(step: Path) -> list[dict]:
    """Every `generated` spec on the step's chain: data is inherited like code."""
    out = []
    for s in lineage_of(step):
        spec = config_of(s).get('generated')
        out += spec if isinstance(spec, list) else [spec] if spec else []
    return out


def run_logged(args: list[str], **kw) -> None:
    r = subprocess.run(args, capture_output=True, text=True, **kw)
    if r.returncode:
        sys.exit(f'✗ `{" ".join(args)}` failed:\n{r.stdout}{r.stderr}')


def materialize(step: Path, project: Path) -> None:
    """Put the step's data and jars into the replay project. Neither is committed: data/raw is
    exactly what shopwave_gen writes for the chain's specs (generated once, cached by spec), and
    jars/ is what jars.txt names (downloaded once, cached by file name)."""
    for spec in data_specs(step):
        gen = {k: v for k, v in spec.items() if k != 'dest'}  # the cache is per generated data
        key = hashlib.sha256(json.dumps(gen, sort_keys=True).encode()).hexdigest()[:16]
        cache = SPINE_ROOT / 'data' / key
        if not cache.exists():
            # The repo's own .venv carries the generator's one dependency (scripts/requirements-gen.txt).
            gen = REPO / '.venv' / 'bin' / 'python'
            tmp = cache.with_suffix('.tmp')
            shutil.rmtree(tmp, ignore_errors=True)
            run_logged([str(gen) if gen.exists() else sys.executable, '-m', 'shopwave_gen', '--sf', str(spec['sf']), '--out', str(tmp),
                        '--from', spec['from'], '--to', spec['to'], *(a for t in spec.get('only', []) for a in ('--only', t))], cwd=REPO)
            tmp.rename(cache)
        # `dest`: where in the project the data lands (default data/raw), so a second scale
        # factor can sit beside the first without mixing with it
        shutil.copytree(cache, project / spec.get('dest', 'data/raw'), dirs_exist_ok=True)
    if (project / 'jars.txt').exists():
        (project / 'jars').mkdir(exist_ok=True)
        for url in (project / 'jars.txt').read_text().split():
            cached = SPINE_ROOT / 'jars' / url.rsplit('/', 1)[1]
            if not cached.exists():
                cached.parent.mkdir(parents=True, exist_ok=True)
                run_logged(['curl', '-sSfL', '-o', str(cached), url])
            shutil.copy(cached, project / 'jars' / cached.name)


def preflight() -> str | None:
    for name in INTERPRETERS:
        probe = 'import sys, platform; print("Python " + platform.python_version(), sys.base_prefix)'
        try:
            version, _, prefix = subprocess.run([name, '-c', probe], capture_output=True, text=True).stdout.strip().partition(' /')
        except FileNotFoundError:
            version, prefix = '', ''
        prefix = '/' + prefix if prefix else ''
        if version != PINNED or prefix != PREFIX:
            return f'`{name}` is {version or "missing"} from {prefix or "?"}, not {PINNED} from {PREFIX}: run scripts/install-toolchain.sh'
    java = subprocess.run(['java', '-version'], capture_output=True, text=True, env=environment(Path.home()))
    if JAVA not in java.stderr:
        return f'Java 21 is required: `java -version` says {java.stderr.strip().splitlines()[:1]}'
    return None


def main() -> int:
    write = '--write' in sys.argv
    problem = preflight()
    if problem:
        print(f'✗ {problem}')
        return 1
    only = [a for a in sys.argv[1:] if not a.startswith('--')]
    every = sorted(p.parent for p in ROOT.glob('*/*/session.txt'))
    steps = [s for s in every if not only or any(str(s.relative_to(ROOT)).startswith(o) for o in only)]
    problems = 0
    # The chain is checked over EVERY step, whatever was asked for: a filtered run must not hide a
    # parent edited out from under its children.
    for problem in (p for s in every for p in lineage(s)):
        problems += 1
        print(f'✗ {problem}')
    if problems and write:
        print('✗ the chain or its data is broken: fix step.json or the snapshots before rewriting transcripts')
        return 1
    for step in steps:
        before = problems
        transcript, captured = replay(step)
        name = step.relative_to(ROOT)
        if write:
            (step / 'session.txt').write_text(transcript)
            for file, text in captured.items():
                target = step / 'captured' / file
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(text)
            print(f'wrote {name}')
            continue
        expected = (step / 'session.txt').read_text()
        if masked(transcript, step) != masked(expected, step):
            problems += 1
            print(f'✗ {name}: the terminal pane differs from a real run')
            import difflib
            sys.stdout.writelines(difflib.unified_diff(expected.splitlines(True), transcript.splitlines(True), 'session.txt', 'real run'))
        for file, text in captured.items():
            if (step / 'captured' / file).read_text() != text:
                problems += 1
                print(f'✗ {name}: captured/{file} differs from a real run')
        print(f'{"✗" if problems > before else "✓"} {name}')
    if not write:
        print(f"{'✗' if problems else '✓'} {len(steps)} spine step(s) replayed, {problems} problem(s)")
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
