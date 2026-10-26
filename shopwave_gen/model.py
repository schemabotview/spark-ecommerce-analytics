"""Shopwave's year, as pure functions of (seed, scale factor, day).

Every table is drawn from its OWN random stream, seeded by (seed, table, day), so any day of any
table can be generated alone and comes out byte-identical every time: the spine copies October's
orders without generating the year, and `verify` re-derives a planted problem without the files.

The planted problems are the course's lessons (COURSE-PLAN.md, "The data"). Each one is a named
constant here and is asserted by `verify.py`, so a change to the generator cannot quietly remove
the skew Course 5 is about or the schema change Course 3 is about.
"""
from __future__ import annotations

import random
import uuid
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from functools import cache

YEAR = 2026
FIRST, LAST = date(YEAR, 1, 1), date(YEAR, 12, 31)
CENT = Decimal('0.01')

# --- scale ----------------------------------------------------------------------------------------
# At SF 1: 200 k customers, 5 k products, 2 M orders and ~50 M click events a year.
CUSTOMERS_PER_SF = 200_000
PRODUCTS_PER_SF = 5_000
ORDERS_PER_SF = 2_000_000
BROWSE_SESSIONS_PER_ORDER = 3  # sessions that never buy, per order

# --- planted problems -----------------------------------------------------------------------------
BLACK_FRIDAY = date(YEAR, 11, 27)
CYBER_MONDAY = date(YEAR, 11, 30)
BLACK_FRIDAY_X = 20  # orders on Black Friday vs an ordinary day
BESTSELLER_ID = 1  # one product is ~15% of all order items
BESTSELLER_SHARE = 0.15
SCHEMA_CHANGE = date(YEAR, 6, 1)  # clickstream: context.device → context.device_type, + consent
DUPLICATE_RATE = 0.005  # the tracker sends an event twice
LATE_RATE = 0.01  # an event lands in a file up to LATE_MAX after it happened
LATE_MAX = timedelta(days=3)
BOT_ID = 'anon-bot-7f3a'  # one scraper, a large share of a day's page views
BOT_SHARE = 0.08
BOT_AGENT = 'Mozilla/5.0 (compatible; ShopwaveScraper/1.0)'
UNPAID_RATE = 0.01  # orders with no payment
DOUBLE_PAID_RATE = 0.003  # orders paid twice
RETURNS_BAD_ROWS = 3  # malformed rows per monthly returns file (Latin-1)
PRICE_CHANGE_SHARE = 0.2  # products whose price changes during the year

COUNTRIES = ['DE', 'FR', 'NL', 'ES', 'IT', 'GB', 'IE', 'BE', 'AT', 'PL', 'SE', 'IN', 'US']
COUNTRY_W = [24, 16, 9, 9, 9, 10, 3, 4, 3, 4, 3, 3, 3]
CURRENCY = {'GB': 'GBP', 'IN': 'INR', 'US': 'USD'}  # everyone else pays in EUR
CATEGORIES = {
    'electronics': (['Headphones', 'Charger', 'Smart Speaker', 'Keyboard', 'Webcam', 'Power Bank'], (19, 249)),
    'home': (['Desk Lamp', 'Throw Blanket', 'Coffee Grinder', 'Plant Pot', 'Wall Clock'], (9, 120)),
    'fashion': (['Rain Jacket', 'Sneakers', 'Wool Scarf', 'Backpack', 'Sunglasses'], (15, 180)),
    'beauty': (['Face Cream', 'Shampoo', 'Perfume', 'Lip Balm'], (4, 90)),
    'sports': (['Yoga Mat', 'Water Bottle', 'Running Socks', 'Dumbbells'], (6, 140)),
    'books': (['Cookbook', 'Thriller', 'Travel Guide', 'Notebook'], (6, 40)),
}
BRANDS = ['Nordlys', 'Kavo', 'Merida', 'Ostra', 'Lumen', 'Tessel', 'Quill', 'Arbo']
DEVICES = ['mobile', 'desktop', 'tablet']
BROWSERS = ['Chrome', 'Safari', 'Firefox', 'Edge']
AGENT = {
    'Chrome': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36',
    'Safari': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) Version/18.1 Safari/605.1.15',
    'Firefox': 'Mozilla/5.0 (Windows NT 10.0; rv:133.0) Gecko/20100101 Firefox/133.0',
    'Edge': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0 Edg/131.0',
}
RETURN_REASONS = ['Größe falsch', 'Taille trop petite', 'Defekt', 'Ne correspond pas', 'Changed my mind', 'Arrivé abîmé']
FX = {'GBP': Decimal('0.86'), 'USD': Decimal('1.08'), 'INR': Decimal('90.5')}  # per EUR, mid-year


def rng(seed: int, *key: object) -> random.Random:
    return random.Random(':'.join(str(k) for k in (seed, *key)))


def days(first: date = FIRST, last: date = LAST):
    d = first
    while d <= last:
        yield d
        d += timedelta(days=1)


def money(x: float) -> Decimal:
    return Decimal(str(x)).quantize(CENT)


@dataclass(frozen=True)
class World:
    seed: int
    sf: float

    @property
    def n_customers(self) -> int:
        return max(50, round(CUSTOMERS_PER_SF * self.sf))

    @property
    def n_products(self) -> int:
        return max(40, round(PRODUCTS_PER_SF * self.sf))

    def day_factor(self, d: date) -> float:
        """How busy a day is, relative to an ordinary one."""
        if d == BLACK_FRIDAY:
            return BLACK_FRIDAY_X
        if d == CYBER_MONDAY:
            return 8
        f = (0.9, 0.9, 0.95, 1.0, 1.15, 1.3, 1.2)[d.weekday()]  # Mon … Sun
        if d.month == 12 and d.day < 24:
            f *= 1.5
        if d.month == 1 and d.day < 15:
            f *= 1.3  # January sales
        return f

    @cache
    def base_orders_per_day(self) -> float:
        total = sum(self.day_factor(d) for d in days())
        return ORDERS_PER_SF * self.sf / total

    def orders_on(self, d: date) -> int:
        return max(1, round(self.base_orders_per_day() * self.day_factor(d)))

    @cache
    def first_order_id(self, d: date) -> int:
        """Order ids are consecutive across the year, as an OLTP sequence hands them out."""
        return 1 + sum(self.orders_on(x) for x in days(FIRST, d - timedelta(days=1)))

    # --- dimensions ---------------------------------------------------------------------------
    @cache
    def customers(self) -> list[dict]:
        r = rng(self.seed, 'customers')
        out = []
        for cid in range(1, self.n_customers + 1):
            country = r.choices(COUNTRIES, COUNTRY_W)[0]
            signup = date(YEAR - 3, 1, 1) + timedelta(days=r.randrange(3 * 365 + 300))
            out.append({'customer_id': cid, 'country': country, 'signup_date': signup.isoformat(),
                        'email': f'customer{cid}@example.com'})
        return out

    @cache
    def products(self) -> list[dict]:
        r = rng(self.seed, 'products')
        names = [(c, n) for c, (ns, _) in CATEGORIES.items() for n in ns]
        out = []
        for pid in range(1, self.n_products + 1):
            category, noun = names[0 if pid == BESTSELLER_ID else r.randrange(len(names))]
            lo, hi = CATEGORIES[category][1]
            brand = r.choice(BRANDS)
            price = money(r.uniform(lo, hi)) - Decimal('0.01') if pid != BESTSELLER_ID else Decimal('59.99')
            out.append({'product_id': pid, 'sku': f'SW-{pid:06d}', 'name': f'{brand} {noun}', 'brand': brand,
                        'category': category, 'price': price})
        return out

    @cache
    def price_changes(self) -> list[dict]:
        """(product_id, price, valid_from): the history Course 7's SCD Type 2 rebuilds."""
        r = rng(self.seed, 'prices')
        out = []
        for p in self.products():
            out.append({'product_id': p['product_id'], 'price': p['price'], 'valid_from': FIRST.isoformat()})
            if r.random() < PRICE_CHANGE_SHARE:
                price = p['price']
                for when in sorted(r.sample(range(30, 360), 2)):
                    price = (price * Decimal(str(r.choice([0.8, 0.9, 1.1, 1.15])))).quantize(CENT)
                    out.append({'product_id': p['product_id'], 'price': price,
                                'valid_from': (FIRST + timedelta(days=when)).isoformat()})
        return out

    def price_on(self, product_id: int, d: date) -> Decimal:
        price = Decimal(0)
        for c in self._prices_by_product()[product_id]:
            if c['valid_from'] <= d.isoformat():
                price = c['price']
        return price

    @cache
    def _prices_by_product(self) -> dict[int, list[dict]]:
        out: dict[int, list[dict]] = {}
        for c in self.price_changes():
            out.setdefault(c['product_id'], []).append(c)
        return out

    @cache
    def _customer_weights(self) -> list[float]:
        return [1 / (i ** 0.6) for i in range(1, self.n_customers + 1)]

    @cache
    def _product_weights(self) -> list[float]:
        # The bestseller takes BESTSELLER_SHARE; the rest share the remainder on a long tail.
        tail = [1 / (i ** 0.9) for i in range(1, self.n_products)]
        s = sum(tail)
        return [BESTSELLER_SHARE] + [w / s * (1 - BESTSELLER_SHARE) for w in tail]

    # --- facts --------------------------------------------------------------------------------
    @cache
    def day(self, d: date) -> dict[str, list[dict]]:
        """One day's orders, order items, payments and click events."""
        r = rng(self.seed, 'day', d.isoformat())
        customers, products = self.customers(), self.products()
        orders, items, payments, events = [], [], [], []
        start = datetime(d.year, d.month, d.day, tzinfo=timezone.utc)
        hours = [1, 1, 1, 1, 1, 2, 3, 5, 6, 7, 7, 8, 9, 8, 7, 7, 7, 8, 10, 12, 12, 10, 6, 3]
        when = lambda: start + timedelta(hours=r.choices(range(24), hours)[0], seconds=r.randrange(3600))
        product_ids = range(1, self.n_products + 1)
        # The shop's sequence hands out ids in time order, so an export sorted by id is sorted by time.
        stamps = sorted(when() for _ in range(self.orders_on(d)))
        for k, ts in enumerate(stamps):
            oid = self.first_order_id(d) + k
            c = customers[r.choices(range(self.n_customers), self._customer_weights())[0]]
            lines = []
            for line in range(1, r.choices([1, 2, 3, 4], [50, 30, 15, 5])[0] + 1):
                pid = r.choices(product_ids, self._product_weights())[0]
                lines.append({'order_id': oid, 'line': line, 'product_id': pid, 'qty': r.choices([1, 2, 3], [80, 15, 5])[0],
                              'unit_price': self.price_on(pid, d)})
            total = sum((l['qty'] * l['unit_price'] for l in lines), Decimal(0))
            status = r.choices(['paid', 'placed', 'cancelled'], [90, 7, 3])[0]
            orders.append({'order_id': oid, 'order_ts': ts, 'customer_id': c['customer_id'], 'country': c['country'],
                           'status': status, 'total': total})
            items += lines
            if status != 'cancelled' and r.random() >= UNPAID_RATE:
                currency = CURRENCY.get(c['country'], 'EUR')
                amount = (total * FX[currency]).quantize(CENT) if currency in FX else total
                pay = {'payment_id': f'pay_{r.getrandbits(48):012x}', 'order_id': oid,
                       'paid_ts': ts + timedelta(seconds=r.randrange(5, 600)), 'currency': currency, 'amount': amount,
                       'method': r.choice(['card', 'card', 'card', 'paypal', 'klarna'])}
                payments.append(pay)
                if r.random() < DOUBLE_PAID_RATE:
                    payments.append({**pay, 'payment_id': f'pay_{r.getrandbits(48):012x}',
                                     'paid_ts': pay['paid_ts'] + timedelta(seconds=r.randrange(1, 30))})
            events += self._session(r, ts, c['customer_id'], lines, buys=True)
        for _ in range(self.orders_on(d) * BROWSE_SESSIONS_PER_ORDER):
            uid = r.choice([None, r.randrange(1, self.n_customers + 1)])
            pids = [r.choices(product_ids, self._product_weights())[0] for _ in range(r.randrange(1, 4))]
            events += self._session(r, when(), uid, [{'product_id': p, 'qty': 1, 'unit_price': self.price_on(p, d)} for p in pids],
                                    buys=False)
        n_bot = round(len(events) * BOT_SHARE / (1 - BOT_SHARE))
        for _ in range(n_bot):
            events.append(self._event(r, when(), None, 'page_view', [], device='desktop', browser=None, anon=BOT_ID))
        events.sort(key=lambda e: e['event_ts'])
        return {'orders': orders, 'order_items': items, 'payments': payments, 'events': events}

    def _session(self, r: random.Random, ts: datetime, uid: int | None, lines: list[dict], buys: bool) -> list[dict]:
        device, browser = r.choices(DEVICES, [60, 33, 7])[0], r.choice(BROWSERS)
        anon = None if uid else f'anon-{r.getrandbits(40):010x}'
        campaign = r.choice([None, None, None, 'spring-sale', 'newsletter', 'black-friday', 'retarget'])
        if campaign and not active(campaign, ts.date()):  # one draw either way: other streams unchanged
            campaign = None
        t = ts - timedelta(minutes=r.randrange(3, 25)) if buys else ts
        out = [self._event(r, t, uid, 'page_view', [], device, browser, anon, campaign)]
        for l in lines:
            t += timedelta(seconds=r.randrange(10, 180))
            out.append(self._event(r, t, uid, 'product_view', [l], device, browser, anon, campaign))
            if buys or r.random() < 0.3:
                t += timedelta(seconds=r.randrange(5, 60))
                out.append(self._event(r, t, uid, 'add_to_cart', [l], device, browser, anon, campaign))
        if buys:
            out.append(self._event(r, ts - timedelta(seconds=r.randrange(20, 120)), uid, 'checkout', lines, device, browser, anon, campaign))
            out.append(self._event(r, ts, uid, 'purchase', lines, device, browser, anon, campaign))
        return out

    def _event(self, r, ts, uid, kind, lines, device, browser, anon, campaign=None) -> dict:
        return {'event_id': str(uuid.UUID(int=r.getrandbits(128), version=4)), 'event_ts': ts, 'event_type': kind,
                'user_id': uid, 'anon_id': anon, 'device': device, 'browser': browser,
                'user_agent': AGENT[browser] if browser else BOT_AGENT, 'campaign': campaign,
                'items': [{'product_id': l['product_id'], 'qty': l['qty'], 'price': l['unit_price']} for l in lines]}

    def events_arriving(self, d: date) -> list[tuple[datetime, dict]]:
        """(arrival time, event) for every event that LANDS on day d: duplicates sent twice, late
        events from up to LATE_MAX earlier, and this day's on-time events."""
        out = []
        for back in range(LATE_MAX.days + 1):
            src = d - timedelta(days=back)
            if src < FIRST:
                continue
            r = rng(self.seed, 'arrival', src.isoformat())
            for e in self.day(src)['events']:
                late = r.random() < LATE_RATE
                delay = timedelta(seconds=r.randrange(60, int(LATE_MAX.total_seconds()))) if late else timedelta(seconds=r.randrange(0, 5))
                dup = r.random() < DUPLICATE_RATE
                for copy in range(2 if dup else 1):
                    arrived = e['event_ts'] + delay + timedelta(seconds=copy * r.randrange(1, 90))
                    if arrived.date() == d:
                        out.append((arrived, e))
        out.sort(key=lambda a: (a[0], a[1]['event_id']))
        return out

    @cache
    def returns_in(self, year: int, month: int) -> list[dict]:
        r = rng(self.seed, 'returns', year, month)
        out = []
        for d in days(date(year, month, 1), min(LAST, (date(year, month, 28) + timedelta(days=4)).replace(day=1) - timedelta(days=1))):
            for o in self.day(d)['orders']:
                if o['status'] == 'paid' and r.random() < 0.04:
                    item = r.choice([i for i in self.day(d)['order_items'] if i['order_id'] == o['order_id']])
                    out.append({'return_id': f'R{o["order_id"]:08d}', 'order_id': o['order_id'], 'product_id': item['product_id'],
                                'reason': r.choice(RETURN_REASONS), 'returned_on': (d + timedelta(days=r.randrange(3, 20))).isoformat()})
        return out

    @cache
    def fx_rates(self) -> list[dict]:
        r = rng(self.seed, 'fx')
        out, rate = [], dict(FX)
        for d in days():
            for cur in sorted(rate):
                rate[cur] = (rate[cur] * Decimal(str(1 + r.uniform(-0.004, 0.004)))).quantize(Decimal('0.0001'))
                out.append({'date': d.isoformat(), 'currency': cur, 'per_eur': rate[cur]})
        return out


def active(campaign: str, d: date) -> bool:
    c = next(c for c in CAMPAIGNS if c['campaign_id'] == campaign)
    return c['start'] <= d.isoformat() <= c['end']


CAMPAIGNS = [
    {'campaign_id': 'spring-sale', 'channel': 'email', 'start': '2026-03-15', 'end': '2026-04-15'},
    {'campaign_id': 'newsletter', 'channel': 'email', 'start': '2026-01-01', 'end': '2026-12-31'},
    {'campaign_id': 'black-friday', 'channel': 'paid_social', 'start': '2026-11-20', 'end': '2026-11-30'},
    {'campaign_id': 'retarget', 'channel': 'display', 'start': '2026-01-01', 'end': '2026-12-31'},
]
