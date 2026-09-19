"""Zoznam hlavných kategórií (subdomén) portálu Bazoš.sk.

Každá hlavná kategória na Bazoši beží na vlastnej subdoméne, napr.
``https://zahrada.bazos.sk/``. Kľúč slovníka je interný identifikátor,
hodnota obsahuje subdoménu a ľudský názov.

Zoznam sa dá bez problémov rozšíriť/upraviť – crawler nič nepredpokladá
nad rámec toho, že subdoména existuje a listuje inzeráty.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Category:
    key: str          # interný identifikátor (napr. "zahrada")
    subdomain: str    # napr. "zahrada.bazos.sk"
    label: str        # ľudský názov (napr. "Záhrada")


# Kompletná mapa známych hlavných kategórií Bazoš.sk.
# (Subdomény sú stabilné; ak Bazoš niektorú premenuje, stačí upraviť tu.)
ALL_CATEGORIES: dict[str, Category] = {
    c.key: c
    for c in [
        Category("auto", "auto.bazos.sk", "Auto"),
        Category("moto", "moto.bazos.sk", "Moto"),
        Category("reality", "reality.bazos.sk", "Reality"),
        Category("praca", "praca.bazos.sk", "Práca"),
        Category("deti", "deti.bazos.sk", "Detský bazár"),
        Category("dom", "dom.bazos.sk", "Dom a záhrada"),
        Category("zahrada", "zahrada.bazos.sk", "Záhrada"),
        Category("elektro", "elektro.bazos.sk", "Elektro"),
        Category("pc", "pc.bazos.sk", "PC"),
        Category("mobil", "mobil.bazos.sk", "Mobily"),
        Category("foto", "foto.bazos.sk", "Foto"),
        Category("hudba", "hudba.bazos.sk", "Hudba"),
        Category("knihy", "knihy.bazos.sk", "Knihy"),
        Category("nabytok", "nabytok.bazos.sk", "Nábytok"),
        Category("oblecenie", "oblecenie.bazos.sk", "Oblečenie"),
        Category("sport", "sport.bazos.sk", "Šport"),
        Category("stroje", "stroje.bazos.sk", "Stroje"),
        Category("vstupenky", "vstupenky.bazos.sk", "Lístky"),
        Category("sluzby", "sluzby.bazos.sk", "Služby"),
        Category("zvierata", "zvierata.bazos.sk", "Zvieratá"),
        Category("ostatne", "ostatne.bazos.sk", "Ostatné"),
    ]
}

# Kategórie, ktoré používateľa vôbec nezaujímajú (default vylúčenie).
DEFAULT_EXCLUDED: tuple[str, ...] = ("reality", "auto", "moto")


def resolve_categories(
    include: list[str] | None,
    exclude: list[str] | None,
) -> list[Category]:
    """Vráti finálny zoznam kategórií na crawlovanie.

    - ak je ``include`` prázdny/None → berú sa všetky známe kategórie,
    - potom sa odfiltruje všetko z ``exclude`` (default: reality/auto/moto).
    """
    exclude_set = set(exclude if exclude is not None else DEFAULT_EXCLUDED)

    if include:
        keys = [k for k in include]
    else:
        keys = list(ALL_CATEGORIES.keys())

    result: list[Category] = []
    for k in keys:
        if k in exclude_set:
            continue
        cat = ALL_CATEGORIES.get(k)
        if cat is None:
            raise ValueError(
                f"Neznáma kategória '{k}'. Známe: {', '.join(ALL_CATEGORIES)}"
            )
        result.append(cat)
    return result
