"""Crawl listingov vybraných kategórií a zápis do DB."""

from __future__ import annotations

from datetime import datetime

from .categories import Category, resolve_categories
from .config import Config
from .fetch import Fetcher
from .parse import parse_listing, next_page_url


def crawl(config: Config, store, log=print) -> dict:
    cats = resolve_categories(config.include_categories, config.exclude_categories)
    fetcher = Fetcher(config)
    started = datetime.utcnow().isoformat()

    total_new = 0
    total_seen = 0

    for cat in cats:
        if not fetcher.allowed(cat.subdomain, "/"):
            log(f"[skip] robots.txt zakazuje {cat.subdomain}")
            continue
        new_c, seen_c = _crawl_category(cat, config, fetcher, store, log)
        total_new += new_c
        total_seen += seen_c
        log(f"[{cat.key}] nové={new_c} videné={seen_c}")

    store.log_run(
        kind="crawl",
        categories=",".join(c.key for c in cats),
        new_ads=total_new,
        seen_ads=total_seen,
        deleted_ads=0,
        started_at_iso=started,
    )
    return {"new": total_new, "seen": total_seen, "categories": len(cats)}


def _crawl_category(cat: Category, config: Config, fetcher: Fetcher, store, log) -> tuple[int, int]:
    now_iso = datetime.utcnow().isoformat()
    seen_ids: set[str] = set()
    new_count = 0

    for page in range(config.max_pages_per_category):
        url = next_page_url(cat.subdomain, page, config.per_page)
        res = fetcher.get(url)
        if not res.ok:
            log(f"[{cat.key}] stránka {page} zlyhala: HTTP {res.status}")
            break

        ads = parse_listing(res.text, base_url=f"https://{cat.subdomain}/")
        if not ads:
            # žiadne inzeráty = pravdepodobne koniec / zmena štruktúry
            break

        with store.tx():
            for ad in ads:
                if ad.ad_id in seen_ids:
                    continue
                seen_ids.add(ad.ad_id)
                is_new = store.upsert_listing_ad(
                    ad_id=ad.ad_id,
                    category=cat.key,
                    title=ad.title,
                    url=ad.url,
                    price_eur=ad.price_eur,
                    posted_date=ad.posted_date.isoformat() if ad.posted_date else None,
                    now_iso=now_iso,
                )
                if is_new:
                    new_count += 1

    # inzeráty kategórie, ktoré sme teraz nevideli → +1 missing_run
    with store.tx():
        store.mark_missing_for_category(cat.key, seen_ids)

    return new_count, len(seen_ids)
