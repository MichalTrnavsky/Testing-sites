"""SQLite úložisko: história inzerátov + odvodená životnosť.

Model:
- tabuľka ``ads`` drží jeden riadok na inzerát (podľa ad_id) so stavom
  ``active`` / ``deleted``, časom prvého a posledného videnia a časom
  detekovaného zmazania,
- ``first_seen`` / ``last_seen`` sú naše vlastné časy crawlu (spoľahlivejšie
  než dátum uvedený na inzeráte),
- životnosť (lifespan) = ``deleted_at - first_seen``.
"""

from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime
from typing import Iterator

SCHEMA = """
CREATE TABLE IF NOT EXISTS ads (
    ad_id         TEXT PRIMARY KEY,
    category      TEXT NOT NULL,
    title         TEXT NOT NULL,
    url           TEXT NOT NULL,
    price_eur     INTEGER,
    posted_date   TEXT,               -- dátum uvedený na inzeráte (YYYY-MM-DD)
    first_seen    TEXT NOT NULL,      -- ISO čas prvého videnia (náš crawl)
    last_seen     TEXT NOT NULL,      -- ISO čas posledného videnia v listingu
    status        TEXT NOT NULL DEFAULT 'active',  -- active | deleted
    deleted_at    TEXT,               -- ISO čas detekcie zmazania
    missing_runs  INTEGER NOT NULL DEFAULT 0       -- koľko behov po sebe chýbal
);
CREATE INDEX IF NOT EXISTS idx_ads_category ON ads(category);
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_first_seen ON ads(first_seen);

CREATE TABLE IF NOT EXISTS runs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at    TEXT NOT NULL,
    kind          TEXT NOT NULL,      -- crawl | sweep
    categories    TEXT,
    new_ads       INTEGER DEFAULT 0,
    seen_ads      INTEGER DEFAULT 0,
    deleted_ads   INTEGER DEFAULT 0
);
"""


@dataclass
class DeletedAd:
    ad_id: str
    category: str
    title: str
    url: str
    price_eur: int | None
    first_seen: datetime
    deleted_at: datetime

    @property
    def lifespan_days(self) -> float:
        return (self.deleted_at - self.first_seen).total_seconds() / 86400.0


class Store:
    def __init__(self, db_path: str):
        # SQLite nevytvorí súbor v neexistujúcom adresári -> vytvoríme ho
        parent = os.path.dirname(db_path)
        if parent:
            os.makedirs(parent, exist_ok=True)
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript(SCHEMA)
        self.conn.commit()

    def close(self) -> None:
        self.conn.close()

    @contextmanager
    def tx(self) -> Iterator[sqlite3.Connection]:
        try:
            yield self.conn
            self.conn.commit()
        except Exception:
            self.conn.rollback()
            raise

    # ---- upsert z listingu --------------------------------------------
    def upsert_listing_ad(
        self,
        *,
        ad_id: str,
        category: str,
        title: str,
        url: str,
        price_eur: int | None,
        posted_date: str | None,
        now_iso: str,
    ) -> bool:
        """Vloží nový alebo aktualizuje existujúci inzerát.

        Vracia True, ak išlo o NOVÝ inzerát (prvýkrát videný).
        """
        cur = self.conn.execute("SELECT ad_id FROM ads WHERE ad_id = ?", (ad_id,))
        exists = cur.fetchone() is not None
        if exists:
            self.conn.execute(
                """UPDATE ads
                   SET last_seen = ?, missing_runs = 0, status = 'active',
                       deleted_at = NULL, price_eur = COALESCE(?, price_eur)
                   WHERE ad_id = ?""",
                (now_iso, price_eur, ad_id),
            )
            return False
        self.conn.execute(
            """INSERT INTO ads
               (ad_id, category, title, url, price_eur, posted_date,
                first_seen, last_seen, status, missing_runs)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', 0)""",
            (ad_id, category, title, url, price_eur, posted_date, now_iso, now_iso),
        )
        return True

    # ---- detekcia zmazania --------------------------------------------
    def mark_missing_for_category(self, category: str, seen_ids: set[str]) -> None:
        """Aktívnym inzerátom kategórie, ktoré neboli v tomto behu videné,
        zvýši ``missing_runs`` o 1."""
        rows = self.conn.execute(
            "SELECT ad_id FROM ads WHERE category = ? AND status = 'active'",
            (category,),
        ).fetchall()
        missing = [r["ad_id"] for r in rows if r["ad_id"] not in seen_ids]
        self.conn.executemany(
            "UPDATE ads SET missing_runs = missing_runs + 1 WHERE ad_id = ?",
            [(i,) for i in missing],
        )

    def candidates_for_deletion_check(self, threshold: int, limit: int) -> list[sqlite3.Row]:
        return self.conn.execute(
            """SELECT * FROM ads
               WHERE status = 'active' AND missing_runs >= ?
               ORDER BY missing_runs DESC, last_seen ASC
               LIMIT ?""",
            (threshold, limit),
        ).fetchall()

    def mark_deleted(self, ad_id: str, deleted_at_iso: str) -> None:
        self.conn.execute(
            "UPDATE ads SET status = 'deleted', deleted_at = ? WHERE ad_id = ?",
            (deleted_at_iso, ad_id),
        )

    def reset_missing(self, ad_id: str) -> None:
        self.conn.execute(
            "UPDATE ads SET missing_runs = 0 WHERE ad_id = ?", (ad_id,)
        )

    # ---- čítanie pre analýzu ------------------------------------------
    def iter_ads(self, category: str | None = None):
        if category:
            return self.conn.execute(
                "SELECT * FROM ads WHERE category = ?", (category,)
            ).fetchall()
        return self.conn.execute("SELECT * FROM ads").fetchall()

    # ---- retencia (orezanie starých dát) ------------------------------
    def prune_older_than(self, cutoff_iso: str) -> int:
        """Zmaže inzeráty prvýkrát videné pred ``cutoff_iso``.

        Drží DB (a tým aj veľkosť commitov v repe) ohraničenú pri dlhodobom
        behu. Analytické okná sú aj tak krátke (default 30 dní), takže sa
        nič relevantné nestráca. Po zmazaní spustí VACUUM na zmenšenie súboru.
        Vracia počet zmazaných riadkov.
        """
        cur = self.conn.execute("DELETE FROM ads WHERE first_seen < ?", (cutoff_iso,))
        deleted = cur.rowcount
        self.conn.execute("DELETE FROM runs WHERE started_at < ?", (cutoff_iso,))
        self.conn.commit()
        if deleted:
            self.conn.execute("VACUUM")
        return deleted

    def sanitize_prices(self, max_price: int) -> int:
        """Vynuluje nezmyselné ceny (zlepené tel. čísla) uložené pred opravou
        parsera. Samoliečba – beží pravidelne. Vracia počet opravených."""
        cur = self.conn.execute(
            "UPDATE ads SET price_eur = NULL WHERE price_eur IS NOT NULL AND price_eur > ?",
            (max_price,),
        )
        self.conn.commit()
        return cur.rowcount

    # ---- runs ----------------------------------------------------------
    def log_run(self, kind: str, categories: str, new_ads: int, seen_ads: int,
                deleted_ads: int, started_at_iso: str) -> None:
        self.conn.execute(
            """INSERT INTO runs (started_at, kind, categories, new_ads, seen_ads, deleted_ads)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (started_at_iso, kind, categories, new_ads, seen_ads, deleted_ads),
        )
        self.conn.commit()
