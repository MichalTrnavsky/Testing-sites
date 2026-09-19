"""Klasifikácia výsledku zmazaného inzerátu.

Zmazanie inzerátu != predaj. Preto každý zmazaný inzerát zaradíme do:
  - ``relisted`` : krátko okolo zmazania sa objaví takmer identický inzerát
                   (rovnaký odtlačok nadpisu + podobná cena) => predajca len
                   obnovil ponuku, tovar NEpredal,
  - ``expired``  : inzerát „dožil" blízko expiračného okna Bazoša (~60 dní) =>
                   skôr NEpredané, len mu vypršala platnosť,
  - ``sold``     : zmazané inak (typicky rýchlo) => pravdepodobne PREDANÉ.

Toto je heuristika nad tým, čo vieme z Bazoša pozorovať (nemáme reálnu
predajnú udalosť). Prahy sú v configu. „sold" preto ber ako *odhad predaja*,
nie istotu – ale je to výrazne bližšie k pravde než „každé zmazanie = predaj".
"""

from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime

from .analyze import normalize_tokens
from .config import Config


def title_fingerprint(title: str) -> tuple[str, int]:
    """Odtlačok nadpisu = zoradená množina zmysluplných slov (bez diakritiky).

    Vracia (odtlačok, počet_slov). Dva inzeráty s rovnakým odtlačkom a
    podobnou cenou považujeme za ten istý tovar."""
    toks = sorted(set(normalize_tokens(title or "")))
    return (" ".join(toks), len(toks))


def _parse(s: str | None) -> datetime | None:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s)
    except ValueError:
        return None


def _age_days_at(deleted_at: datetime, posted_date: str | None,
                 first_seen: datetime | None) -> float | None:
    """Vek inzerátu v momente zmazania – primárne z dátumu na inzeráte."""
    pd = _parse(posted_date)
    if pd is not None:
        return (deleted_at.date() - pd.date()).days
    if first_seen is not None:
        return (deleted_at - first_seen).total_seconds() / 86400.0
    return None


def classify_outcomes(config: Config, store, log=print) -> dict:
    """Označí každý zmazaný inzerát ako sold / relisted / expired.

    Prepočítava sa vždy nanovo (idempotentné) – re-inzeráty sa môžu objaviť
    až v neskoršom behu, takže klasifikáciu púšťame po každom crawle+sweepe."""
    rows = list(store.iter_ads(None))

    # index podľa odtlačku nadpisu -> zoznam inzerátov (na hľadanie re-inzerátov)
    by_fp: dict[str, list] = defaultdict(list)
    parsed = []
    for r in rows:
        fp, ntok = title_fingerprint(r["title"])
        item = {
            "ad_id": r["ad_id"], "fp": fp, "ntok": ntok,
            "price": r["price_eur"], "subcat": r["subcat"],
            "first_seen": _parse(r["first_seen"]),
            "deleted_at": _parse(r["deleted_at"]),
            "posted_date": r["posted_date"],
            "status": r["status"],
        }
        parsed.append(item)
        by_fp[fp].append(item)

    pt = config.repost_price_tolerance
    rwin = config.repost_window_days
    exp_lo = config.expiry_window_days - config.expiry_tolerance_days

    def is_repost_of(d) -> bool:
        if d["ntok"] < config.repost_min_tokens:
            return False  # priveľmi generický nadpis -> odtlačku neverme
        dd = d["deleted_at"]
        if dd is None:
            return False
        for cand in by_fp.get(d["fp"], ()):
            if cand["ad_id"] == d["ad_id"]:
                continue
            if cand["subcat"] != d["subcat"]:
                continue
            fs = cand["first_seen"]
            if fs is None:
                continue
            # kandidát sa objavil v okne okolo zmazania pôvodného
            if abs((fs - dd).total_seconds()) > rwin * 86400.0:
                continue
            # cena musí sedieť (alebo obe chýbajú)
            dp, cp = d["price"], cand["price"]
            if dp and cp:
                if abs(dp - cp) > pt * max(dp, cp):
                    continue
            elif (dp is None) != (cp is None):
                continue
            return True
        return False

    counts: Counter = Counter()
    updates = []
    for d in parsed:
        if d["status"] != "deleted" or d["deleted_at"] is None:
            continue
        if is_repost_of(d):
            outcome = "relisted"
        else:
            age = _age_days_at(d["deleted_at"], d["posted_date"], d["first_seen"])
            outcome = "expired" if (age is not None and age >= exp_lo) else "sold"
        updates.append((d["ad_id"], outcome))
        counts[outcome] += 1

    store.set_outcomes(updates)
    log(f"[classify] sold={counts['sold']} relisted={counts['relisted']} "
        f"expired={counts['expired']}")
    return dict(counts)
