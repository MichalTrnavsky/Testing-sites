"""Jednotný zoznam značiek (lowercase, bez diakritiky).

Slúži na: (1) rozpoznanie značky v nadpise, (2) zloženie „modelu" = značka +
nasledujúce zmysluplné slovo (napr. „cybex priam"). Ten istý zoznam sa
vyexportuje do data.json, aby dashboard filtroval rovnako ako backend.
"""

from __future__ import annotations

import re

from .analyze import strip_diacritics

# Vlastný tokenizer: NEodstraňuje stopslová (model sa môže volať „Priam",
# čo je zároveň slovenské slovo a normalize_tokens by ho zahodil).
_WORD_RE = re.compile(r"[a-z0-9]+")


def _tokens(title: str) -> list[str]:
    low = strip_diacritics((title or "").lower())
    return [t for t in _WORD_RE.findall(low) if len(t) >= 2]

BRANDS: set[str] = {
    # deti
    "lego", "duplo", "playmobil", "cybex", "britax", "romer", "kinderkraft",
    "stokke", "thule", "bugaboo", "joolz", "chicco", "hauck", "anex", "joie",
    "maxicosi", "avionaut", "inglesina", "recaro", "nuna", "quinny", "mima",
    "bebetto", "zopa", "coletto", "chipolino", "barbie", "hotwheels", "fisher",
    "emmaljunga", "peg", "perego", "babyzen", "graco",
    # elektro
    "samsung", "philips", "sony", "whirlpool", "bosch", "electrolux", "panasonic",
    "apple", "airpods", "jbl", "eta", "tesla", "gorenje", "yamaha", "sencor",
    "pioneer", "siemens", "beko", "zanussi", "candy", "indesit", "miele", "aeg",
    "sharp", "tcl", "hisense", "dyson", "rowenta", "tefal", "concept", "xiaomi",
    "nespresso", "krups", "delonghi", "huawei", "marshall", "bose", "jvc",
    "technics", "denon", "harman", "kenwood",
    # dom
    "vari", "stihl", "makita", "terra", "hilti", "hecht", "husqvarna", "milwaukee",
    "parkside", "agzat", "dewalt", "einhell", "honda", "gardena", "fiskars",
    "metabo", "ryobi", "scheppach", "alko", "oleo", "stiga", "mtd", "viking",
    "fieldmann", "riwall",
    # stroje
    "zetor", "jcb", "tos", "wacker", "kubota", "ursus", "deutz", "fendt",
    "komatsu", "linde", "still", "desta", "balkancar", "claas", "bomag",
    "caterpillar",
    # nabytok
    "ikea", "jysk", "asko", "sconto", "kondela", "tempo", "brw",
    # sport
    "ctm", "cube", "specialized", "kukirin", "kellys", "trek", "adidas", "merida",
    "author", "shimano", "scott", "fox", "glock", "giant", "ktm", "bianchi",
    "focus", "canyon", "dema", "ghost", "apache", "kross", "lapierre", "btwin",
    "rockrider", "nike", "puma", "sram", "cannondale", "bulls", "liv", "orbea",
    "decathlon",
}

# Slová, ktoré NIE sú model (opis/kategória/šum) – preskočíme pri skladaní modelu.
_GENERIC = {
    "kocik", "kociky", "kociar", "detsky", "detska", "detske", "sportovy",
    "sportova", "sportove", "novy", "nova", "nove", "kombinacia", "kombinovany",
    "hlboky", "luxusny", "kvalitny", "retro", "set", "bicykel", "kolobezka",
    "pila", "pracka", "chladnicka", "televizor", "vysavac", "postel", "stol",
    "kreslo", "sedacka", "auto", "modry", "modra", "cierny", "cierna", "biely",
    "biela", "velky", "velka", "maly", "mala", "ks", "kus", "typ",
    # bežný šum, ktorý by inak vytvoril falošný „model"
    "predam", "predaj", "kupim", "darujem", "novy", "nova", "povodna", "zanovny",
    "zanovna", "super", "krasny", "krasna", "vymena", "dohoda", "dohodou",
}


def model_key(title: str) -> tuple[str, str] | None:
    """Vráti (značka, model) z nadpisu, kde model = značka + najbližšie
    zmysluplné (negenerické) slovo. Napr. „Predám kočík Cybex Priam" ->
    ('cybex', 'cybex priam'). Ak sa nedá, vráti None."""
    toks = _tokens(title or "")
    for i, t in enumerate(toks):
        if t in BRANDS:
            for j in range(i + 1, min(i + 4, len(toks))):
                nxt = toks[j]
                if nxt in BRANDS:
                    break
                if nxt in _GENERIC or nxt.isdigit():
                    continue
                return (t, f"{t} {nxt}")
            return (t, t)  # značka bez rozpoznaného modelu
    return None
