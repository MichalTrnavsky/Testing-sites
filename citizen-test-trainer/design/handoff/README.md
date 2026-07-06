# Handoff: CitizenPrep — Landing SE + Multilingual (AR/RTL) + Purchase Funnel

## Overview
CitizenPrep is an online trainer for Sweden's mandatory citizenship test (**medborgarskapsprovet**, samhällskunskap — first exam 15 Aug 2026, ~60 questions / 90 min / 4 options). The audience is **immigrants applying for citizenship**: highly motivated, often **non-native** Swedish speakers, mostly on **mobile**, arriving from **paid ads (Google Ads)**. The differentiator is: the Swedish question **plus a translation into the user's native language directly beneath it** (including **RTL** for Arabic/Farsi).

This package covers **Round 1** of the design:
1. **Landing SE (A1)** — the primary conversion surface where paid traffic lands.
2. **Landing AR (RTL)** — the Arabic, fully mirrored (right-to-left) variant of the landing.
3. **Purchase funnel (C1–C4)** — checkout → payment result → magic-link login, where revenue is created.
4. **App (logged-in product)** — dashboard, practice quiz, exam simulator, results, statistics, account — the product the user gets after paying.

Chosen visual direction: **"1c — Direkt produkt"** (bold, product-in-hero, high contrast). Two other explored directions live in `_reference_3_variants.dc.html` (1a data-forward, 1b editorial/honest) for context only.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing the intended look and behavior. They are **not production code to copy directly**. The task is to **recreate these designs in the target codebase's environment** (the existing prototype is HTML/CSS/JS in `app/`; if you move to React/Vue/Svelte/etc., use that stack's established patterns). Treat the HTML as the source of truth for **layout, spacing, color, type, copy, states, and interactions** — then implement with the app's real data, i18n system, routing, and payment provider.

> The `.dc.html` files are authored in a lightweight component runtime (`support.js`). To preview them, open a file from **this folder** (support.js is included) in a browser. You do **not** need that runtime in production — read the rendered markup/inline styles as a spec.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, shadows, copy, and interaction states are all specified. Recreate the UI pixel-accurately using the codebase's libraries. All copy is **production-ready** (Swedish and Arabic).

---

## Design Tokens

### Color
| Token | Hex | Use |
|---|---|---|
| `brand-blue` | `#005293` | Primary brand color, hero bg, headings-on-light accents, links |
| `brand-blue-dark` | `#003D6E` | Hover on blue surfaces |
| `blue-tint` | `#EAF1F8` | Chips, info panels, explanation strip |
| `blue-tint-2` | `#F7FAFD` | Highlighted comparison column |
| **`action-yellow`** | **`#FECC02`** | **THE single conversion color — every CTA button** |
| `on-yellow` | `#005293` | Text/icon on yellow buttons |
| `ink` | `#0F1722` | Primary text, dark bands |
| `ink-footer` | `#0B1119` | Footer bg |
| `muted-1` | `#56616E` | Body secondary text |
| `muted-2` | `#7A8595` | Captions, helper text |
| `muted-3` | `#8A94A2` | Footer text, faint labels |
| `hairline` | `#E5E9EE` | Card borders |
| `hairline-2` | `#EEF1F4` | Section dividers, table row borders |
| `surface-tint` | `#F6F8FA` | Alternating section background |
| `field-bg` | `#F3F5F8` | Muted answer chips |
| `success` | `#16A34A` | Correct-answer state, payment success |
| `success-bg` | `#EFFAF3` | Correct-answer / success background |
| `white` | `#FFFFFF` | Page/base |

Semantic accents that are **not** part of the conversion path (keep distinct from yellow): success green (quiz correctness + payment success), and a warm `#FDF3E7` for the neutral "cancelled" state.

### The single-color conversion rule (critical for conversion)
There is **exactly one action color: yellow (`#FECC02`, text `#005293`)**. Every primary CTA across every page and screen uses it — nav "Börja gratis", hero, pricing "Köp full tillgång", final CTA, sticky mobile bar, and the "Betala"/"Skicka länk" funnel buttons. **Never** render a primary CTA in another color. Secondary actions are **ghost** buttons only (white bg, `#CBD9E6` border, `#005293` text). This trains the user's eye that "yellow = the next step".

### Typography
- **Display / headings:** `Space Grotesk` (700). Letter-spacing `-0.02em` to `-0.03em`.
- **Body / UI:** `Hanken Grotesk` (400/500/600/700).
- **Arabic UI:** `Noto Kufi Arabic`. **Arabic question text:** `Noto Naskh Arabic` (also used for inline Arabic snippets in the SV page).
- **Scale (fluid):** h1 `clamp(40px,6.2vw,62px)` · h2 `clamp(30px,4.6vw,42px)` · section eyebrow 13px uppercase `letter-spacing:0.12em` · body 16–17px · small 13–14px · line-height body 1.55–1.7.

### Spacing / layout
- Content container `max-width: 1120px`, side padding `24px`.
- Section vertical padding `clamp(52px, 7vw, 84px)`.
- Card gaps `16–20px`. Grid: `repeat(auto-fit, minmax(…, 1fr))` for facts/why/tips.
- **Radii:** buttons `10–13px` · inputs `11px` · cards `16–22px` · pills `999px`.
- **Shadows:** hero product card `0 40px 80px -30px rgba(0,0,0,.55)` · section cards `0 24–30px 60–70px -34/-40px rgba(15,23,34,.35–.4)` · sticky bar `0 -8px 24px -16px rgba(15,23,34,.3)`.

### Logo mark
Rounded square (`28px`, radius `8px`), bg `#005293`, glyph **"C"** in `#FECC02`, Space Grotesk 700. No state emblems, no flag imagery (legal requirement — must not look like an official authority).

---

## Screens / Views

### 1. Landing SE — `CitizenPrep Landing SE (1c).dc.html`
Full-width, fluid, mobile-first single page. Section order (this order is the funnel — keep it):

1. **Announcement bar** (dismissible concept; toggled by `showAnnouncement` prop). Dark `#0F1722`, exam-date hook with yellow highlight.
2. **Sticky nav** (`position: sticky`, blurred white). Logo · links (Varför oss / Så ser det ut / Priser / FAQ) · language switch (🌐 Språk) · yellow "Börja gratis" CTA.
3. **Hero** — blue `#005293` band. Left: eyebrow pill, H1 "Öva på riktiga **provfrågor**." (last word yellow), English italic subline, promise paragraph, **yellow "Börja gratis →"** + ghost "Se en fråga", microtrust "✓ 20 frågor per dag gratis · inget kort". Right: **product card** (the bilingual question, tilted `rotate(1.4deg)`) — shows Swedish question + Arabic translation (RTL) + A/B/C options with A marked correct green. Toggled by `showHeroProduct` prop.
4. **Facts strip** — yellow `#FECC02` band, 4 stats: 60 / 90 / 4 / 8+ språk.
5. **SEO content** — "Vad är medborgarskapsprovet 2026?" 3 keyword-rich paragraphs (definition, topics, value). Important for SEO; keep as real crawlable copy.
6. **Why us — comparison table** ("Det andra appar inte gör"). 3-col grid `1.6fr 1fr 1fr`: feature | **Andra appar** (generic, no real brand names) | **CitizenPrep** (highlighted `#F7FAFD` column, blue header). 5 rows (translation/RTL, provsimulator, statistics, mobile, honesty) with ✕ (muted circle) vs ✓ (blue circle). Footer row ends with a yellow "Börja gratis" CTA.
7. **Bilingual example** ("Så ser en fråga ut") — language pill row (العربية active, فارسی/Українська/Türkçe/English), then the full question card: Swedish question, Arabic translation (RTL, Naskh), 4 options (A correct/green), blue explanation strip with inline Arabic.
8. **Proof + sources** ("Vi hittar inte på siffror") — honest framing that Sweden's exam is new; shows **Danish sister-exam** pass-rate bar chart (47/55/62%) as reference + "Öppna källor" list (Skolverket / UHR / SIRI Danmark).
9. **Honesty band** — dark `#0F1722`, big quote: no app can guarantee you pass; "vi är inte en myndighet".
10. **5 study tips** — numbered cards 01–05.
11. **Pricing** — Free (0 kr, ghost CTA) vs **Full tillgång** (299 kr, blue-bordered, "Rekommenderas" badge, yellow "Köp full tillgång"). Trust line: säker betalning · 14 dagars ångerrätt · ingen förnyelse.
12. **FAQ** — native `<details>/<summary>` accordion, 5 Q&As (mirrored in JSON-LD).
13. **Final CTA** — blue band, yellow "Börja gratis →".
14. **Footer** — dark `#0B1119`, links + legal disclaimer (independent study service, not affiliated with SIRI/UHR, no guarantees).
15. **Sticky bottom conversion bar** — `position: fixed`, always visible, yellow CTA. Persistent mobile conversion nudge.

### 2. Landing AR (RTL) — `CitizenPrep Landing AR (RTL).dc.html`
Same structure and funnel as Landing SE, fully **mirrored (`dir="rtl"`)** and translated to Arabic. Notes:
- Root wrapper `dir="rtl" lang="ar"`; runtime also sets `document.documentElement.dir='rtl'`, `lang='ar'`.
- **The question itself stays Swedish** and is force-set `dir="ltr"` inside the RTL layout (the exam is in Swedish); the **explanation/translation is Arabic** in Naskh. Answer option labels (Regeringsformen, etc.) stay Swedish with `dir="ltr"`.
- Badges/positioning flip (e.g. "Rekommenderas" badge moves to the left; ✓ uses `margin-right:auto`).
- CTAs identical yellow system. Arabic JSON-LD FAQ included.
- This is the template for the other language variants (UK/TR/FA/EN) — same skeleton, swap the translation layer.

### 3. Purchase funnel — `CitizenPrep Nakupny lievik.dc.html`
Interactive prototype in a phone frame. **This is where the paid ad's "Full tillgång" intent converts.** State machine (see below). Review chips under the phone jump to any screen.

- **C1 · Kassa (checkout):** "Slutför ditt köp". Order-summary card (Full tillgång / 299 kr / engångsbetalning + included list). **Email field** ("Hit skickar vi kvitto och din inloggningslänk"). **Payment method** segmented control: Kort / Swish / Klarna — each reveals its own fields (card number+MM/ÅÅ+CVC / mobile number / Klarna info). Yellow **"Betala 299 kr"**. Trust row (🔒 Krypterad · 14 dagars ångerrätt · Ingen förnyelse) + legal microcopy.
- **Processing:** spinner ("Behandlar betalning…"), auto-advances after ~1.5s.
- **C2 · Klart (success):** green check, "Betalningen lyckades!", full-access confirmation, **magic-link** explanation to the entered email, yellow "Börja plugga nu →" → app welcome placeholder. "Ett kvitto är på väg."
- **App welcome** (post-success placeholder): 3 mode cards (Öva fritt / Provsimulator / Din statistik).
- **C3 · Avbrutet (cancelled):** neutral "🤔 Betalningen avbröts", reassurance nothing was charged, yellow "Försök igen" + ghost "Fortsätt gratis" (exit-rescue back to free tier).
- **C4 · Logga in (magic-link):** email → yellow "Skicka inloggningslänk" → **"Kolla din inkorg"** confirmation with the email + 30-min validity + resend. No passwords anywhere.

### 4. App (logged-in product) — `CitizenPrep App.dc.html`
Interactive prototype in a phone frame with a **bottom tab bar** (Hem / Träna / Prov / Statistik / Konto) plus jump-chips above the phone. This is the product delivered after purchase. Top bar is persistent: logo · streak pill (🔥 12 dagar) · avatar. Screens:

- **Dashboard (B / home):** greeting "Hej Amir 👋"; **readiness ring** (68% via `conic-gradient`, yellow arc on blue card); **exam countdown** card (15 aug 2026 · 40 dagar kvar); primary yellow **"Fortsätt träna →"**; two ghost shortcuts (Provsimulator / Min statistik); **topic list** with per-topic progress bars, weakest topic flagged "svag" (Arbete & ekonomi 38%). Bars color-coded: green ≥80%, blue mid, amber = weak.
- **Practice / quiz (B3):** back button + top progress bar + "n/10"; topic label + language toggle (🌐 عربى). **Question in Swedish** + **Arabic translation** (RTL, Naskh) in a tinted box. 4 tappable options. On select → correct turns **green (✓)**, a wrong pick turns **red (✕)** while the correct one still highlights green; an **explanation card** (Swedish + Arabic) appears; yellow **"Nästa fråga →"** (or "Se resultat" on the last). 3 real seeded questions cycle. **This screen is fully interactive** — it's the core learning loop; implement against real question data with the same answer/explanation states.
- **Exam intro (B4):** "Provsimulator" — real-conditions explainer, spec table (60 frågor / 90 min / ~72% ref / översättning på), warning "Du kan inte pausa", yellow **"Starta provet"**. (The timed 60-question run itself reuses the quiz component with a countdown and feedback suppressed until the end — noted for build, not separately mocked.)
- **Results (B5):** big score ring (78% · 47/60, green ≥ pass), "Godkänt-nivå" badge, **per-topic breakdown** bars, yellow "Träna på dina svaga ämnen" + ghost "Till dashboard".
- **Statistics (B6):** 4 stat tiles (besvarade frågor / rätt i snitt / streak / provsimulatorer), **readiness-over-time** bar chart (6 weeks, last bar highlighted), and a **"Fokusera här"** weak-topic callout with a yellow train-CTA. Reinforces the "spend time where you lose points" study model.
- **Account (C5):** profile card (name + email), **plan card** ("Full tillgång · Aktiv", purchase date), settings list (translation language, reminders toggle, exam date, receipt & payment), help/FAQ, log out (red), and the standing legal disclaimer (not a myndighet, no guarantees).

Data the app needs in production: user profile, entitlement/plan, question bank with per-language translations + explanations, per-question answer log, per-topic mastery aggregation, readiness score model, streak counter, exam-simulator sessions, exam-date setting for the countdown.

---

## Interactions & Behavior
- **FAQ:** native `<details>`; the "+" glyph rotates 45° when open (`details[open] .faq-plus { transform: rotate(45deg) }`), 0.2s.
- **Sticky nav** (`showAnnouncement`/`stickyNav`/`showHeroProduct` are design toggles → in production these are layout decisions, not necessarily runtime props).
- **Sticky bottom bar:** fixed, always present on landing.
- **Hero product card:** static `rotate(1.4deg)` tilt.
- **Buttons:** `.cta` yellow → hover `filter: brightness(0.94)`, active `translateY(1px)`. `.ghost` → hover bg `#EAF1F8`. Inputs → focus border `#005293`.
- **Funnel `pay()`:** set `screen='processing'` → `setTimeout(1500ms)` → `screen='success'`. Replace the timeout with the real payment-provider callback.
- **Smooth scroll** on in-page anchor nav.
- All animations respect a calm, non-flashy tone (the audience must trust us — no scammy motion).

## State Management (purchase funnel)
```
state = { screen, method, email }
screen ∈ { 'buy', 'processing', 'success', 'app', 'cancel', 'login', 'loginsent' }
method ∈ { 'card', 'swish', 'klarna' }
email  = controlled input string
```
Transitions: `buy --pay--> processing --(1.5s)--> success --goApp--> app`; `* --review chips--> any`; `cancel --Försök igen--> buy`, `cancel --Fortsätt gratis--> app`; `login --Skicka länk--> loginsent --Skicka igen--> login`.
Data needs in production: create order (299 kr SEK, one-time), capture email, call payment provider (card/Swish/Klarna), on success create account + send magic-link email + receipt; magic-link verify → session.

## Internationalization & RTL
- Build with a real i18n layer; **do not assume English/Swedish string lengths** (German is long, Cyrillic for Ukrainian, Arabic script). Layout uses fluid `clamp()` + `flex-wrap` so long strings reflow.
- **RTL:** mirror the entire layout via `dir="rtl"` at the document root (CSS logical properties preferred — `margin-inline`, `padding-inline`, `inset-inline` — instead of hard left/right). Arabic + Farsi = RTL.
- **Mixed direction rule:** the Swedish exam question and Swedish answer labels are always `dir="ltr"` islands even inside an RTL page; the native-language translation/explanation follows page direction.
- Languages named in UI: Arabic, Farsi, Ukrainian, Turkish, English, Polish (8+ claimed).

## SEO (implemented in Landing SE + AR — keep in production)
- `<title>`, `<meta name="description">`, Open Graph (`og:type/locale/title/description/site_name`).
- `<link rel="canonical">` + **`hreflang`** alternates (`sv`, `ar`, `uk`, `en`, `x-default`).
- **JSON-LD:** `FAQPage` (matches the visible FAQ) and `WebApplication` (with `offers` 0 kr / 299 kr). AR page has Arabic `FAQPage`.
- Semantic HTML: `<header>/<main>/<section aria-labelledby>/<footer>`, single `<h1>`, ordered `h2`→`h3`. The "Vad är medborgarskapsprovet 2026?" block is real crawlable content (long-tail SEO). Keep language-variant landings (A3) on this same skeleton for cheaper keywords.
- Performance: fast load matters (expensive ad clicks) — inline critical styles, preconnect fonts, defer non-critical JS.

## Accessibility (WCAG AA target)
- Contrast: yellow `#FECC02` + text `#005293` and blue `#005293` + white both pass AA for the sizes used. Body `#56616E` on white passes AA.
- Tap targets ≥ 44px (buttons, option rows, chips are sized accordingly).
- Visible focus states on inputs; use real `<label>`/`<button>`/`<input>` semantics (already used).
- Readable for non-native speakers and older users: generous sizes, plain language, translation support.

---

## Conversion & UX rationale (grounded in funnel/edtech case studies)
The brief asked for a design based on real funnel-website patterns. Decisions and their sources:

- **Proof over promises (Babbel / edtech playbook):** stats strip, a real reference pass-rate chart, and an **honest disclaimer** instead of fake guarantees. For a spam-filled niche and cold paid traffic, credibility is the conversion lever — so honesty is a *feature*, placed prominently, not hidden.
- **Show the product above the fold (Duolingo / Grammarly):** the bilingual question card is in the hero. The core differentiator (native-language translation + RTL) is demonstrated, not described.
- **One-color conversion path (high-converting SaaS convention):** a single, reserved CTA color removes decision friction and guides the eye through the funnel.
- **"Us vs them" comparison table:** classic differentiation pattern to justify paying vs. free/PDF alternatives — answers "why you, not Google" at the point of doubt.
- **Persistent mobile CTA (m-commerce standard):** sticky bottom bar keeps the primary action one tap away for a mobile-first, ad-sourced audience.
- **Low-friction checkout (Stripe checkout principles):** single dialog, **email-first**, local Swedish payment methods (Swish/Klarna) alongside card, minimal fields → higher completion. Anchor 299 kr against the cost of re-sitting the exam.
- **Magic-link auth (Slack / Notion):** passwordless reduces return-login friction for users who may juggle multiple languages/devices.
- **Exit-rescue on cancel:** abandoning users are routed back to the free tier instead of lost — recovers otherwise-wasted ad spend.

---

## Assets
- **Fonts:** Google Fonts — Space Grotesk, Hanken Grotesk, Noto Kufi Arabic, Noto Naskh Arabic. Self-host in production for performance/GDPR.
- **Imagery:** none required. Icons are emoji placeholders (🗣️ ⏱️ 📊 🤝 💳 📱 ✉️) — **replace with a restrained, trustworthy icon set** (e.g. a single-weight line set); do not use cheap stock flags. The logo "C" mark is CSS, not an image.
- **No brand/state assets** may be used (legal): no Swedish/Danish coats of arms, no "gov" visuals.

## Files
| File | What it is |
|---|---|
| `CitizenPrep Landing SE (1c).dc.html` | Primary Swedish landing (chosen direction 1c) — hifi spec |
| `CitizenPrep Landing AR (RTL).dc.html` | Arabic, fully RTL landing — template for other languages |
| `CitizenPrep Nakupny lievik.dc.html` | Interactive purchase funnel C1–C4 (checkout → success → cancel → magic-link) |
| `CitizenPrep App.dc.html` | Interactive logged-in app: dashboard, quiz, exam intro, results, statistics, account |
| `_reference_3_variants.dc.html` | The 3 explored hero/funnel directions (1a/1b/1c) — context only |
| `ORIGINAL_BRIEF.md` | The original product brief (page inventory, component kit, priorities) |
| `support.js` | The prototype runtime (only needed to preview the .dc.html files locally) |

## Not yet designed (from the brief, for planning)
Account sub-pages beyond the main screen (detailed receipt/payment history, edit profile), email templates (C6: receipt, magic-link, "provet om X dagar" reminder), legal pages (D1–D5), growth assets (OG images, ad creatives, PWA icon), and the DK (red `#C8102E`) country theme on the same skeleton. The token system + component patterns above are designed to extend to all of these.
