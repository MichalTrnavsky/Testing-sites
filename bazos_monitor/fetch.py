"""HTTP klient pre Bazoš – rate limiting, retry, rešpekt k robots.txt.

Dôležité: crawlovanie robíme šetrne (pauza medzi requestami, malý počet
stránok), aby sme portál nezaťažovali a neriskovali blokáciu IP. Vždy si
over aktuálne podmienky používania (ToS) Bazoša pred nasadením.
"""

from __future__ import annotations

import time
import urllib.robotparser as robotparser
from dataclasses import dataclass

import requests

from .config import Config


@dataclass
class FetchResult:
    url: str
    status: int
    text: str
    ok: bool


class Fetcher:
    def __init__(self, config: Config):
        self.cfg = config
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": config.user_agent})
        self._robots_cache: dict[str, robotparser.RobotFileParser] = {}
        self._last_request_ts: float = 0.0

    # ---- robots.txt ----------------------------------------------------
    def _robots(self, subdomain: str) -> robotparser.RobotFileParser:
        rp = self._robots_cache.get(subdomain)
        if rp is not None:
            return rp
        rp = robotparser.RobotFileParser()
        rp.set_url(f"https://{subdomain}/robots.txt")
        try:
            rp.read()
        except Exception:
            # ak sa robots nedá načítať, správame sa konzervatívne = povolené,
            # ale s rate limitom nižšie
            pass
        self._robots_cache[subdomain] = rp
        return rp

    def allowed(self, subdomain: str, path: str = "/") -> bool:
        rp = self._robots(subdomain)
        try:
            return rp.can_fetch(self.cfg.user_agent, f"https://{subdomain}{path}")
        except Exception:
            return True

    # ---- rate limit ----------------------------------------------------
    def _throttle(self) -> None:
        delay = self.cfg.request_delay_seconds
        elapsed = time.monotonic() - self._last_request_ts
        if elapsed < delay:
            time.sleep(delay - elapsed)
        self._last_request_ts = time.monotonic()

    # ---- GET s retry ---------------------------------------------------
    def get(self, url: str) -> FetchResult:
        last_exc: Exception | None = None
        for attempt in range(self.cfg.max_retries):
            self._throttle()
            try:
                resp = self.session.get(
                    url, timeout=self.cfg.request_timeout_seconds
                )
                # 404 je legitímna odpoveď (zmazaný inzerát) – nevraciame retry
                if resp.status_code == 404:
                    return FetchResult(url, 404, resp.text, ok=False)
                if resp.status_code >= 500 or resp.status_code == 429:
                    raise requests.HTTPError(f"HTTP {resp.status_code}")
                return FetchResult(
                    url, resp.status_code, resp.text, ok=resp.ok
                )
            except Exception as exc:  # sieťová chyba / 5xx / 429
                last_exc = exc
                backoff = 2 ** attempt  # 1s, 2s, 4s, 8s
                time.sleep(backoff)
        return FetchResult(url, 0, f"ERROR: {last_exc}", ok=False)
