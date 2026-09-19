"""Parsovanie Bazoš HTML.

Návrh je zámerne odolný voči zmenám CSS tried: primárny identifikátor
inzerátu je numerické ID z URL vzoru ``/inzerat/<id>/...``, ktoré je na
Bazoši dlhodobo stabilné. Dátum a cenu hľadáme regexom v okolí odkazu,
takže premenovanie tried listing nerozbije.

Ak Bazoš niekedy zmení URL vzor alebo formát dátumu, uprav konštanty
``AD_URL_RE`` a ``DATE_RE`` nižšie – zvyšok kódu ostáva.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date, datetime

from bs4 import BeautifulSoup

# /inzerat/171234567/nazov-inzeratu.php  -> id = 171234567
AD_URL_RE = re.compile(r"/inzerat/(\d+)/")
# podkategória: odkaz s parametrom ?...category=120...
SUBCAT_RE = re.compile(r"[?&]category=(\d+)")
# "Pridané 18.9. 2026" / "Pridané dňa: 18.9.2026" / "18. 9. 2026"
DATE_RE = re.compile(r"(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})")
# "Cena 120 €" / "120 €" / "1 250 €". Za číslom hneď (voliteľné medzery) €.
PRICE_RE = re.compile(r"(\d[\d\s]{0,9})\s*€")
# Realistický strop ceny (bez reality/auto) – nad tým je to skoro isto zle
# zosnímané telefónne číslo/PSČ zlepené do "ceny".
MAX_SANE_PRICE = 500_000

# Markery, že detail inzerátu bol zmazaný / už neexistuje.
DELETED_MARKERS = (
    "inzerát bol vymazaný",
    "inzerat bol vymazany",
    "inzerát neexistuje",
    "inzerat neexistuje",
    "bol zmazaný",
    "bol zmazany",
    "tento inzerát už neexistuje",
)


@dataclass
class ListingAd:
    ad_id: str
    title: str
    url: str
    price_eur: int | None
    posted_date: date | None


def _parse_date(text: str) -> date | None:
    m = DATE_RE.search(text)
    if not m:
        return None
    day, month, year = (int(m.group(1)), int(m.group(2)), int(m.group(3)))
    try:
        return date(year, month, day)
    except ValueError:
        return None


def _parse_price(text: str) -> int | None:
    # môže byť viac výskytov "... €"; vezmeme prvú rozumnú hodnotu
    for m in PRICE_RE.finditer(text):
        digits = re.sub(r"\s", "", m.group(1))
        if not digits.isdigit():
            continue
        # príliš veľa číslic = zlepené tel. číslo/PSČ, nie cena
        if len(digits) > 7:
            continue
        value = int(digits)
        if 0 < value <= MAX_SANE_PRICE:
            return value
    return None


def parse_listing(html: str, base_url: str) -> list[ListingAd]:
    """Z HTML stránky listingu vytiahne inzeráty.

    Pre každý odkaz na ``/inzerat/<id>/`` nájde najbližší blok (rodiča) a
    v jeho texte hľadá dátum a cenu.
    """
    soup = BeautifulSoup(html, "lxml")
    seen: dict[str, ListingAd] = {}

    for a in soup.find_all("a", href=True):
        m = AD_URL_RE.search(a["href"])
        if not m:
            continue
        ad_id = m.group(1)
        title = a.get_text(strip=True)
        if not title:
            continue  # napr. odkaz cez obrázok bez textu – preskočíme

        href = a["href"]
        url = href if href.startswith("http") else _join(base_url, href)

        # blok inzerátu = najbližší rodič, ktorý obsahuje aj dátum/cenu
        block_text = _block_text(a)
        posted = _parse_date(block_text)
        price = _parse_price(block_text)

        ad = ListingAd(
            ad_id=ad_id,
            title=title,
            url=url,
            price_eur=price,
            posted_date=posted,
        )
        # ak sa to isté ID zopakuje (obrázok + nadpis), uprednostni záznam
        # s textovým nadpisom a doplnenými poľami
        prev = seen.get(ad_id)
        if prev is None or (prev.posted_date is None and posted is not None):
            seen[ad_id] = ad

    return list(seen.values())


def _block_text(anchor) -> str:
    """Text 'kartičky' inzerátu.

    Ideme pár úrovní hore po rodičoch a vezmeme NAJTESNEJŠI blok, ktorý už
    obsahuje cenu (``€``) – ten spravidla obopína celý inzerát vrátane dátumu.
    Ak sa cena nikde v okolí nenájde (inzerát bez ceny), vrátime najtesnejší
    blok obsahujúci dátum, prípadne najvyšší nazbieraný blok.
    Zastavenie na prvom bloku s ``€`` bráni „preliezť" do kontajnera so
    všetkými inzerátmi.
    """
    node = anchor
    with_date: str | None = None
    fallback: str | None = None
    for _ in range(5):
        parent = node.parent
        if parent is None:
            break
        node = parent
        text = node.get_text(" ", strip=True)
        fallback = text
        if "€" in text:
            return text
        if with_date is None and DATE_RE.search(text):
            with_date = text
    return with_date or fallback or anchor.get_text()


def is_detail_deleted(result_status: int, html: str) -> bool:
    """Rozhodne, či detail inzerátu znamená 'zmazaný'."""
    if result_status == 404:
        return True
    low = html.lower()
    return any(marker in low for marker in DELETED_MARKERS)


def next_page_url(subdomain: str, page_index: int, per_page: int) -> str:
    """URL ďalšej stránky listingu.

    Bazoš stránkuje offsetom v ceste, napr. ``/20/``, ``/40/`` …
    Prvá stránka je bez offsetu.
    """
    if page_index <= 0:
        return f"https://{subdomain}/"
    offset = page_index * per_page
    return f"https://{subdomain}/{offset}/"


def parse_subcategories(html: str) -> list[tuple[str, str]]:
    """Z hlavnej stránky subdomény vytiahne podkategórie ``(id, názov)``.

    Bazoš má výber podkategórie ako rozbaľovací ``<select name="category">``
    s ``<option value="120">Kočíky</option>`` – ID je vo value, názov v texte.
    Pre istotu čítame aj prípadné odkazy s ``?category=<ID>``. Ak sa názov
    nenájde, označíme podkategóriu ako ``kat. <ID>``. Dedup podľa id.
    """
    soup = BeautifulSoup(html, "lxml")
    out: dict[str, str] = {}

    # 1) <select name~=category> -> <option value=ID>Názov</option>
    for sel in soup.find_all("select"):
        nm = (sel.get("name") or sel.get("id") or "").lower()
        if "categ" not in nm:
            continue
        for opt in sel.find_all("option"):
            val = (opt.get("value") or "").strip()
            if not val.isdigit() or val == "0":
                continue
            name = opt.get_text(strip=True)
            out.setdefault(val, name or f"kat. {val}")

    # 2) odkazy s ?category=<ID> (názov = text odkazu)
    for a in soup.find_all("a", href=True):
        m = SUBCAT_RE.search(a["href"])
        if not m:
            continue
        cid = m.group(1)
        if cid == "0":
            continue
        name = a.get_text(strip=True)
        out.setdefault(cid, name or f"kat. {cid}")

    return list(out.items())


def subcat_listing_url(subdomain: str, rubriky: str, category_id: str,
                       page_index: int, per_page: int) -> str:
    """URL listingu podkategórie (s offsetom v ceste ako pri hlavnom listingu)."""
    path = "/" if page_index <= 0 else f"/{page_index * per_page}/"
    q = (f"?hledat=&rubriky={rubriky}&category={category_id}"
         f"&hlokalita=&humkreis=25&cenaod=&cenado=&order=&crp=&kitx=ano")
    return f"https://{subdomain}{path}{q}"


def _join(base_url: str, href: str) -> str:
    if href.startswith("/"):
        # base_url je typu https://zahrada.bazos.sk/
        root = re.match(r"(https?://[^/]+)", base_url)
        return (root.group(1) if root else base_url.rstrip("/")) + href
    return base_url.rstrip("/") + "/" + href


def now_utc() -> datetime:
    return datetime.utcnow()
