#!/usr/bin/env python3
"""Download and parse the officially published Danish citizenship exams.

SIRI (Styrelsen for International Rekruttering og Integration) publishes
every past exam set for indfødsretsprøven and medborgerskabsprøven as PDFs,
including answer keys, via danskogproever.dk / siri.dk. This script:

  1. scrapes the preparation pages for links to exam-set PDFs,
  2. downloads them into ./raw/,
  3. extracts questions (number, text, options A-C) and merges the answer
     key into one questions.json ready for the trainer app.

Usage:
    pip install requests pypdf beautifulsoup4
    python fetch_exams.py            # scrape + download + parse
    python fetch_exams.py --parse-only   # re-parse already downloaded PDFs

NOTE: run this from a network that can reach siri.dk / danskogproever.dk
(the CI sandbox used to build this prototype blocks those domains).
The PDF text layout can drift between years — verify parser output for a
couple of sets before trusting the full bank, and never ship a question
whose answer key did not match up.
"""

import argparse
import json
import re
import sys
from pathlib import Path

import requests

RAW_DIR = Path(__file__).parent / "raw"
OUT_FILE = Path(__file__).parent / "questions.json"

INDEX_PAGES = [
    # Overview pages that link to all published exam sets + answer keys.
    "https://danskogproever.dk/borger/indfoedsretsproeve-statsborgerskab/forberedelse-til-indfoedsretsproeven/",
    "https://danskogproever.dk/borger/medborgerskabsproeve-permanent-ophold/forberedelse-til-medborgerskabsproeven/",
]

# Known direct links (seed list) in case the index page layout changes.
SEED_PDFS = [
    "https://siri.dk/media/szvlnl5x/indfoedsretsproeven-2025-11.pdf",
    "https://siri.dk/media/lwxou1oq/indfoedsretsproeven-2025-05.pdf",
    "https://siri.dk/media/0ajdmdql/indfoedsretsproeven-2024-11.pdf",
]

UA = {"User-Agent": "Mozilla/5.0 (compatible; exam-trainer-ingest/0.1)"}

# "12. Hvornår ...?  A. 1849  B. 1901  C. 1920" across line breaks.
QUESTION_RE = re.compile(
    r"(?P<num>\d{1,2})\.\s+(?P<text>.+?)\s+"
    r"A[.):]\s*(?P<a>.+?)\s+"
    r"B[.):]\s*(?P<b>.+?)\s+"
    r"C[.):]\s*(?P<c>.+?)(?=\s+\d{1,2}\.\s|\s*$)",
    re.DOTALL,
)

# Answer-key lines like "12: B" or "12. B" (facitliste pages/PDFs).
KEY_RE = re.compile(r"(?P<num>\d{1,2})\s*[.:]\s*(?P<letter>[ABC])\b")


def find_pdf_links() -> list[str]:
    try:
        from bs4 import BeautifulSoup  # optional dependency
    except ImportError:
        print("beautifulsoup4 not installed — falling back to seed list only")
        return list(SEED_PDFS)

    links: set[str] = set(SEED_PDFS)
    for page in INDEX_PAGES:
        try:
            html = requests.get(page, headers=UA, timeout=30).text
        except requests.RequestException as exc:
            print(f"WARN: could not fetch {page}: {exc}")
            continue
        soup = BeautifulSoup(html, "html.parser")
        for a in soup.select("a[href]"):
            href = a["href"]
            if href.lower().endswith(".pdf"):
                if href.startswith("/"):
                    href = "https://siri.dk" + href
                links.add(href)
    return sorted(links)


def download(urls: list[str]) -> None:
    RAW_DIR.mkdir(exist_ok=True)
    for url in urls:
        name = url.rsplit("/", 1)[-1]
        dest = RAW_DIR / name
        if dest.exists():
            continue
        print(f"downloading {name}")
        try:
            resp = requests.get(url, headers=UA, timeout=60)
            resp.raise_for_status()
            dest.write_bytes(resp.content)
        except requests.RequestException as exc:
            print(f"WARN: {url}: {exc}")


def pdf_text(path: Path) -> str:
    from pypdf import PdfReader

    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def parse_set(path: Path) -> list[dict]:
    text = pdf_text(path)
    # Answer keys are usually on the last page of the same PDF ("Facitliste")
    # or in a separate PDF; collect whatever keys appear in this document.
    keys = {int(m["num"]): "ABC".index(m["letter"]) for m in KEY_RE.finditer(text)}

    questions = []
    exam_id = path.stem  # e.g. indfoedsretsproeven-2025-11
    for m in QUESTION_RE.finditer(text):
        num = int(m["num"])
        questions.append(
            {
                "id": f"{exam_id}-q{num:02d}",
                "exam": exam_id,
                "num": num,
                "q": re.sub(r"\s+", " ", m["text"]).strip(),
                "opts": [
                    re.sub(r"\s+", " ", m[g]).strip() for g in ("a", "b", "c")
                ],
                "correct": keys.get(num),  # None until key is merged/verified
            }
        )
    return questions


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--parse-only", action="store_true")
    args = ap.parse_args()

    if not args.parse_only:
        download(find_pdf_links())

    all_questions = []
    for pdf in sorted(RAW_DIR.glob("*.pdf")):
        parsed = parse_set(pdf)
        with_key = sum(1 for q in parsed if q["correct"] is not None)
        print(f"{pdf.name}: {len(parsed)} questions, {with_key} with answer key")
        all_questions.extend(parsed)

    unkeyed = [q["id"] for q in all_questions if q["correct"] is None]
    if unkeyed:
        print(f"WARN: {len(unkeyed)} questions missing answer key — "
              "download the matching facitliste PDFs or add keys manually.")

    OUT_FILE.write_text(json.dumps(all_questions, ensure_ascii=False, indent=2))
    print(f"wrote {len(all_questions)} questions -> {OUT_FILE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
