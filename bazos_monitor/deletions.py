"""Sweep: overí kandidátov, ktorí zmizli z listingu, a označí zmazané.

Prečo overovať detail a nie len 'zmizol z listingu':
inzerát môže z prvých stránok listingu vypadnúť len preto, že ho vytlačili
novšie inzeráty (nie preto, že bol zmazaný). Preto pri kandidátoch
(missing_runs >= prah) načítame detail a rozhodneme podľa neho.
"""

from __future__ import annotations

from datetime import datetime

from .config import Config
from .fetch import Fetcher
from .parse import is_detail_deleted


def sweep_deletions(config: Config, store, log=print) -> dict:
    fetcher = Fetcher(config)
    started = datetime.utcnow().isoformat()

    candidates = store.candidates_for_deletion_check(
        threshold=config.missing_runs_before_check,
        limit=config.max_deletion_checks_per_run,
    )
    deleted = 0
    still_live = 0

    for row in candidates:
        url = row["url"]
        res = fetcher.get(url)
        if is_detail_deleted(res.status, res.text):
            store.mark_deleted(row["ad_id"], datetime.utcnow().isoformat())
            deleted += 1
        elif res.ok:
            # inzerát stále žije – len vypadol z prvých stránok; reset
            store.reset_missing(row["ad_id"])
            still_live += 1
        # ak request zlyhal (dočasná chyba), nechávame stav tak – skúsime nabudúce
        store.conn.commit()

    store.log_run(
        kind="sweep",
        categories="",
        new_ads=0,
        seen_ads=len(candidates),
        deleted_ads=deleted,
        started_at_iso=started,
    )
    log(f"[sweep] kandidáti={len(candidates)} zmazané={deleted} žijú={still_live}")
    return {"checked": len(candidates), "deleted": deleted, "alive": still_live}
