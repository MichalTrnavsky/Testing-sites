"""Analytika dopytu.

Myšlienka: vysoký dopyt v segmente = veľa nových inzerátov + krátka
životnosť (inzerent inzerát rýchlo zmaže, typicky lebo predal).

Pre každú kategóriu zoskupíme inzeráty podľa kľúčových slov v nadpise
(unigramy + bigramy) a spočítame:
  - ``new_count``    : koľko NOVÝCH inzerátov s daným slovom pribudlo v okne,
  - ``deleted_count``: koľko z nich bolo medzitým zmazaných,
  - ``median_lifespan_days`` : medián životnosti zmazaných,
  - ``demand_score`` : skóre dopytu (viac = vyšší dopyt).

Skóre: normalizovaný objem / (medián životnosti + 1). Krátka životnosť a
vysoký objem ženú skóre hore; segmenty s dlho visiacimi inzerátmi padajú.
"""

from __future__ import annotations

import csv
import re
import unicodedata
from collections import defaultdict
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from statistics import median

from .categories import ALL_CATEGORIES

# Slovenské + časté "prázdne" slová, ktoré nechceme ako kľúč.
STOPWORDS = {
    "a", "aj", "ako", "alebo", "ale", "na", "do", "za", "so", "zo", "od",
    "pre", "po", "pri", "cez", "bez", "the", "and", "s", "v", "z", "k", "o",
    "je", "su", "sa", "si", "to", "ten", "ta", "toto", "tato", "novy", "nova",
    "nove", "predam", "predaj", "kupim", "darujem", "hladam", "top", "ks",
    "cena", "dohodou", "novy", "povodna", "zn", "eur", "euro", "vymena",
    "super", "velmi", "viac", "info", "kus", "kusov", "set", "original",
}


def strip_diacritics(text: str) -> str:
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


TOKEN_RE = re.compile(r"[a-z0-9]+")


def normalize_tokens(title: str) -> list[str]:
    low = strip_diacritics(title.lower())
    toks = TOKEN_RE.findall(low)
    out = []
    for t in toks:
        if len(t) < 3:
            continue
        if t in STOPWORDS:
            continue
        if t.isdigit():
            continue
        out.append(t)
    return out


def keyphrases(title: str) -> list[str]:
    """Unigramy + susedné bigramy z nadpisu."""
    toks = normalize_tokens(title)
    phrases = list(toks)
    for i in range(len(toks) - 1):
        phrases.append(f"{toks[i]} {toks[i + 1]}")
    return phrases


@dataclass
class SegmentStat:
    category: str
    keyword: str
    new_count: int
    deleted_count: int
    median_lifespan_days: float | None
    demand_score: float


def _parse_iso(s: str | None) -> datetime | None:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s)
    except ValueError:
        return None


def analyze(
    store,
    category: str | None,
    window_days: int,
    min_new: int,
    top: int,
) -> list[SegmentStat]:
    """Spočíta štatistiky segmentov naprieč (alebo v rámci) kategórií."""
    now = datetime.utcnow()
    since = now - timedelta(days=window_days)

    # agregácia podľa (kategória, kľúčové slovo)
    new_counts: dict[tuple[str, str], int] = defaultdict(int)
    del_counts: dict[tuple[str, str], int] = defaultdict(int)
    lifespans: dict[tuple[str, str], list[float]] = defaultdict(list)

    rows = store.iter_ads(category)
    for r in rows:
        first_seen = _parse_iso(r["first_seen"])
        if first_seen is None or first_seen < since:
            continue  # mimo okna
        cat = r["category"]
        phrases = set(keyphrases(r["title"]))
        is_deleted = r["status"] == "deleted"
        deleted_at = _parse_iso(r["deleted_at"])
        life_days = None
        if is_deleted and deleted_at is not None:
            life_days = (deleted_at - first_seen).total_seconds() / 86400.0

        for kw in phrases:
            key = (cat, kw)
            new_counts[key] += 1
            if is_deleted:
                del_counts[key] += 1
                if life_days is not None:
                    lifespans[key].append(life_days)

    # max objem na normalizáciu skóre (per kategória by bolo presnejšie, ale
    # pre jednoduchosť globálny max v rámci vybraného rozsahu)
    max_new = max(new_counts.values(), default=1)

    stats: list[SegmentStat] = []
    for key, n_new in new_counts.items():
        if n_new < min_new:
            continue
        cat, kw = key
        med = median(lifespans[key]) if lifespans[key] else None
        # skóre: objem (0..1) delené (medián životnosti + 1 deň)
        volume_norm = n_new / max_new
        if med is None:
            # zatiaľ žiadne zmazanie => dopyt zatiaľ nepotvrdený, tlmíme
            score = volume_norm * 0.1
        else:
            score = volume_norm / (med + 1.0)
        stats.append(
            SegmentStat(
                category=cat,
                keyword=kw,
                new_count=n_new,
                deleted_count=del_counts[key],
                median_lifespan_days=round(med, 2) if med is not None else None,
                demand_score=round(score * 100, 2),
            )
        )

    stats.sort(key=lambda s: s.demand_score, reverse=True)
    return stats[:top]


def format_report(stats: list[SegmentStat], window_days: int) -> str:
    if not stats:
        return "Zatiaľ nie sú dáta (spusti crawl viackrát počas viacerých dní)."
    lines = [
        f"TOP dopyt segmenty za posledných {window_days} dní",
        "=" * 64,
        f"{'kategória':<12}{'segment (kľúč)':<26}{'nové':>5}{'zmaz.':>6}{'život.dní':>10}{'skóre':>8}",
        "-" * 67,
    ]
    for s in stats:
        cat_label = ALL_CATEGORIES[s.category].label if s.category in ALL_CATEGORIES else s.category
        life = "-" if s.median_lifespan_days is None else f"{s.median_lifespan_days:.1f}"
        lines.append(
            f"{cat_label:<12}{s.keyword[:24]:<26}{s.new_count:>5}{s.deleted_count:>6}{life:>10}{s.demand_score:>8.1f}"
        )
    lines.append("")
    lines.append(
        "Čítanie: vysoké 'nové' + nízka 'život.dní' = silný dopyt "
        "(inzeráty rýchlo miznú = predávajú sa)."
    )
    return "\n".join(lines)


def write_csv(stats: list[SegmentStat], path: str) -> None:
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(asdict(stats[0]).keys()) if stats else
                           ["category", "keyword", "new_count", "deleted_count",
                            "median_lifespan_days", "demand_score"])
        w.writeheader()
        for s in stats:
            w.writerow(asdict(s))
