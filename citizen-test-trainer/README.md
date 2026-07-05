# CitizenPrep 🇩🇰

Domains: **citizenprep.dk** (primary), citizenprep.se + citizenprep.no
(reserved for expansion), citizenprep.com (redirect, if available).

Prototype of a fully automated exam-prep business: training for the Danish
citizenship tests (**indfødsretsprøven** — citizenship, and
**medborgerskabsprøven** — permanent residency), with explanations in the
student's own language.

## Why this niche

- **Official public dataset.** SIRI publishes *every* past exam 2010–2025 as
  PDFs with answer keys (siri.dk / danskogproever.dk), plus the official
  learning material for free. We train people on real exam data — no
  guessing what will be on the test.
- **Highly motivated buyers.** The stakes are citizenship / permanent
  residency; candidates pay for preparation without hesitation.
- **Perfect ad timing.** Exams run twice a year — Google Ads spike for
  6–8 weeks before each sitting, SEO carries the rest of the year.
- **Differentiator vs. local competitors:** the Danish question is shown
  with a native-language translation *right underneath it*, and every answer
  is explained in the student's language — cheap to produce with AI, absent
  from monolingual Danish incumbents.

  **Language priority** is driven by who actually takes the test. Recent top
  nationalities granted Danish citizenship include Germany, UK, Iran,
  Ukraine and India, with large established groups from Syria, Turkey,
  Afghanistan, Iraq, Pakistan, Poland and Romania. Since German/UK applicants
  are comfortable in English, the *translation* feature matters most for:
  **Arabic, Farsi, Ukrainian, Turkish**, then Polish, Romanian, Somali, Urdu.
  (Source: Integrationsbarometer / Danmarks Statistik.)
- **Expansion path:** same engine for Norway (statsborgerprøven — official
  demo tests + public curriculum) and Sweden (brand-new medborgarskapsprov,
  first sitting August 2026 — greenfield market).

## Architecture

```
app/      static frontend (vanilla JS, no build step)
server/   Express API + static hosting + Stripe checkout
ingest/   pipeline that turns SIRI's published exam PDFs into the bank
```

### Frontend (`app/`)

- **Practice mode** — instant feedback, explanations in EN/UK/PL (selector),
  filterable by topic.
- **Mistake review** — re-drills only the questions you got wrong.
- **Exam simulator** — real format: 25 questions / 30 min / pass ≥ 20.
  Free users get a 10-question demo exam instead.
- **Freemium gating** — free bank = first 10 questions; full bank unlocks
  via the API entitlement (`/api/access`). Works as a pure static site too
  (falls back to free mode when no backend answers).
- Progress stats (answered, accuracy, weakest topic, last exam) in
  localStorage; UI in Danish/English; keyboard shortcuts (A/B/C, Enter);
  dark mode via `prefers-color-scheme`.

### Backend (`server/`)

- `POST /api/checkout` — Stripe Checkout session. **Dev mode** (no
  `STRIPE_SECRET_KEY` set): grants access instantly and returns the token,
  so the whole funnel is testable without a Stripe account.
- `POST /api/stripe-webhook` — marks the buyer paid on
  `checkout.session.completed` (signature-verified).
- `GET /api/claim?session_id=` — success-URL fallback: verifies payment
  with Stripe and redirects to `/?token=…` (covers webhook delays).
- `GET /api/access?token=` — entitlement check used by the app on load.
- `POST /api/login` — magic-link re-login for returning buyers.
- Storage: `db.json` (prototype). Swap for SQLite/Postgres before launch.

```bash
cd server
npm install
cp .env.example .env   # optionally add Stripe keys
npm start              # serves app + API on :8080
```

Storage is SQLite (built-in `node:sqlite`, no dependency): users, funnel
events and Stripe idempotency records in `server/data.sqlite`. The Stripe
webhook is idempotent, checkout/login/event endpoints are rate-limited, and
`/robots.txt` + `/sitemap.xml` are served from `PUBLIC_URL`.

### Tests

```bash
cd citizen-test-trainer
npm --prefix server ci   # install server deps once
npm test                 # validates both question banks + 13 API tests
```

CI runs the same on every push (`.github/workflows/ci.yml`).

### Deploy

```bash
docker build -f server/Dockerfile -t citizenprep .
docker run -p 8080:8080 -v cp-data:/data \
  -e PUBLIC_URL=https://citizenprep.se \
  -e STRIPE_SECRET_KEY=sk_live_... -e STRIPE_WEBHOOK_SECRET=whsec_... \
  -e EMAIL_PROVIDER=postmark -e EMAIL_API_KEY=... \
  -e METRICS_TOKEN=... citizenprep
```

On a non-localhost `PUBLIC_URL`, the server warns loudly about any missing
production config (Stripe keys, webhook secret, email provider, metrics
token) so it never silently runs live with dev-mode payments.

### Funnel metrics

`GET /api/metrics` (guard with `METRICS_TOKEN`) returns counts per event —
`page_view`, `session_start`, `paywall_open`, `checkout_submit`, `purchase`
— the conversion data the paid-acquisition model depends on.

### Ingest (`ingest/`)

```bash
cd ingest
pip install requests pypdf beautifulsoup4
python fetch_exams.py
```

Downloads SIRI's published exam PDFs and parses questions + answer keys
into `questions.json`. Run from a network that can reach siri.dk (the
sandbox this prototype was built in blocks it). Verify parser output
against a couple of PDFs before trusting the bank — questions with
`"correct": null` (unmatched answer key) must not be shipped.

## Question bank status

`app/questions.js` currently holds a **28-question sample bank** authored
to match the real format and the official learning-material themes.
Replace/extend with real exam sets via the ingest script, then generate
explanations per question (translate once, review once, cache forever).

Each question can carry a `tr` field with per-language translations of the
question text and options, e.g.:

```js
tr: {
  uk: { q: "…", opts: ["…", "…", "…"] },
  ar: { q: "…", opts: ["…", "…", "…"] }   // rendered right-to-left
}
```

The app shows the Danish original with this translation underneath (a
comprehension aid — Danish stays primary because the real exam is in
Danish). RTL languages (ar/fa/ur) render right-aligned automatically. The
sample bank includes Ukrainian for the first ~10 questions and Arabic for a
few, to demonstrate; the translation pipeline fills the rest.

## Launch checklist

- [ ] Run ingest on the full SIRI archive; merge + verify answer keys
- [ ] Generate explanations for all questions (EN/UK/PL/AR), spot-check
- [ ] Buy domain, deploy server (any small VPS / Fly.io / Railway)
- [ ] Create Stripe account + price (149 DKK), set env vars, test webhook
- [ ] Transactional email (Postmark/Resend) for magic links — TODOs marked
      in `server/server.js`
- [ ] Privacy policy + terms (GDPR: we store email + purchase only)
- [ ] SEO topic pages generated from the bank; Google Ads around exam dates
- [ ] Clone for medborgerskabsprøven, then Norway, then Sweden (Aug 2026)

*This is not an official service. Exam questions © SIRI — published by the
agency for public preparation; verify licensing terms before commercial use.*
