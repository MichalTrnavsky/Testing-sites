# Bazoš dopyt monitor

Nástroj, ktorý sleduje **obrat inzerátov** na [Bazoš.sk](https://www.bazos.sk)
a z neho odvodzuje **dopyt v segmentoch**. Logika je jednoduchá:

> Ak v nejakom segmente pribúda **veľa nových inzerátov** a tie zároveň
> **rýchlo miznú** (inzerent ich zmaže, typicky lebo predal), je po danom
> segmente **vysoký dopyt**.

Príklad výstupu (presne tvoj scenár):

```
kategória   segment (kľúč)            nové zmaz. život.dní  skóre
------------------------------------------------------------------
Záhrada     zahradna hojdacka          104    98      3.0    41.2
Záhrada     trampolina                  61    40      6.5    12.1
Dom a zahr. kotol na tuhe palivo        22    19      2.1    18.7
```

Čítanie: *„v kategórii Záhrada pribudlo 104 inzerátov na záhradnú hojdačku,
98 z nich už bolo zmazaných a v priemere vydržali visieť len 3 dni“* → silný
dopyt.

---

## Existujú na to hotové crawlery / connectory / skilly?

Krátko: **nie, hotový connector ani skill priamo na Bazoš neexistuje** a
tento nástroj je preto vlastný, ľahký crawler. Detailnejšie:

- **Bazoš nemá verejné oficiálne API** – dáta sa dajú získať iba
  parsovaním HTML listingov (čo robí tento nástroj).
- Žiadny z dostupných MCP connectorov (Gmail, Drive, Supabase, GitHub,
  Higgsfield, Scenario, Vibe Prospecting…) nie je o Bazoši – sú to iné
  služby.
- Existujú generické scraping frameworky (Scrapy, Playwright, requests +
  BeautifulSoup). Tento projekt stavia na `requests + BeautifulSoup`, lebo
  Bazoš je statické HTML a nepotrebuje prehliadač.
- **Kľúčová vec, ktorú hotové crawlery neriešia**, je práve tvoja metrika –
  spárovať *objem nových inzerátov* so *životnosťou do zmazania* a spraviť
  z toho skóre dopytu. To je jadro tohto nástroja (`analyze.py`).

> ⚠️ **Sieť:** v tomto vývojovom (cloud) prostredí je `bazos.sk` blokovaný
> egress politikou, takže samotný `crawl` tu nezbehne. Nástroj spúšťaj tam,
> kde je Bazoš dostupný – tvoj server / PC / VPS.

---

## Ako to funguje

Tri kroky, ktoré sa periodicky opakujú:

1. **`crawl`** – prejde listingy vybraných kategórií (subdomén ako
   `zahrada.bazos.sk`), vytiahne každý inzerát (ID z URL `/inzerat/<id>/`,
   nadpis, cenu, dátum) a zapíše/aktualizuje ho v SQLite. Pri prvom videní
   uloží `first_seen`.
2. **`sweep`** – inzeráty, ktoré vypadli z listingu, overí na detaile. Ak
   detail hlási „inzerát bol vymazaný“ (alebo 404), označí ho ako `deleted`
   a zapíše `deleted_at`. **Životnosť = `deleted_at − first_seen`.**
   (Rozlišuje sa tým „zmazaný“ od „len vytlačený novšími na ďalšie strany“.)
3. **`report`** – zoskupí inzeráty podľa kľúčových slov v nadpisoch
   (unigramy + bigramy, so slovenským filtrom stopwords a diakritiky) a
   spočíta objem + medián životnosti + **skóre dopytu**.

Skóre dopytu = normalizovaný objem nových inzerátov delený (medián
životnosti + 1 deň). Vysoký objem a krátka životnosť ženú skóre hore.

---

## Inštalácia

```bash
pip install -r requirements.txt
cp config.example.yaml config.yaml   # a uprav si kategórie
```

## Použitie

```bash
# vypíš známe kategórie a čo je sledované/vylúčené
python -m bazos_monitor.cli --config config.yaml cats

# jeden zber (spúšťaj periodicky – viď cron nižšie)
python -m bazos_monitor.cli --config config.yaml crawl

# over zmiznuté inzeráty a doplň životnosti
python -m bazos_monitor.cli --config config.yaml sweep

# report dopytu za posledných 30 dní, len záhrada, do CSV
python -m bazos_monitor.cli --config config.yaml report --category zahrada --window 30 --csv dopyt.csv
```

Kategórie sa dajú prepnúť aj bez configu:

```bash
python -m bazos_monitor.cli --include zahrada,dom --exclude reality,auto,moto crawl
```

Reality / Auto / Moto sú **vylúčené defaultne** (presne to, čo ťa nezaujíma).

## Automatizácia (cron)

Zmysel dáva zbierať často (kvôli presnej životnosti) a reportovať občas:

```cron
# crawl každé 2 hodiny
0 */2 * * *  cd /cesta/k/projektu && python -m bazos_monitor.cli --config config.yaml crawl >> crawl.log 2>&1
# sweep (kontrola zmazaní) každých 6 hodín
15 */6 * * * cd /cesta/k/projektu && python -m bazos_monitor.cli --config config.yaml sweep >> sweep.log 2>&1
```

**Pozn.:** čím kratší interval crawlu, tým presnejšia životnosť (a lepšie
zachytíš inzeráty, čo pribudnú a zmiznú v ten istý deň). Interval však drž
rozumný kvôli záťaži servera.

---

## Metodická poznámka k „dopytu“

- **Prvé dni** report ešte nič neukáže – potrebuje aspoň pár behov naprieč
  viacerými dňami, aby vznikli zmazania a teda životnosti.
- „Rýchle zmazanie“ ≈ predaj, ale nie vždy (inzerent mohol prestať
  predávať). Preto sa pozeraj na **medián** a na **objem** spolu, nie na
  jednotlivé inzeráty.
- Segmenty definuje automatické zhlukovanie podľa slov v nadpise. Ak chceš
  presné produkty (napr. len „hojdačka“, „trampolína“), report vieš filtrovať
  podľa `--category` a v CSV si dohľadať konkrétne kľúče.

## Právne / etické

- Skontroluj `robots.txt` a **Podmienky používania Bazoša** pred nasadením –
  nástroj `robots.txt` rešpektuje a má nastavený rate limit + `User-Agent`.
- Zbieraj len to, čo potrebuješ, a server nezaťažuj (default 1,5 s medzi
  requestami, pár stránok na kategóriu).

## Štruktúra

```
bazos_monitor/
  categories.py   # mapa subdomén kategórií + include/exclude
  config.py       # načítanie YAML + defaulty
  fetch.py        # HTTP klient (robots, rate limit, retry)
  parse.py        # parsovanie listingu a detailu (odolné voči zmene tried)
  store.py        # SQLite schéma + upserty + životnosť
  crawl.py        # zber listingov
  deletions.py    # detekcia zmazaných = výpočet životnosti
  analyze.py      # skóre dopytu + report/CSV
  cli.py          # príkazy: crawl / sweep / report / cats
tests/
  test_pipeline.py  # offline testy (parser, DB, analytika) bez siete
```

## Kam ďalej (nápady na rozšírenie)

- Presnejšie časy zmazania (kratší crawl interval / sledovanie počtu videní).
- Trendy v čase (týždeň/mesiac) a upozornenia pri náraste dopytu.
- Export do dashboardu (napr. Supabase + graf) namiesto CSV.
- Filtrovanie podľa ceny/regiónu.
