"""CLI vstupný bod.

Príkazy:
  crawl    – prejde listingy vybraných kategórií a zapíše/aktualizuje inzeráty
  sweep    – overí zmiznuté inzeráty a označí zmazané (výpočet životnosti)
  report   – vypíše TOP segmenty dopytu
  cats     – vypíše známe kategórie
"""

from __future__ import annotations

import argparse
import sys

from .analyze import (
    analyze,
    analyze_arbitrage,
    format_arbitrage,
    format_report,
    format_summary,
    summarize,
    subcats_with_data,
    write_csv,
)
from .categories import ALL_CATEGORIES, DEFAULT_EXCLUDED, resolve_categories
from .config import Config
from .crawl import crawl
from .deletions import sweep_deletions
from .store import Store


def _load(args) -> Config:
    cfg = Config.load(args.config)
    if getattr(args, "include", None):
        cfg.include_categories = args.include.split(",")
    if getattr(args, "exclude", None) is not None:
        cfg.exclude_categories = args.exclude.split(",") if args.exclude else []
    if getattr(args, "db", None):
        cfg.db_path = args.db
    if getattr(args, "max_pages", None):
        cfg.max_pages_per_category = args.max_pages
    return cfg


def cmd_crawl(args) -> int:
    cfg = _load(args)
    store = Store(cfg.db_path)
    try:
        res = crawl(cfg, store)
        print(f"Hotovo: {res['new']} nových / {res['seen']} videných "
              f"v {res['categories']} kategóriách.")
    finally:
        store.close()
    return 0


def cmd_sweep(args) -> int:
    cfg = _load(args)
    store = Store(cfg.db_path)
    try:
        res = sweep_deletions(cfg, store)
        print(f"Hotovo: overených {res['checked']}, zmazaných {res['deleted']}.")
    finally:
        store.close()
    return 0


def cmd_report(args) -> int:
    cfg = _load(args)
    store = Store(cfg.db_path)
    try:
        stats = analyze(
            store,
            category=args.category,
            window_days=args.window,
            min_new=args.min_new,
            top=args.top,
            max_age_days=(args.max_age if args.max_age and args.max_age > 0 else None),
        )
        print(format_report(stats, args.window))
        if args.csv:
            write_csv(stats, args.csv)
            print(f"\nCSV zapísané: {args.csv}")
    finally:
        store.close()
    return 0


def cmd_arbitrage(args) -> int:
    cfg = _load(args)
    store = Store(cfg.db_path)
    try:
        stats = analyze_arbitrage(
            store,
            category=args.category,
            window_days=args.window,
            min_volume=args.min_volume,
            min_used_price=args.min_price,
            max_used_price=(args.max_price if args.max_price and args.max_price > 0 else None),
            max_age_days=(args.max_age if args.max_age and args.max_age > 0 else None),
            top=args.top,
        )
        print(format_arbitrage(stats, args.window))
        if args.csv:
            write_csv(stats, args.csv)
            print(f"\nCSV zapísané: {args.csv}")
    finally:
        store.close()
    return 0


def cmd_zhrnutie(args) -> int:
    cfg = _load(args)
    store = Store(cfg.db_path)
    try:
        s = summarize(
            store,
            category=args.category,
            window_days=args.window,
            keyword=args.keyword,
            top_products=args.top,
            max_age_days=(args.max_age if args.max_age and args.max_age > 0 else None),
            subcategory=getattr(args, "subcat", None),
        )
        print(format_summary(s))
    finally:
        store.close()
    return 0


def cmd_export(args) -> int:
    """Vyexportuje všetky analýzy do jedného JSON pre HTML dashboard."""
    import json
    from dataclasses import asdict
    from datetime import datetime
    cfg = _load(args)
    store = Store(cfg.db_path)
    age = args.max_age if args.max_age and args.max_age > 0 else None
    try:
        cats = resolve_categories(cfg.include_categories, cfg.exclude_categories)
        demand = analyze(store, category=None, window_days=args.window,
                         min_new=1, top=3000, max_age_days=age)
        arb = analyze_arbitrage(store, category=None, window_days=args.window,
                                min_volume=2, min_used_price=1.0,
                                max_used_price=None, max_age_days=age, top=3000)
        # zhrnutia: celá kategória + každá podkategória s dátami
        summaries = []
        for c in cats:
            summaries.append(summarize(store, category=c.key, window_days=args.window,
                                       top_products=12, max_age_days=age))
            for sub, _cnt in subcats_with_data(store, c.key, args.window, age):
                if sub == "(nezaradené)":
                    continue
                summaries.append(summarize(store, category=c.key, window_days=args.window,
                                           top_products=12, max_age_days=age,
                                           subcategory=sub))
        data = {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "window_days": args.window,
            "max_age_days": age,
            "categories": [{"key": c.key, "label": c.label} for c in cats],
            "demand": [asdict(s) for s in demand],
            "arbitrage": [asdict(s) for s in arb],
            "summaries": [asdict(s) for s in summaries],
        }
        with open(args.out, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        print(f"JSON zapísané: {args.out} "
              f"(dopyt={len(demand)}, arbitráž={len(arb)}, kategórie={len(cats)})")
    finally:
        store.close()
    return 0


def cmd_prune(args) -> int:
    from datetime import datetime, timedelta
    cfg = _load(args)
    store = Store(cfg.db_path)
    try:
        cutoff = (datetime.utcnow() - timedelta(days=args.keep_days)).isoformat()
        n = store.prune_older_than(cutoff)
        from .parse import MAX_SANE_PRICE
        fixed = store.sanitize_prices(MAX_SANE_PRICE)
        print(f"Zmazaných {n} starých inzerátov; opravených {fixed} nezmyselných cien.")
    finally:
        store.close()
    return 0


def cmd_subcats(args) -> int:
    """Vypíše dostupné podkategórie (slug = názov) pre sledované kategórie."""
    from .categories import resolve_categories
    from .parse import parse_subcategories
    from .fetch import Fetcher
    cfg = _load(args)
    fetcher = Fetcher(cfg)
    cats = resolve_categories(cfg.include_categories, cfg.exclude_categories)
    for c in cats:
        res = fetcher.get(f"https://{c.subdomain}/")
        subs = parse_subcategories(res.text) if res.ok else []
        print(f"\n## {c.label} ({c.key})  — {len(subs)} podkategórií")
        for slug, name in subs:
            print(f"   {slug:<22} {name}")
    return 0


def cmd_debugsub(args) -> int:
    """Diagnostika: vypíše reálnu štruktúru <select>/<option> a category= odkazov
    z hlavnej stránky subdomény, aby sa dal presne opraviť parser podkategórií."""
    from bs4 import BeautifulSoup
    from .categories import ALL_CATEGORIES
    from .fetch import Fetcher
    cfg = _load(args)
    cat = ALL_CATEGORIES[args.category]
    res = Fetcher(cfg).get(f"https://{cat.subdomain}/")
    print(f"URL https://{cat.subdomain}/  HTTP {res.status} ok={res.ok} bytes={len(res.text)}")
    soup = BeautifulSoup(res.text, "lxml")
    print("=== SELECTY ===")
    for sel in soup.find_all("select"):
        opts = sel.find_all("option")
        print(f"- <select name={sel.get('name')!r} id={sel.get('id')!r}> opcií={len(opts)}")
        for o in opts[:12]:
            print(f"    value={o.get('value')!r} text={o.get_text(strip=True)!r}")
    import re as _re
    txt = res.text
    print("=== NÁZVY podkat. v surovom HTML ===")
    for probe in ("Kočíky", "Kocíky", "Baby monitory", "Autosedačky", "Autosedacky"):
        print(f"    {probe!r} -> {probe in txt}")
    print("=== <script src> ===")
    for sc in soup.find_all("script", src=True):
        print(f"    {sc['src']}")
    print("=== okolie prvého výskytu 'category' v HTML ===")
    i = txt.find("category")
    if i >= 0:
        print("    " + txt[max(0, i - 120):i + 400].replace("\n", " "))
    else:
        print("    (slovo 'category' sa v HTML nenachádza)")
    print("=== OKOLIE 'Kočíky' a 'Baby monitory' (surové HTML) ===")
    for probe in ("Kočíky", "Baby monitory"):
        j = txt.find(probe)
        if j >= 0:
            print(f"--- {probe} @ {j} ---")
            print(txt[max(0, j - 300):j + 200])
    return 0


def cmd_cats(args) -> int:
    cfg = _load(args)
    active = {c.key for c in resolve_categories(cfg.include_categories, cfg.exclude_categories)}
    print("Známe kategórie (✓ = sledované, ✗ = vylúčené):")
    for key, cat in ALL_CATEGORIES.items():
        mark = "✓" if key in active else "✗"
        print(f"  {mark} {key:<12} {cat.label:<16} {cat.subdomain}")
    print(f"\nDefault vylúčené: {', '.join(DEFAULT_EXCLUDED)}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="bazos-monitor",
        description="Sledovanie dopytu podľa obratu inzerátov na Bazoš.sk.",
    )
    p.add_argument("--config", help="cesta k YAML configu")
    p.add_argument("--db", help="cesta k SQLite DB (prepíše config)")
    p.add_argument("--include", help="čiarkou oddelené kategórie (napr. zahrada,dom)")
    p.add_argument("--exclude", help="čiarkou oddelené vylúčené kategórie")

    sub = p.add_subparsers(dest="command", required=True)

    pc = sub.add_parser("crawl", help="prejdi listingy a zapíš inzeráty")
    pc.add_argument("--max-pages", type=int, help="max stránok na kategóriu")
    pc.set_defaults(func=cmd_crawl)

    ps = sub.add_parser("sweep", help="over zmiznuté a označ zmazané")
    ps.set_defaults(func=cmd_sweep)

    pr = sub.add_parser("report", help="TOP segmenty dopytu")
    pr.add_argument("--category", help="obmedz na jednu kategóriu (napr. zahrada)")
    pr.add_argument("--window", type=int, default=30, help="okno v dňoch (default 30)")
    pr.add_argument("--min-new", type=int, default=3, help="min nových inzerátov na segment")
    pr.add_argument("--max-age", type=float, default=21.0,
                    help="ignoruj inzeráty staršie ako X dní (default 21; 0 = bez limitu)")
    pr.add_argument("--top", type=int, default=30, help="koľko riadkov vypísať")
    pr.add_argument("--csv", help="zapíš výsledok aj do CSV")
    pr.set_defaults(func=cmd_report)

    pa = sub.add_parser("arbitraz", help="TOP kandidáti na dovoz nového tovaru")
    pa.add_argument("--category", help="obmedz na jednu kategóriu")
    pa.add_argument("--window", type=int, default=30, help="okno v dňoch (default 30)")
    pa.add_argument("--min-volume", type=int, default=5, help="min inzerátov na segment")
    pa.add_argument("--min-price", type=float, default=100.0,
                    help="min medián ceny použitého v € (default 100)")
    pa.add_argument("--max-price", type=float, default=3000.0,
                    help="max medián ceny použitého v € (default 3000; 0 = bez stropu)")
    pa.add_argument("--max-age", type=float, default=21.0,
                    help="ignoruj inzeráty staršie ako X dní (default 21; 0 = bez limitu)")
    pa.add_argument("--top", type=int, default=30, help="koľko riadkov vypísať")
    pa.add_argument("--csv", help="zapíš výsledok aj do CSV")
    pa.set_defaults(func=cmd_arbitrage)

    pz = sub.add_parser("zhrnutie", help="denné prírastky/úbytky, cena, top produkty")
    pz.add_argument("--category", required=True, help="kategória (napr. deti)")
    pz.add_argument("--subcat", help="podkategória (napr. Kočíky)")
    pz.add_argument("--keyword", help="segment v kategórii (napr. kocik)")
    pz.add_argument("--window", type=int, default=30, help="okno v dňoch (default 30)")
    pz.add_argument("--max-age", type=float, default=21.0,
                    help="ignoruj inzeráty staršie ako X dní (default 21; 0 = bez limitu)")
    pz.add_argument("--top", type=int, default=10, help="koľko top produktov vypísať")
    pz.set_defaults(func=cmd_zhrnutie)

    pe = sub.add_parser("export", help="exportuj dáta do JSON pre HTML dashboard")
    pe.add_argument("--out", default="reports/data.json", help="cesta k výstupnému JSON")
    pe.add_argument("--window", type=int, default=30, help="okno v dňoch (default 30)")
    pe.add_argument("--max-age", type=float, default=21.0,
                    help="ignoruj inzeráty staršie ako X dní (default 21; 0 = bez limitu)")
    pe.set_defaults(func=cmd_export)

    pp = sub.add_parser("prune", help="zmaž staré inzeráty (retencia DB)")
    pp.add_argument("--keep-days", type=int, default=200,
                    help="koľko dní histórie ponechať (default 200)")
    pp.set_defaults(func=cmd_prune)

    psc = sub.add_parser("subcats", help="vypíš dostupné podkategórie (slug=názov)")
    psc.set_defaults(func=cmd_subcats)

    pd = sub.add_parser("debugsub", help="diagnostika štruktúry podkategórií")
    pd.add_argument("--category", default="deti")
    pd.set_defaults(func=cmd_debugsub)

    pcat = sub.add_parser("cats", help="vypíš známe kategórie")
    pcat.set_defaults(func=cmd_cats)

    return p


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv if argv is not None else sys.argv[1:])
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
