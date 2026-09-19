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

# ARBITRÁŽ: kde sa oplatí doviezť nový tovar (napr. z Číny)
python -m bazos_monitor.cli --config config.yaml arbitraz --window 30 --min-price 100 --csv arbitraz.csv

# ZHRNUTIE segmentu: denné prírastky/úbytky, cenové rozpätie, top produkty
python -m bazos_monitor.cli --db bazos.db zhrnutie --category deti --keyword kocik --window 30
```

## Zhrnutie segmentu (`zhrnutie`)

Odpovedá na otázku typu *„koľko pribudne/ubudne denne, aká je cena a čo je top produkt"*:

```
Zhrnutie: Detský bazár / „kocik"  —  posledných 10 dní
============================================================
  Nové inzeráty:    300  (≈ 30.0/deň)
  Zmazané:          100  (≈ 10.0/deň)
  Medián životnosti: 3.0 dňa
  Cena:             min 300 / medián 500 / max 900 € (rozptyl 600 €)
  TOP produkty (podľa výskytu v nadpisoch):
     1. detsky kocik            200×
     2. kocik cybex kombinacia  100×
     ...
```

Bez `--keyword` zhrnie celú kategóriu. Workflow generuje `reports/zhrnutie.txt`
pre všetky sledované kategórie pri každom behu.

## Filter čerstvosti (`--max-age`)

Inzeráty staršie ako `--max-age` dní (default **21**) sa v analýze **ignorujú**.
Dôvod: staré ponuky sú vytlačené novšími dozadu a väčšinou znamenajú
„nepredajné / zabudnuté / zaseknuté" – nie živý dopyt. Filter platí pre
`report`, `arbitraz` aj `zhrnutie` (podľa dátumu pridania na inzeráte).
`--max-age 0` limit vypne.

Navyše crawler sťahuje len prvých pár strán (najnovšie inzeráty), takže staré
ležiaky vzadu v listingu sa väčšinou ani nenačítajú.

## Arbitráž – hlavný účel nástroja

Cieľom nie je len „vysoký dopyt", ale **arbitrážna príležitosť**: segment, kde
vieš doviezť **nový** tovar (napr. z Číny) a predať ho **za cenu použitého /
pod cenu miestneho nového** – a ľudia radšej kúpia nový lacný od teba.

> Príklad: ratanový set stojí nový 1000 €, použitý 500 €. Ty dovezieš nový
> z Číny a ponúkaš ho za 500 €. Ak veľkoobchod + doprava < 500 €, máš maržu.

Príkaz `arbitraz` skóruje segmenty podľa troch vecí:

1. **Dopyt** – veľa inzerátov + krátka životnosť (rýchlo sa predávajú).
2. **Hodnota** – vysoká **absolútna cena použitého** (oplatí sa doviezť).
3. **Konkurencia** – **málo lacných nových** ponúk (nikto to ešte masovo
   nerobí → priestor pre teba). Stav (nový/použitý) sa odhaduje z nadpisu.

Ukážkový výstup:

```
kategória  segment              ks  život  použité€  nové€  lacná konk.  skóre
-----------------------------------------------------------------------------
Záhrada    ratanovy zahradny     9    2.0      500      -            0   68.2   ← ideál
Záhrada    infrasauna            9    4.0      900    820            3   18.4   ← už dovážajú
Záhrada    trampolina           22    2.0      120    130           10    3.6   ← lacné, presýtené
```

**Čítanie:** ratanový set = vysoký dopyt, drahé použité (500 €) a nulová lacná
konkurencia → top kandidát. Infrasauna je drahšia, ale už ju 3 predajcovia
predávajú novú lacno → skóre padá. Trampolína sa rýchlo obracia, ale je lacná
a trh je presýtený lacnými novými → nezaujímavé.

**Čo nástroj NEvie a musíš overiť ty:** skutočnú **veľkoobchodnú cenu z Číny**
(Alibaba / 1688 / AliExpress) vrátane dopravy a cla. Nástroj ti dá zoradený
zoznam kandidátov; posledný krok – „vyjde mi dovoz pod cenu použitého?" – je na
tebe. Rovnako „retail nový" cena je iba aproximovaná z drahších nových
inzerátov na Bazoši.

Parametre: `--min-price` (min. cena použitého, default 100 €), `--max-price`
(max. cena použitého, default 3000 €; nad ňou to už nie je „dovoz z Číny" –
napr. traktory; `0` = bez stropu), `--min-volume` (min. počet inzerátov v
segmente, default 5), `--window`, `--category`, `--csv`.

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
