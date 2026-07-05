# Citizen Test Trainer 🇩🇰

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
- **Differentiator vs. local competitors:** every answer is explained in the
  student's native language (English, Ukrainian, Polish, Arabic, …) — cheap
  to produce with AI, absent from monolingual Danish incumbents.
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
