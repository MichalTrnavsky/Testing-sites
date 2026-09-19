"""Načítanie konfigurácie z YAML súboru + rozumné defaulty."""

from __future__ import annotations

import os
from dataclasses import dataclass, field, asdict
from typing import Any

try:
    import yaml  # type: ignore
except Exception:  # pragma: no cover - yaml je v requirements
    yaml = None


@dataclass
class Config:
    # ktoré kategórie crawlovať (prázdne = všetky známe)
    include_categories: list[str] = field(default_factory=list)
    # ktoré vylúčiť (default: reality/auto/moto – viď categories.DEFAULT_EXCLUDED)
    exclude_categories: list[str] | None = None

    # POISTNÝ strop stránok na kategóriu (crawl sa zvyčajne zastaví skôr –
    # keď narazí na inzeráty staršie než crawl_lookback_days)
    max_pages_per_category: int = 25
    # sťahuj strany, kým sú inzeráty novšie než X dní (0 = ignoruj, ber strop)
    crawl_lookback_days: float = 3.0
    # crawl na úrovni podkategórií (objaví ich z hlavnej stránky a označí inzeráty)
    crawl_subcategories: bool = True
    # tvrdý strop strán NA PODKATEGÓRIU (poistka voči záťaži, nezávislá od horizontu)
    subcat_max_pages: int = 6
    # per-kategóriové prepísanie stropu (napr. {"deti": 40}) – keď má kategória
    # extrémny pohyb, zvýšime strop len jej
    pages_per_category: dict = field(default_factory=dict)
    # inzerátov na stránku (Bazoš default býva 20)
    per_page: int = 20

    # slušné správanie: pauza medzi HTTP requestami (sekundy)
    request_delay_seconds: float = 1.5
    request_timeout_seconds: float = 20.0
    max_retries: int = 4
    user_agent: str = "bazos-dopyt-monitor/1.0 (osobny research)"

    # cesta k SQLite databáze
    db_path: str = "bazos.db"

    # koľko po sebe idúcich behov musí inzerát "chýbať" v listingu,
    # kým ho označíme za kandidáta na kontrolu zmazania
    missing_runs_before_check: int = 1
    # koľko detailov kontrolovať za beh (šetrenie requestov)
    max_deletion_checks_per_run: int = 300

    @staticmethod
    def load(path: str | None) -> "Config":
        cfg = Config()
        if not path:
            return cfg
        if not os.path.exists(path):
            raise FileNotFoundError(f"Config súbor neexistuje: {path}")
        if yaml is None:
            raise RuntimeError("Chýba PyYAML – nainštaluj: pip install pyyaml")
        with open(path, "r", encoding="utf-8") as fh:
            data: dict[str, Any] = yaml.safe_load(fh) or {}
        known = set(asdict(cfg).keys())
        for key, value in data.items():
            if key not in known:
                raise ValueError(f"Neznámy config kľúč: '{key}'")
            setattr(cfg, key, value)
        return cfg
