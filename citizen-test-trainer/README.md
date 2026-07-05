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

## What's here

| Path | Purpose |
| --- | --- |
| `app/` | Static exam trainer: practice mode with instant feedback + explanations, and an exam simulator (25 questions / 30 min / pass ≥ 20, matching the real format). No backend needed — open `app/index.html` in a browser. |
| `app/questions.js` | Question bank. Currently a **sample bank** (28 questions authored to match the real format and themes). Replace/extend with real exam sets via the ingest script. |
| `ingest/fetch_exams.py` | Downloads SIRI's published exam PDFs and parses them (questions + answer keys) into `questions.json`. Run from a network that can reach siri.dk (blocked in the sandbox this prototype was built in). |

## Running the app

Open `app/index.html` directly, or serve the folder:

```bash
cd app && python3 -m http.server 8080
```

## Ingesting the real exam sets

```bash
cd ingest
pip install requests pypdf beautifulsoup4
python fetch_exams.py
```

Verify parser output against a couple of PDFs before trusting the bank —
the PDF layout can drift between years. Questions whose answer key did not
match are emitted with `"correct": null` and must not be shipped.

## Productization roadmap (not in prototype)

1. Real question bank from all published sets + AI explanations generated
   per question in 6–8 languages (reviewed once, cached forever).
2. Paywall: first N questions free → one-time purchase (~149 DKK) for full
   access until your exam date. Stripe checkout + magic-link access.
3. SEO pages generated per topic/question theme; ads only around exam dates.
4. Clone for medborgerskabsprøven (same data source), then Norway, then
   Sweden's new test (first sitting August 2026).

*This is not an official service. Exam questions © SIRI — published by the
agency for public preparation; verify licensing terms before commercial use.*
