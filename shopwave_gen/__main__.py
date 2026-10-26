"""Write Shopwave's sources as the course's systems export them.

  python -m shopwave_gen --sf 0.01 --out data/raw                       the whole year
  python -m shopwave_gen --sf 0.01 --out data/raw --from 2026-10-01 --to 2026-10-31 --only orders
  python -m shopwave_gen verify --sf 0.01                               assert every planted problem

Same seed and SF → byte-identical files. Layout under --out:

  customers.csv  products.csv  product_prices.csv  fx_rates.csv  campaigns.json
  orders/orders-<day>.csv            the shop database's nightly export (Course 2)
  order_items/order_items-<day>.csv
  payments/payments-<day>.parquet    the payment provider's daily drop (needs pyarrow)
  clickstream/<day>/events-<hh>.jsonl  by ARRIVAL hour: late and duplicate events included
  returns/returns-<yyyy-mm>.csv      the warehouse's monthly file: Latin-1, with malformed rows
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import sys
from datetime import date, timedelta
from pathlib import Path

from .model import CAMPAIGNS, FIRST, LAST, RETURNS_BAD_ROWS, SCHEMA_CHANGE, World, days, rng

TABLES = ['customers', 'products', 'product_prices', 'fx_rates', 'campaigns', 'orders', 'order_items', 'payments',
          'clickstream', 'returns']


def ts(t) -> str:
    return t.strftime('%Y-%m-%d %H:%M:%S')


def write_csv(path: Path, rows: list[dict], encoding: str = 'utf-8', extra: list[str] = ()) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    buf = io.StringIO(newline='')
    w = csv.DictWriter(buf, fieldnames=list(rows[0]), lineterminator='\n')
    w.writeheader()
    for row in rows:
        w.writerow({k: ts(v) if hasattr(v, 'hour') else v for k, v in row.items()})
    text = buf.getvalue()
    if extra:  # malformed lines, spliced in at fixed places so the file stays deterministic
        lines = text.splitlines(keepends=True)
        for i, bad in enumerate(extra):
            lines.insert(min(len(lines), 2 + i * max(1, len(lines) // (len(extra) + 1))), bad + '\n')
        text = ''.join(lines)
    path.write_bytes(text.encode(encoding))


def event_json(e: dict, day: date) -> str:
    context = {'device' if day < SCHEMA_CHANGE else 'device_type': e['device'], 'browser': e['browser'],
               'user_agent': e['user_agent'], 'campaign': e['campaign']}
    out = {'event_id': e['event_id'], 'event_ts': e['event_ts'].strftime('%Y-%m-%dT%H:%M:%S.000Z'),
           'event_type': e['event_type'], 'user_id': e['user_id'], 'anon_id': e['anon_id'], 'context': context,
           'items': [{'product_id': i['product_id'], 'qty': i['qty'], 'price': float(i['price'])} for i in e['items']]}
    if day >= SCHEMA_CHANGE:
        out['consent'] = 'granted' if int(e['event_id'][-1], 16) < 13 else 'denied'
    return json.dumps(out, separators=(',', ':'))


def write(world: World, out: Path, first: date, last: date, only: set[str]) -> None:
    want = lambda t: not only or t in only
    if want('customers'):
        write_csv(out / 'customers.csv', world.customers())
    if want('products'):
        write_csv(out / 'products.csv', world.products())
    if want('product_prices'):
        write_csv(out / 'product_prices.csv', world.price_changes())
    if want('fx_rates'):
        write_csv(out / 'fx_rates.csv', world.fx_rates())
    if want('campaigns'):
        (out / 'campaigns.json').parent.mkdir(parents=True, exist_ok=True)
        (out / 'campaigns.json').write_text(json.dumps(CAMPAIGNS, indent=2) + '\n')
    for d in days(first, last):
        day = world.day(d)
        if want('orders'):
            write_csv(out / 'orders' / f'orders-{d}.csv', day['orders'])
        if want('order_items'):
            write_csv(out / 'order_items' / f'order_items-{d}.csv', day['order_items'])
        if want('payments'):
            write_payments(out / 'payments' / f'payments-{d}.parquet', day['payments'])
        if want('clickstream'):
            hours: dict[int, list[str]] = {}
            for arrived, e in world.events_arriving(d):
                hours.setdefault(arrived.hour, []).append(event_json(e, d))
            for h, lines in sorted(hours.items()):
                path = out / 'clickstream' / str(d) / f'events-{h:02d}.jsonl'
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text('\n'.join(lines) + '\n')
        if want('returns') and (d + timedelta(days=1)).month != d.month:  # the warehouse files at month end
            rows = world.returns_in(d.year, d.month)
            if rows:
                r = rng(world.seed, 'returns-bad', d.year, d.month)
                bad = [f'R{r.randrange(10**7):08d},{r.randrange(10**5)},Defekt',  # a field missing
                       f'R{r.randrange(10**7):08d},{r.randrange(10**5)},{r.randrange(100)},"Größe falsch,{d.year}-{d.month:02d}-03',  # unclosed quote
                       f'R{r.randrange(10**7):08d},{r.randrange(10**5)},{r.randrange(100)},Defekt,03/{d.month:02d}/{d.year}'][:RETURNS_BAD_ROWS]
                write_csv(out / 'returns' / f'returns-{d.year}-{d.month:02d}.csv', rows, encoding='latin-1', extra=bad)


def write_payments(path: Path, rows: list[dict]) -> None:
    try:
        import pyarrow as pa
        import pyarrow.parquet as pq
    except ImportError:
        sys.exit('✗ payments are Parquet: pip install pyarrow (scripts/requirements-gen.txt)')
    path.parent.mkdir(parents=True, exist_ok=True)
    schema = pa.schema([('payment_id', pa.string()), ('order_id', pa.int64()), ('paid_ts', pa.timestamp('us', tz='UTC')),
                        ('currency', pa.string()), ('amount', pa.decimal128(12, 2)), ('method', pa.string())])
    table = pa.Table.from_pylist(rows, schema=schema)
    # The same rows give the same bytes (checked: two runs, one checksum).
    pq.write_table(table, path, compression='snappy', write_statistics=True)


def main(argv: list[str]) -> int:
    p = argparse.ArgumentParser(prog='python -m shopwave_gen', description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('command', nargs='?', choices=['write', 'verify'], default='write')
    p.add_argument('--sf', type=float, default=0.01, help='scale factor (1 = 2 M orders, ~50 M click events a year)')
    p.add_argument('--seed', type=int, default=2026)
    p.add_argument('--out', type=Path, default=Path('data/raw'))
    p.add_argument('--from', dest='first', type=date.fromisoformat, default=FIRST)
    p.add_argument('--to', dest='last', type=date.fromisoformat, default=LAST)
    p.add_argument('--only', action='append', choices=TABLES, default=[], help='only these tables (repeatable)')
    a = p.parse_args(argv)
    world = World(a.seed, a.sf)
    if a.command == 'verify':
        from .verify import verify
        return verify(world)
    write(world, a.out, a.first, a.last, set(a.only))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
