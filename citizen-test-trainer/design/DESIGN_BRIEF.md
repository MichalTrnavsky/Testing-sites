# CitizenPrep — dizajnový podklad pre Claude Design

Podklad pre návrh grafiky a UI. Cieľ: z funkčného prototypu (HTML/CSS/JS
v `../app/`) spraviť konzistentný, dôveryhodný, konverzne silný a viacjazyčný
produkt pre dva trhy (Švédsko = priorita, Dánsko = paralelný anchor).

---

## 1. Kontext produktu

- **Čo to je:** online tréner na povinné štátne skúšky k občianstvu.
  - 🇸🇪 **medborgarskapsprovet** (samhällskunskap) — nový, prvý (pilotný) termín 15. 8. 2026, ~60 otázok / 90 min / 4 možnosti.
  - 🇩🇰 **indfødsretsprøven** + medborgerskabsprøven — 45 otázok / 45 min / 3 možnosti.
- **Cieľová skupina:** imigranti žiadajúci o občianstvo. Vysoko motivovaní (v hre je pas), často **nerodení hovoriaci** švédčiny/dánčiny, prevažne na **mobile**. Časté jazyky: arabčina, farsi, ukrajinčina, turečtina, angličtina, poľština, somálčina.
- **Obchodný kanál:** primárne **platená reklama (Google Ads)** + SEO obsah. Landing musí konvertovať studenú návštevnosť.
- **Kľúčová diferenciácia:** dánska/švédska otázka + **preklad do rodného jazyka priamo pod ňou** (vrátane RTL pre arabčinu/farsi).

## 1b. Cena a positioning: NEceníme dole

Rozhodnutie: **cenu dorovnávame konkurencii, nevyhrávame lacnotou.** Seriózna
švédska kotva je **499 SEK** (medborgarskapsprov.se). Ideme na **499 SEK** a
odlíšime sa **prispôsobením migrantom** (sekcia 2b), nie zľavou. Dizajn preto
musí vyžarovať kvalitu a hodnotu, nie „výpredaj".

## 2. Tón a positioning

- Dôveryhodný, pokojný, „štátno-oficiálny, ale ľudský". **Nie** kричľavý, nie scammy (nika je plná spamu — musíme pôsobiť seriózne).
- **POZOR (legal):** nesmieme pôsobiť ako oficiálna štátna služba ani imitovať úrady (SIRI/UHR). Žiadne štátne znaky, žiadne „gov" vizuály.
- Čestnosť ako hodnota: otvorene komunikujeme „negarantujeme, že prejdeš" — dizajn to má podporiť, nie skrývať.

## 2b. Migrant-first diferenciácia (naše jadro proti konkurencii)

Konkurent za 499 SEK je **monolingválny švédsky**. Celá naša pridaná hodnota =
**sme spravené pre cudzinca, ktorý po švédsky ešte nevie dobre.** Dizajn musí
tieto prvky vypichnúť ako hlavný predajný argument (nie ako drobnosť):

1. **Bilingválne otázky** — švédsky originál + preklad v rodnom jazyku pod ním (vrátane RTL). *(hotové)*
2. **Vysvetlenia v rodnom jazyku** — nielen preklad, ale „prečo je odpoveď správna". *(hotové)*
3. **Glosár ťažkých pojmov** — občianske termíny (riksdag, personnummer, a-kassa, jämställdhet) s jednoduchou definíciou v rodnom jazyku, na klik. *(hotové — nový komponent)*
4. **Onboarding podľa jazyka a krajiny pôvodu** — prvé, čo user spraví, je výber rodného jazyka; všetko sa prispôsobí. *(navrhnúť)*
5. **Audio / počúvanie** — časť cieľovky má nízku gramotnosť vo švédčine; prehratie otázky nahlas (UHR má audio *Sverige i fokus*). *(roadmap)*
6. **Kultúrny kontext** — krátke vysvetlenie pojmov, ktoré sú pre niekoho z iného systému neznáme (ako funguje jämställdhet, regióny v zdravotníctve). *(navrhnúť)*
7. **Praktický presah** — prepojiť fakty na reálny život migranta (personnummer, a-kassa, ako voliť) — hodnota nad rámec testu. *(navrhnúť)*
8. **Dôvera pre skepticú cieľovku** — nika plná podvodov; jasná cena, transparentnosť, recenzie v rodnom jazyku. *(navrhnúť)*
9. **Nízka digitálna gramotnosť + lacné telefóny** — extra čisté mobilné UI, veľké terče, ikonami vedené, nízke dáta (PWA). *(navrhnúť)*

Dizajnová priorita: prvky 1–3 sú hotové a treba ich **povýšiť na hrdý predajný prvok** (na landing aj v produkte), 4–9 nadizajnovať.

## 3. Značka a systém (návrhové rozhodnutia)

Claude Design nech navrhne a v týchto bodoch rozhodne:

1. **Logo / wordmark „CitizenPrep"** + favicon set (máme len emoji vlajky ako placeholder).
2. **Farebný systém s theming-om per krajina** — jedna kostra značky, vymeniteľný akcent:
   - 🇸🇪 SE: modrá `#005293` + žltá `#FECC02`
   - 🇩🇰 DK: červená `#C8102E` (Dannebrog)
   - Musí fungovať v **light aj dark** režime (prototyp už dark má).
3. **Typografia** — škála nadpisov/textu; musí zvládnuť dlhé reťazce (nemčina), cyriliku (ukrajinčina) aj arabské písmo.
4. **Komponentový kit** (nižšie, sekcia 6).
5. **Ilustrácie/ikonografia** — striedmy, dôveryhodný štýl; vyhnúť sa lacným stockovým vlajkam.

## 4. Prierezové požiadavky (platia pre všetky stránky)

- **Mobile-first.** Väčšina cieľovky je na telefóne.
- **Viacjazyčnosť vrátane RTL.** Layout nesmie predpokladať anglickú dĺžku; arabčina/farsi = zrkadlené (RTL). Cyrilika, diakritika.
- **Prístupnosť WCAG AA** — kontrast, veľkosť terčov, čitateľnosť pre nerodených hovoriacich a starších.
- **Light/dark režim.**
- **Výkon** — rýchle načítanie (drahá reklama = každá sekunda a odskok stojí peniaze).

---

## 5. Inventár stránok (čo treba nadizajnovať)

Priorita: **P1 = konverzný povrch (reklama sem padá), P2 = produkt, P3 = účet/lifecycle, P4 = legal/systém.**
Stĺpec „stav" = čo už existuje v prototype.

### A. Marketing / verejné (P1)

| # | Stránka | Účel | Kľúčové sekcie / obsah | Hlavné CTA | Stav |
|---|---|---|---|---|---|
| A1 | **Landing SE** (domov) | Konvertovať studenú SE návštevnosť | Hero, fakta-box (60/90/4), miera úspešnosti (graf), transparentný pôvod dát, čestný disclaimer, bilingválna ukážka, „prečo my", 5 študijných tipov, cenník, FAQ, finálne CTA | Start gratis / Köp | nový (DK verzia hotová ako vzor) |
| A2 | **Landing DK** (domov) | To isté pre DK | ako A1, dánske dáta (45/45/3, úspešnosť 47–62 %) | Start gratis / Køb | ✅ hotová (`app/index.html`) — redizajn |
| A3 | **Jazykové landing varianty** | SEO + konverzia pre AR/UK/TR/FA hovoriacich | „Švédske občianstvo — test po arabsky/ukrajinsky" + bilingválny uhol, lacnejšie kľúč. slová | Start gratis | nový (template) |
| A4 | **Cenník** (sekcia/stránka) | Vysvetliť plány, ukotviť cenu | Free vs Full porovnanie, balíček (oba testy), kotva oproti poplatku za skúšku, garancia? | Köp full tillgång | čiastočne (v landing) |
| A5 | **FAQ** (samostatná, SEO) | Long-tail SEO + odbúranie námietok | akordeón otázok, štruktúrované (JSON-LD) | Start gratis | ako sekcia na landing |

### B. Produkt — tréner (P2)

| # | Obrazovka | Účel | Kľúčové prvky | Stavy | Stav |
|---|---|---|---|---|---|
| B1 | **Onboarding** | Nastaviť personalizáciu | výber testu (občianstvo/pobyt), rodný jazyk, dátum skúšky | — | nový |
| B2 | **Dashboard / štart** | Rozcestník + prehľad | 3 režimy (Öva/Provsimulator/Repetera fel), štatistiky, cenník (free), odpočet do skúšky | free vs paid | ✅ základ — redizajn |
| B3 | **Kvíz — cvičenie** | Učenie s feedbackom | otázka, **bilingválny blok** (originál + preklad, RTL), možnosti (3/4), okamžitý feedback + vysvetlenie, progress bar | pred/po odpovedi, správne/zle | ✅ funkčné — redizajn |
| B4 | **Kvíz — skúška (simulátor)** | Realistická skúška | to isté + **časomiera**, bez feedbacku, intro/inštrukcie pred štartom | intro → beh → koniec, dochádza čas | ✅ funkčné (chýba intro obrazovka) |
| B5 | **Výsledky + rozbor chýb** | Vyhodnotenie + retencia | pass/fail badge, skóre vs hranica, zoznam chýb s vysvetlením, upsell (free) | prešiel / neprešiel | ✅ funkčné — redizajn |
| B6 | **Štatistiky / pokrok** | Motivácia + slabé miesta | úspešnosť v čase, najslabšie témy, „readiness" skóre, séria dní | prázdny / s dátami | ✅ mini verzia — rozšíriť |

### C. Účet a lifecycle (P3)

| # | Stránka | Účel | Kľúčové prvky | Stav |
|---|---|---|---|---|
| C1 | **Nákupný dialóg** | Zber e-mailu → platba | e-mail input, zhrnutie, dôveryhodnostné prvky (bezpečná platba) | ✅ základ — redizajn |
| C2 | **Platba úspešná / vitaj** | Potvrdenie + prístup | „si dnu", ako sa prihlásiť, info o magic-linku | nový |
| C3 | **Platba zrušená** | Záchrana odchodu | jemné „skús znova", späť na free | nový |
| C4 | **Login / magic-link** | Návrat platiaceho | e-mail → „poslali sme ti link" | nový |
| C5 | **Môj účet** | Stav prístupu | status, dátum skúšky, doklad/faktúra | nový |
| C6 | **E-mail šablóny** (HTML) | Onboarding + retencia | magic-link, doklad, **„skúška o X dní" nurture**, „pridali sme nové otázky" | nový |

### D. Legal / systém (P4)

| # | Stránka | Poznámka | Stav |
|---|---|---|---|
| D1 | **Ochrana údajov (GDPR)** | Povinné. Zbierame e-mail + nákup. | nový |
| D2 | **Obchodné podmienky** | Vrátane disclaimeru „nie sme oficiálna služba" | nový |
| D3 | **O nás / Kontakt** | Dôveryhodnosť + support | nový |
| D4 | **404 / chyba** | — | nový |
| D5 | **Cookie lišta** | GDPR consent | nový |

### E. Rastové assety (P2–P3)

| # | Asset | Účel | Stav |
|---|---|---|---|
| E1 | **OG / share obrázky** | Náhľady pri zdieľaní (per typ stránky, per krajina) | nový |
| E2 | **Google Ads kreatívy** | Responsive display bannery (viac rozmerov), varianty per jazyk | nový |
| E3 | **App ikona / PWA** | Ak pôjdeme do PWA (mobil) | nový |

---

## 6. Komponentový kit (opakované prvky naprieč stránkami)

Navrhnúť ako systém (light+dark, per-country akcent):

- Tlačidlá: primary / outline / ghost / text
- Karty: režimová karta, „prečo my" karta, split-karta (3/5/5 skladba testu)
- **Option button** (odpoveď) — stavy: default, hover, vybraté, správne, zle, disabled; s písmenom A–D
- **Bilingválny blok otázky** — originál + preklad pod ním, LTR aj **RTL** variant
- **Glosár ťažkých pojmov** — chip s pojmom (tappable) + rozbalená definícia v rodnom jazyku (LTR/RTL)
- Stat tile (dlaždica štatistiky), KPI riadok
- Cenník box + porovnávacia tabuľka free/full
- Graf úspešnosti (stĺpce), sparkline pokroku
- Progress bar, časomiera (badge, „low" stav), badge „full access"
- Dialóg (modal), toast, FAQ akordeón, jazykový prepínač, odpočet do skúšky
- Feedback panel (správne/zle), disclaimer/honesty blok

---

## 7. Východiskový stav (čo Claude Design dostane)

- Funkčný prototyp: `app/index.html` (DK landing), `app/trainer.html`, `app/trainer.sv.html`, `app/style.css`, `app/landing.css`.
- Existujúci provizórny systém: Dannebrog červená (DK), švédske modrá/žltá zatiaľ nie sú zapracované, dark mode cez `prefers-color-scheme`, komponenty (karty, options, štatistiky, cenník, graf, dialóg, toast, akordeón) už existujú v CSS — treba ich povýšiť na skutočný dizajnový systém a doplniť chýbajúce stránky.

## 8. Priorita pre 1. kolo

1. **Značka + farebný systém + komponentový kit** (základ pre všetko).
2. **Landing SE (A1)** — sem padá reklama, najvyššia obchodná hodnota.
3. **Kvíz + bilingválny blok (B3/B4)** — jadro produktu a naša diferenciácia.
4. **Nákupný lievik (C1–C4)** — kde vzniká príjem.
5. Zvyšok (štatistiky, jazykové varianty, legal, e-maily, ads kreatívy).
