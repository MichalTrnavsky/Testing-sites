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
        )
        print(format_summary(s))
    finally:
        store.close()
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
    pa.add_argument("--top", type=int, default=30, help="koľko riadkov vypísať")
    pa.add_argument("--csv", help="zapíš výsledok aj do CSV")
    pa.set_defaults(func=cmd_arbitrage)

    pz = sub.add_parser("zhrnutie", help="denné prírastky/úbytky, cena, top produkty")
    pz.add_argument("--category", required=True, help="kategória (napr. deti)")
    pz.add_argument("--keyword", help="segment v kategórii (napr. kocik)")
    pz.add_argument("--window", type=int, default=30, help="okno v dňoch (default 30)")
    pz.add_argument("--top", type=int, default=10, help="koľko top produktov vypísať")
    pz.set_defaults(func=cmd_zhrnutie)

    pcat = sub.add_parser("cats", help="vypíš známe kategórie")
    pcat.set_defaults(func=cmd_cats)

    return p


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv if argv is not None else sys.argv[1:])
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
