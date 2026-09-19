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
from dataclasses import dataclass, asdict, field
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
    # stav tovaru – nechceme ako "segment", segment má byť PRODUKT
    "pouzity", "pouzita", "pouzite", "pouzivany", "pouzivana", "pouzivane",
    "nepouzity", "nepouzite", "opotrebovany", "opotrebovane", "zachovaly",
    "zachovala", "funkcny", "funkcna", "bazar", "servis", "novucky", "novucka",
    "nerozbaleny", "zabaleny", "starsi", "poskodeny", "poskodena",
    # generický šum / skratky / fragmenty (nie sú to produkty)
    "rok", "roku", "rokov", "pro", "size", "stav", "priam", "priamo",
    "dovoz", "cela", "cely", "cele", "spz", "cln", "kompletny", "komplet",
    "lacno", "akcia", "zlava", "dohoda", "moznost", "kvalitny", "kvalita",
    "znacka", "znackovy", "krasny", "krasna", "male", "velke", "velky", "vela",
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


def keyphrases(title: str, max_n: int = 2) -> list[str]:
    """N-gramy z nadpisu: unigramy + bigramy (default), voliteľne trigramy.

    ``max_n=3`` pridá aj trojslovné frázy – užitočné pri drill-downe na
    konkrétny model (napr. „cybex priam kombinacia")."""
    toks = normalize_tokens(title)
    phrases = list(toks)
    if max_n >= 2:
        for i in range(len(toks) - 1):
            phrases.append(f"{toks[i]} {toks[i + 1]}")
    if max_n >= 3:
        for i in range(len(toks) - 2):
            phrases.append(f"{toks[i]} {toks[i + 1]} {toks[i + 2]}")
    return phrases


# Markery stavu tovaru. Porovnávame po SLOVÁCH (nie substringom), aby
# napr. "ratanový" (obsahuje "novy") nespustilo falošne "nový".
_NEW_TOKENS = {"novy", "nove", "nova", "novej", "noveho", "novucky", "novy"}
_NEW_PREFIXES = ("nepouzit", "nerozbalen", "zabalen", "nerozbaleny")
_NEW_PHRASES = ("original balenie", "v krabici", "z krabice", "v originalnom")
# "nová cena" / "nový rok" = nie stav tovaru -> vylúčime pred tokenizáciou
_NEW_FALSE = ("nova cena", "novej cene", "novy rok", "novy model roku", "ako novy")
_USED_PREFIXES = ("pouzit", "pouzivan", "opotrebovan", "znoseny", "znosene",
                  "poskoden", "starsi")
_USED_TOKENS = {"bazar", "servis"}
_USED_PHRASES = ("zo starsej", "ako tak")

_WORD_RE = re.compile(r"[a-z]+")


def condition_of(title: str) -> str:
    """Odhadne stav tovaru z nadpisu: 'new' | 'used' | 'unknown'."""
    low = strip_diacritics((title or "").lower())
    for fp in _NEW_FALSE:
        low = low.replace(fp, " ")
    tokens = _WORD_RE.findall(low)

    is_new = (
        any(t in _NEW_TOKENS for t in tokens)
        or any(t.startswith(_NEW_PREFIXES) for t in tokens)
        or any(p in low for p in _NEW_PHRASES)
    )
    is_used = (
        any(t in _USED_TOKENS for t in tokens)
        or any(t.startswith(_USED_PREFIXES) for t in tokens)
        or any(p in low for p in _USED_PHRASES)
    )
    if is_new and not is_used:
        return "new"
    if is_used and not is_new:
        return "used"
    if is_new and is_used:
        # obsahuje oboje (napr. "nový aj použitý") -> radšej neurčené
        return "unknown"
    return "unknown"


@dataclass
class SegmentStat:
    category: str
    subcat: str
    keyword: str
    new_count: int
    deleted_count: int
    median_lifespan_days: float | None
    demand_score: float


@dataclass
class ArbitrageStat:
    category: str
    subcat: str
    keyword: str
    volume: int                     # počet inzerátov v segmente (v okne)
    deleted_count: int
    median_lifespan_days: float | None
    used_median_eur: float | None   # medián ceny použitých/neurčených
    new_median_eur: float | None    # medián ceny NOVÝCH ponúk (konkurencia)
    cheap_new_competitors: int      # počet lacných nových (už to niekto robí)
    price_gap_eur: float | None     # new_median - used_median
    arbitrage_score: float


def _parse_iso(s: str | None) -> datetime | None:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s)
    except ValueError:
        return None


def _ad_age_days(row, now: datetime) -> float | None:
    """Vek inzerátu v dňoch – primárne z dátumu pridania na inzeráte
    (posted_date), inak z nášho prvého videnia (first_seen)."""
    pd = _parse_iso(row["posted_date"])
    if pd is not None:
        return (now.date() - pd.date()).days
    fs = _parse_iso(row["first_seen"])
    if fs is not None:
        return (now - fs).total_seconds() / 86400.0
    return None


def _subcat(row) -> str:
    """Názov podkategórie inzerátu; ak chýba, '(nezaradené)'."""
    try:
        v = row["subcat"]
    except (KeyError, IndexError):
        v = None
    return v if v else "(nezaradené)"


def _too_old(row, now: datetime, max_age_days: float | None) -> bool:
    """True ak je inzerát starší než strop čerstvosti (irelevantná ležiačka)."""
    if not max_age_days:
        return False
    age = _ad_age_days(row, now)
    return age is not None and age > max_age_days


def analyze(
    store,
    category: str | None,
    window_days: int,
    min_new: int,
    top: int,
    max_age_days: float | None = None,
) -> list[SegmentStat]:
    """Spočíta štatistiky segmentov naprieč (alebo v rámci) kategórií."""
    now = datetime.utcnow()
    since = now - timedelta(days=window_days)

    # agregácia podľa (kategória, podkategória, kľúčové slovo)
    new_counts: dict[tuple[str, str, str], int] = defaultdict(int)
    del_counts: dict[tuple[str, str, str], int] = defaultdict(int)
    lifespans: dict[tuple[str, str, str], list[float]] = defaultdict(list)

    rows = store.iter_ads(category)
    for r in rows:
        first_seen = _parse_iso(r["first_seen"])
        if first_seen is None or first_seen < since:
            continue  # mimo okna
        if _too_old(r, now, max_age_days):
            continue  # stará ležiačka -> irelevantná pre dopyt
        cat = r["category"]
        sub = _subcat(r)
        phrases = set(keyphrases(r["title"]))
        is_deleted = r["status"] == "deleted"
        deleted_at = _parse_iso(r["deleted_at"])
        life_days = None
        if is_deleted and deleted_at is not None:
            life_days = (deleted_at - first_seen).total_seconds() / 86400.0

        for kw in phrases:
            key = (cat, sub, kw)
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
        cat, sub, kw = key
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
                subcat=sub,
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
        f"{'kategória':<13}{'segment (kľúč)':<26}{'nové':>5}{'zmaz.':>6}{'život.dní':>10}{'skóre':>8}",
        "-" * 68,
    ]
    for s in stats:
        cat_label = ALL_CATEGORIES[s.category].label if s.category in ALL_CATEGORIES else s.category
        life = "-" if s.median_lifespan_days is None else f"{s.median_lifespan_days:.1f}"
        lines.append(
            f"{cat_label[:12]:<13}{s.keyword[:24]:<26}{s.new_count:>5}{s.deleted_count:>6}{life:>10}{s.demand_score:>8.1f}"
        )
    lines.append("")
    lines.append(
        "Čítanie: vysoké 'nové' + nízka 'život.dní' = silný dopyt "
        "(inzeráty rýchlo miznú = predávajú sa)."
    )
    return "\n".join(lines)


def write_csv(stats, path: str) -> None:
    """Zapíše ľubovoľný zoznam dataclass štatistík do CSV."""
    if not stats:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write("")
        return
    fields = list(asdict(stats[0]).keys())
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        for s in stats:
            w.writerow(asdict(s))


# ----------------------------------------------------------------------
# Arbitrážna analýza: kde sa oplatí doviezť NOVÝ tovar (napr. z Číny) a
# predať za cenu použitého / pod cenu miestneho nového.
# ----------------------------------------------------------------------

def analyze_arbitrage(
    store,
    category: str | None,
    window_days: int,
    min_volume: int,
    min_used_price: float,
    top: int,
    max_used_price: float | None = None,
    max_age_days: float | None = None,
) -> list[ArbitrageStat]:
    """Nájde segmenty s vysokým dopytom A vysokou cenou použitého tovaru.

    Skóre = dopyt (objem/životnosť) × hodnota (cena použitého) ÷ konkurencia
    (počet lacných nových ponúk). Vysoký dopyt + drahé použité + málo
    lacných nových = najlepší kandidát na dovoz nového tovaru.

    ``max_used_price`` orezáva segmenty, kde je použité drahšie než rozumný
    strop na dovoz (napr. traktory za 14000 € nie sú „dovoz z Číny").
    """
    now = datetime.utcnow()
    since = now - timedelta(days=window_days)

    volume: dict[tuple[str, str, str], int] = defaultdict(int)
    deleted: dict[tuple[str, str, str], int] = defaultdict(int)
    lifespans: dict[tuple[str, str, str], list[float]] = defaultdict(list)
    used_prices: dict[tuple[str, str, str], list[int]] = defaultdict(list)
    new_prices: dict[tuple[str, str, str], list[int]] = defaultdict(list)

    for r in store.iter_ads(category):
        first_seen = _parse_iso(r["first_seen"])
        if first_seen is None or first_seen < since:
            continue
        if _too_old(r, now, max_age_days):
            continue  # stará ležiačka -> nie je to živý dopyt
        cat = r["category"]
        sub = _subcat(r)
        price = r["price_eur"]
        cond = condition_of(r["title"])
        is_deleted = r["status"] == "deleted"
        deleted_at = _parse_iso(r["deleted_at"])
        life = None
        if is_deleted and deleted_at is not None:
            life = (deleted_at - first_seen).total_seconds() / 86400.0

        for kw in set(keyphrases(r["title"])):
            key = (cat, sub, kw)
            volume[key] += 1
            if is_deleted:
                deleted[key] += 1
                if life is not None:
                    lifespans[key].append(life)
            if price is not None and price > 0:
                if cond == "new":
                    new_prices[key].append(price)
                else:  # used + unknown = "trhová" cena (väčšinou použité)
                    used_prices[key].append(price)

    max_vol = max(volume.values(), default=1)
    stats: list[ArbitrageStat] = []
    for key, vol in volume.items():
        if vol < min_volume:
            continue
        cat, sub, kw = key
        used_med = median(used_prices[key]) if used_prices[key] else None
        if used_med is None or used_med < min_used_price:
            continue  # bez ceny alebo lacné => nezaujímavé na dovoz
        if max_used_price is not None and used_med > max_used_price:
            continue  # nad rozumný strop na dovoz (napr. stroje/traktory)
        new_med = median(new_prices[key]) if new_prices[key] else None
        life_list = lifespans[key]
        life_med = median(life_list) if life_list else None

        # dopyt: objem (0..1) / (medián životnosti + 1); bez zmazaní tlmíme
        vol_norm = vol / max_vol
        demand = vol_norm * 0.1 if life_med is None else vol_norm / (life_med + 1.0)

        # konkurencia: koľko NOVÝCH ponúk je lacných (<= 1.2× cena použitého)
        cheap_new = sum(1 for p in new_prices[key] if p <= used_med * 1.2)

        # skóre: dopyt × hodnota(€) ÷ (1 + lacná konkurencia)
        score = demand * (used_med / 100.0) / (1.0 + cheap_new)

        gap = (new_med - used_med) if new_med is not None else None
        stats.append(
            ArbitrageStat(
                category=cat,
                subcat=sub,
                keyword=kw,
                volume=vol,
                deleted_count=deleted[key],
                median_lifespan_days=round(life_med, 2) if life_med is not None else None,
                used_median_eur=round(used_med, 1),
                new_median_eur=round(new_med, 1) if new_med is not None else None,
                cheap_new_competitors=cheap_new,
                price_gap_eur=round(gap, 1) if gap is not None else None,
                arbitrage_score=round(score * 100, 2),
            )
        )

    stats.sort(key=lambda s: s.arbitrage_score, reverse=True)
    return stats[:top]


def format_arbitrage(stats: list[ArbitrageStat], window_days: int) -> str:
    if not stats:
        return ("Zatiaľ nie sú dáta / žiadny segment nespĺňa prah ceny. "
                "Spusti crawl+sweep viackrát počas viacerých dní.")
    lines = [
        f"TOP arbitrážne segmenty za posledných {window_days} dní",
        "(dovoz nového tovaru → predaj za cenu použitého / pod miestne nové)",
        "=" * 78,
        f"{'kategória':<13}{'segment':<22}{'ks':>4}{'život':>7}"
        f"{'použité€':>10}{'nové€':>8}{'lacná konk.':>12}{'skóre':>8}",
        "-" * 84,
    ]
    for s in stats:
        cat_label = ALL_CATEGORIES[s.category].label if s.category in ALL_CATEGORIES else s.category
        life = "-" if s.median_lifespan_days is None else f"{s.median_lifespan_days:.1f}"
        newp = "-" if s.new_median_eur is None else f"{s.new_median_eur:.0f}"
        lines.append(
            f"{cat_label[:12]:<13}{s.keyword[:20]:<22}{s.volume:>4}{life:>7}"
            f"{s.used_median_eur:>10.0f}{newp:>8}{s.cheap_new_competitors:>12}{s.arbitrage_score:>8.1f}"
        )
    lines += [
        "",
        "Čítanie: vysoké 'ks' + krátky 'život' + vysoké 'použité€' + nízka",
        "'lacná konk.' = najlepší kandidát na dovoz. Overiť veľkoobchodnú cenu",
        "z Číny (Alibaba/1688) – ak dovoz + doprava < cena použitého, ideš do toho.",
        "'lacná konk.' = počet nových ponúk už predávaných blízko ceny použitého",
        "(vysoké číslo = niekto to už robí, marža bude tenšia).",
    ]
    return "\n".join(lines)


# ----------------------------------------------------------------------
# Zhrnutie segmentu/kategórie: denné prírastky/úbytky, cenové rozpätie,
# top produkty. Odpovedá na otázku typu: "v kočíkoch pribudlo ~30/deň,
# ubudlo ~10/deň, cena ~500 €, top produkt cybex 3 kombinácia".
# ----------------------------------------------------------------------

@dataclass
class SegmentSummary:
    category: str
    subcategory: str | None   # None = celá kategória
    keyword: str | None       # None = celá (pod)kategória
    window_days: int
    new_total: int
    new_per_day: float
    deleted_total: int
    deleted_per_day: float
    median_lifespan_days: float | None
    price_min: int | None
    price_median: float | None
    price_max: int | None
    top_products: list[tuple[str, int]]  # (fráza, počet) – v ponuke (nové)
    rate_basis: str = "first_seen"  # "posted_date" = odhad z dátumov na inzerátoch
    top_products_sold: list[tuple[str, int]] = field(default_factory=list)  # predané typy


def _pct(prices: list[int]):
    if not prices:
        return (None, None, None)
    s = sorted(prices)
    return (s[0], round(median(s), 1), s[-1])


def subcats_with_data(store, category: str, window_days: int,
                      max_age_days: float | None = None) -> list[tuple[str, int]]:
    """Zoznam (podkategória, počet) s dátami v okne pre danú kategóriu."""
    now = datetime.utcnow()
    since = now - timedelta(days=window_days)
    counts: dict[str, int] = defaultdict(int)
    for r in store.iter_ads(category):
        fs = _parse_iso(r["first_seen"])
        if fs is None or fs < since:
            continue
        if _too_old(r, now, max_age_days):
            continue
        counts[_subcat(r)] += 1
    return sorted(counts.items(), key=lambda kv: kv[1], reverse=True)


def summarize(
    store,
    category: str,
    window_days: int,
    keyword: str | None = None,
    top_products: int = 10,
    max_age_days: float | None = None,
    subcategory: str | None = None,
) -> SegmentSummary:
    """Zhrnie kategóriu (voliteľne len podkategóriu ``subcategory`` a/alebo
    segment podľa ``keyword``): denné prírastky/úbytky, cena, top produkty."""
    now = datetime.utcnow()
    since = now - timedelta(days=window_days)
    kw_norm = keyword.lower().strip() if keyword else None

    new_total = 0
    deleted_total = 0
    lifespans: list[float] = []
    prices: list[int] = []
    phrase_counts: dict[str, int] = defaultdict(int)
    sold_phrase_counts: dict[str, int] = defaultdict(int)  # typy medzi predanými
    posted_days: list = []  # dátumy pridania (z inzerátov) v okne

    since_date = since.date()
    for r in store.iter_ads(category):
        title = r["title"] or ""
        if subcategory is not None and _subcat(r) != subcategory:
            continue
        if kw_norm:
            # match na normalizované tokeny (bez diakritiky)
            toks = set(normalize_tokens(title))
            if kw_norm not in toks and kw_norm not in strip_diacritics(title.lower()):
                continue
        if _too_old(r, now, max_age_days):
            continue  # stará ležiačka -> irelevantná

        first_seen = _parse_iso(r["first_seen"])
        deleted_at = _parse_iso(r["deleted_at"])

        counted_in_window = first_seen is not None and first_seen >= since
        if counted_in_window:
            new_total += 1
            if r["price_eur"] and r["price_eur"] > 0:
                prices.append(r["price_eur"])
            for ph in set(keyphrases(title, max_n=3)):
                if kw_norm and ph == kw_norm:
                    continue  # samotné hľadané slovo nechceme ako "produkt"
                phrase_counts[ph] += 1
            pd = _parse_iso(r["posted_date"])
            if pd is not None and pd.date() >= since_date:
                posted_days.append(pd.date())

        if r["status"] == "deleted" and deleted_at is not None and deleted_at >= since:
            deleted_total += 1
            if first_seen is not None:
                lifespans.append((deleted_at - first_seen).total_seconds() / 86400.0)
            for ph in set(keyphrases(title, max_n=3)):
                if kw_norm and ph == kw_norm:
                    continue
                sold_phrase_counts[ph] += 1

    days = max(window_days, 1)
    pmin, pmed, pmax = _pct(prices)
    top = sorted(phrase_counts.items(), key=lambda kv: kv[1], reverse=True)[:top_products]
    top_sold = sorted(sold_phrase_counts.items(), key=lambda kv: kv[1], reverse=True)[:top_products]

    # Denný prírastok:
    #  1) ak máme aspoň jeden CELÝ predošlý deň → priemer za tie dni (reálna
    #     denná rýchlosť, odolná voči ojedinelým starým dátumom),
    #  2) inak (1. deň zberu) → počet za DNEŠOK (čiastočný, spodná hranica),
    #  3) úplný fallback → objem/okno.
    from collections import Counter
    counts = Counter(posted_days)
    today = now.date()
    prior_days = [today - timedelta(days=i) for i in range(1, 8)]
    prior_vals = [counts[d] for d in prior_days if counts.get(d, 0) > 0]
    if prior_vals:
        new_per_day = round(sum(prior_vals) / len(prior_vals), 1)
        rate_basis = "posted_date"
    elif counts.get(today, 0) > 0:
        new_per_day = float(counts[today])
        rate_basis = "today"
    else:
        new_per_day = round(new_total / days, 1)
        rate_basis = "first_seen"

    return SegmentSummary(
        category=category,
        subcategory=subcategory,
        keyword=keyword,
        window_days=window_days,
        new_total=new_total,
        new_per_day=new_per_day,
        deleted_total=deleted_total,
        deleted_per_day=round(deleted_total / days, 1),
        median_lifespan_days=round(median(lifespans), 2) if lifespans else None,
        price_min=pmin,
        price_median=pmed,
        price_max=pmax,
        top_products=top,
        rate_basis=rate_basis,
        top_products_sold=top_sold,
    )


def format_summary(s: SegmentSummary) -> str:
    cat_label = ALL_CATEGORIES[s.category].label if s.category in ALL_CATEGORIES else s.category
    head = f"{cat_label}"
    if s.subcategory:
        head += f" › {s.subcategory}"
    if s.keyword:
        head += f' / „{s.keyword}“'
    life = "-" if s.median_lifespan_days is None else f"{s.median_lifespan_days:.1f} dňa"
    if s.price_median is None:
        price = "bez cien"
    else:
        price = (f"min {s.price_min} / medián {s.price_median:.0f} / max {s.price_max} € "
                 f"(rozptyl {s.price_max - s.price_min} €)")
    basis = {
        "posted_date": "z dátumov na inzerátoch",
        "today": "za dnešok, zatiaľ (treba viac dní)",
    }.get(s.rate_basis, "za sledované obdobie")
    lines = [
        f"Zhrnutie: {head}  —  posledných {s.window_days} dní",
        "=" * 60,
        f"  Nové inzeráty:    {s.new_total}  (≈ {s.new_per_day}/deň, {basis})",
        f"  Zmazané:          {s.deleted_total}  (≈ {s.deleted_per_day}/deň)",
        f"  Medián životnosti:{life:>8}",
        f"  Cena:             {price}",
        "  TOP produkty (podľa výskytu v nadpisoch):",
    ]
    if s.top_products:
        for i, (ph, cnt) in enumerate(s.top_products, 1):
            lines.append(f"    {i:>2}. {ph:<28} {cnt}×")
    else:
        lines.append("    (zatiaľ málo dát)")
    if s.top_products_sold:
        lines.append("  TOP predané typy (podľa zmazaní):")
        for i, (ph, cnt) in enumerate(s.top_products_sold, 1):
            lines.append(f"    {i:>2}. {ph:<28} {cnt}×")
    if s.deleted_total == 0:
        lines.append("")
        lines.append("  Pozn.: úbytky/životnosť sa naplnia po ďalších behoch (treba viac dní).")
    return "\n".join(lines)
