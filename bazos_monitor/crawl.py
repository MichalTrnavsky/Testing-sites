"""Crawl listingov vybraných kategórií (a ich podkategórií) a zápis do DB."""

from __future__ import annotations

from datetime import datetime, timedelta

from .categories import Category, resolve_categories
from .config import Config
from .fetch import Fetcher
from .parse import (
    parse_listing,
    parse_subcategories,
    next_page_url,
    subcat_listing_url,
)


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
        if config.crawl_subcategories:
            new_c, seen_c = _crawl_with_subcategories(cat, config, fetcher, store, log)
        else:
            new_c, seen_c = _crawl_category(cat, config, fetcher, store, log)
        total_new += new_c
        total_seen += seen_c
        log(f"[{cat.key}] SPOLU nové={new_c} videné={seen_c}")

    store.log_run(
        kind="crawl",
        categories=",".join(c.key for c in cats),
        new_ads=total_new,
        seen_ads=total_seen,
        deleted_ads=0,
        started_at_iso=started,
    )
    return {"new": total_new, "seen": total_seen, "categories": len(cats)}


def _cutoff_date(config: Config):
    if not config.crawl_lookback_days:
        return None
    return (datetime.utcnow() - timedelta(days=config.crawl_lookback_days)).date()


def _crawl_with_subcategories(cat, config, fetcher, store, log) -> tuple[int, int]:
    """Objaví podkategórie z hlavnej stránky a prejde každú zvlášť."""
    main = fetcher.get(f"https://{cat.subdomain}/")
    subcats = parse_subcategories(main.text) if main.ok else []
    if not subcats:
        # fallback: podkategórie sa nenašli -> crawl hlavnej kategórie
        log(f"[{cat.key}] podkategórie nenájdené -> crawl hlavnej")
        return _crawl_category(cat, config, fetcher, store, log)

    log(f"[{cat.key}] podkategórií: {len(subcats)}")
    rubriky = cat.subdomain.split(".")[0]
    total_new = 0
    all_seen: set[str] = set()
    for cid, name in subcats:
        new_c, seen_ids = _crawl_subcategory(cat, rubriky, cid, name, config, fetcher, store, log)
        total_new += new_c
        all_seen |= seen_ids
    # missing_run pre celú kategóriu naraz (podľa všetkých videných v podkat.)
    with store.tx():
        store.mark_missing_for_category(cat.key, all_seen)
    return total_new, len(all_seen)


def _crawl_subcategory(cat, rubriky, cid, name, config, fetcher, store, log) -> tuple[int, set]:
    now_iso = datetime.utcnow().isoformat()
    cutoff = _cutoff_date(config)
    seen_ids: set[str] = set()
    new_count = 0
    max_pages = config.pages_per_category.get(cat.key, config.max_pages_per_category)

    for page in range(max_pages):
        url = subcat_listing_url(cat.subdomain, rubriky, cid, page, config.per_page)
        res = fetcher.get(url)
        if not res.ok:
            break
        ads = parse_listing(res.text, base_url=f"https://{cat.subdomain}/")
        if not ads:
            break
        posted = [a.posted_date for a in ads if a.posted_date is not None]
        past_horizon = bool(cutoff and posted and all(d < cutoff for d in posted))
        with store.tx():
            for ad in ads:
                if ad.ad_id in seen_ids:
                    continue
                seen_ids.add(ad.ad_id)
                is_new = store.upsert_listing_ad(
                    ad_id=ad.ad_id, category=cat.key, title=ad.title, url=ad.url,
                    price_eur=ad.price_eur,
                    posted_date=ad.posted_date.isoformat() if ad.posted_date else None,
                    now_iso=now_iso, subcat=name, subcat_id=cid,
                )
                if is_new:
                    new_count += 1
        if past_horizon:
            break
    log(f"[{cat.key}/{name}] nové={new_count} videné={len(seen_ids)}")
    return new_count, seen_ids


def _crawl_category(cat: Category, config: Config, fetcher: Fetcher, store, log) -> tuple[int, int]:
    now_iso = datetime.utcnow().isoformat()
    cutoff = _cutoff_date(config)
    seen_ids: set[str] = set()
    new_count = 0

    max_pages = config.pages_per_category.get(cat.key, config.max_pages_per_category)
    for page in range(max_pages):
        url = next_page_url(cat.subdomain, page, config.per_page)
        res = fetcher.get(url)
        if not res.ok:
            log(f"[{cat.key}] stránka {page} zlyhala: HTTP {res.status}")
            break

        ads = parse_listing(res.text, base_url=f"https://{cat.subdomain}/")
        if not ads:
            break

        posted = [a.posted_date for a in ads if a.posted_date is not None]
        past_horizon = bool(cutoff and posted and all(d < cutoff for d in posted))

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

        if past_horizon:
            break

    with store.tx():
        store.mark_missing_for_category(cat.key, seen_ids)

    return new_count, len(seen_ids)
