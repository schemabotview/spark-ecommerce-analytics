"""Assert every planted problem (COURSE-PLAN.md, "The data") is really in the data.

A lesson is built on each of these; a generator change that loses one fails here, not on screen.
Measured on sample days (the busy ones and a spread of ordinary ones) so it runs in seconds.
"""
from __future__ import annotations

import statistics
from collections import Counter
from datetime import date, timedelta

from .__main__ import event_json
from .model import (BESTSELLER_ID, BESTSELLER_SHARE, BLACK_FRIDAY, BLACK_FRIDAY_X, BOT_ID, BOT_SHARE,
                    DOUBLE_PAID_RATE, SCHEMA_CHANGE, UNPAID_RATE, World, days)

SAMPLE = [date(2026, 3, 2), date(2026, 5, 31), date(2026, 6, 1), *days(date(2026, 10, 1), date(2026, 10, 31)), BLACK_FRIDAY]


def verify(world: World) -> int:
    problems: list[str] = []
    ok: list[str] = []

    def check(cond: bool, good: str, bad: str) -> None:
        (ok if cond else problems).append(good if cond else bad)

    ordinary = statistics.median(world.orders_on(d) for d in days())
    bf = world.orders_on(BLACK_FRIDAY)
    check(bf >= 0.8 * BLACK_FRIDAY_X * ordinary, f'Black Friday: {bf} orders vs a median day of {ordinary:g}',
          f'Black Friday has {bf} orders, under {0.8 * BLACK_FRIDAY_X:g}× the median day ({ordinary:g})')

    items = [i for d in SAMPLE for i in world.day(d)['order_items']]
    share = sum(1 for i in items if i['product_id'] == BESTSELLER_ID) / len(items)
    check(abs(share - BESTSELLER_SHARE) < 0.04, f'bestseller: {share:.1%} of order items',
          f'the bestseller is {share:.1%} of order items, not ~{BESTSELLER_SHARE:.0%}')

    before, after = event_json(world.day(date(2026, 5, 31))['events'][0], date(2026, 5, 31)), event_json(world.day(SCHEMA_CHANGE)['events'][0], SCHEMA_CHANGE)
    check('"device"' in before and '"device_type"' in after and '"consent"' in after and '"consent"' not in before,
          f'schema change on {SCHEMA_CHANGE}: device → device_type, + consent', 'the clickstream schema does not change on June 1')

    arriving = [e for d in days(date(2026, 10, 10), date(2026, 10, 12)) for _, e in world.events_arriving(d)]
    ids = Counter(e['event_id'] for e in arriving)
    dups = sum(1 for n in ids.values() if n > 1)
    late = 0
    for d in days(date(2026, 10, 10), date(2026, 10, 12)):
        late += sum(1 for arrived, e in world.events_arriving(d) if arrived.date() > e['event_ts'].date())
    check(dups > 0, f'duplicates: {dups} event ids sent twice in 3 days', 'no duplicate events')
    check(late > 0, f'late events: {late} land on a later day in 3 days', 'no late events')

    events = world.day(date(2026, 10, 14))['events']
    bot = sum(1 for e in events if e['anon_id'] == BOT_ID) / len(events)
    check(abs(bot - BOT_SHARE) < 0.02, f'bot: {bot:.1%} of a day\'s events', f'the bot is {bot:.1%} of events, not ~{BOT_SHARE:.0%}')

    orders = [o for d in SAMPLE for o in world.day(d)['orders'] if o['status'] != 'cancelled']
    paid = Counter(p['order_id'] for d in SAMPLE for p in world.day(d)['payments'])
    unpaid = sum(1 for o in orders if o['order_id'] not in paid) / len(orders)
    twice = sum(1 for n in paid.values() if n > 1)
    check(0 < unpaid < 4 * UNPAID_RATE, f'unpaid orders: {unpaid:.1%}', f'unpaid orders: {unpaid:.1%}')
    check(twice > 0 or DOUBLE_PAID_RATE * len(orders) < 1, f'orders paid twice: {twice}', 'no order is paid twice')
    category = {p['product_id']: p['category'] for p in world.products()}
    liked, disliked = [], []
    for rv in (rv for d in SAMPLE for rv in world.reviews_on(d)):
        t = world.taste(rv['customer_id'])[category[rv['product_id']]]
        (liked if t > 1 else disliked if t < -1 else []).append(rv['rating'])
    gap = statistics.mean(liked) - statistics.mean(disliked) if liked and disliked else 0
    check(gap > 1.5, f'taste: a favourite category rated {gap:.1f} stars above a disliked one',
          f'taste is too weak in the reviews: {gap:.1f} stars between liked and disliked')
    currencies = sorted({p['currency'] for d in SAMPLE for p in world.day(d)['payments']})
    check(len(currencies) >= 3, f'payment currencies: {", ".join(currencies)}', f'payments in only {currencies}')

    returns = world.returns_in(2026, 10)
    check(any(not r['reason'].isascii() for r in returns), f'returns: {len(returns)} in October, non-ASCII reasons (Latin-1 file)',
          'no return reason needs Latin-1')

    for line in ok:
        print(f'✓ {line}')
    for line in problems:
        print(f'✗ {line}')
    return 1 if problems else 0


if __name__ == '__main__':
    raise SystemExit(verify(World(2026, 0.01)))
