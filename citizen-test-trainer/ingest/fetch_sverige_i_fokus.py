#!/usr/bin/env python3
"""Ingest pipeline for the Swedish medborgarskapsprov (samhällskunskap).

Sweden's test is new (first/pilot sitting 15 Aug 2026). UHR has NOT yet
published official questions — it will release *example questions* before
the exam, and the whole test is based on the official study material
"Sverige i fokus" (PDF + audio). This script:

  1. scrapes UHR's medborgarskapsprovet pages for links to the study
     material and any example-question PDFs,
  2. downloads them into ./raw_se/,
  3. parses example questions (4 options, one correct) into questions.json
     once UHR publishes them,
  4. always emits a coverage checklist of the 13 themes so we can see which
     themes our hand-authored bank still under-covers.

Usage:
    pip install requests pypdf beautifulsoup4
    python fetch_sverige_i_fokus.py            # scrape + download + parse
    python fetch_sverige_i_fokus.py --coverage app/questions.sv.js

NOTE: run from a network that can reach uhr.se (blocked in the sandbox this
was built in). Never ship a parsed question whose correct answer could not
be determined — such rows are emitted with "correct": null.
"""

import argparse
import json
import re
import sys
from pathlib import Path

import requests

RAW_DIR = Path(__file__).parent / "raw_se"
OUT_FILE = Path(__file__).parent / "questions.se.json"

INDEX_PAGES = [
    "https://www.uhr.se/medborgarskapsprovet/",
    "https://www.uhr.se/medborgarskapsprovet/om-medborgarskapsprovet/",
    "https://www.uhr.se/medborgarskapsprovet/utbildningsmaterial/",
]

UA = {"User-Agent": "Mozilla/5.0 (compatible; citizenprep-ingest/0.1)"}

# The 13 themes of "Sverige i fokus" — used for the coverage report and to
# tag parsed questions. Keep in sync with app/questions.sv.js themes.
THEMES = [
    "Att komma till Sverige",
    "Att bo i Sverige",
    "Att försörja sig och utvecklas i Sverige",
    "Individens rättigheter och skyldigheter",
    "Att bilda familj och leva med barn i Sverige",
    "Att påverka i Sverige",
    "Sveriges historia",
    "Sveriges styrelseskick",
    "Jämställdhet",
    "Hälsa och vård",
    "Att ta hand om sig själv och andra",
    "Rättssystemet",
    "Sverige och världen",
]

# "12. Fråga ...?  A. ...  B. ...  C. ...  D. ..." across line breaks.
QUESTION_RE = re.compile(
    r"(?P<num>\d{1,2})[.)]\s+(?P<text>.+?)\s+"
    r"A[.):]\s*(?P<a>.+?)\s+"
    r"B[.):]\s*(?P<b>.+?)\s+"
    r"C[.):]\s*(?P<c>.+?)\s+"
    r"D[.):]\s*(?P<d>.+?)(?=\s+\d{1,2}[.)]\s|\s*$)",
    re.DOTALL,
)
KEY_RE = re.compile(r"(?P<num>\d{1,2})\s*[.:]\s*(?P<letter>[ABCD])\b")


def find_pdf_links() -> list[str]:
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        print("beautifulsoup4 not installed — cannot scrape; install it first")
        return []
    links: set[str] = set()
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
                    href = "https://www.uhr.se" + href
                links.add(href)
    return sorted(links)


def download(urls: list[str]) -> None:
    RAW_DIR.mkdir(exist_ok=True)
    for url in urls:
        dest = RAW_DIR / url.rsplit("/", 1)[-1]
        if dest.exists():
            continue
        print(f"downloading {dest.name}")
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


def parse_examples(path: Path) -> list[dict]:
    text = pdf_text(path)
    keys = {int(m["num"]): "ABCD".index(m["letter"]) for m in KEY_RE.finditer(text)}
    out = []
    for m in QUESTION_RE.finditer(text):
        num = int(m["num"])
        out.append(
            {
                "id": f"{path.stem}-q{num:02d}",
                "source": path.stem,
                "q": re.sub(r"\s+", " ", m["text"]).strip(),
                "opts": [re.sub(r"\s+", " ", m[g]).strip() for g in ("a", "b", "c", "d")],
                "correct": keys.get(num),  # None until a key is available/verified
            }
        )
    return out


def coverage_report(bank_js: Path) -> None:
    """Count our authored questions per theme so we can see gaps."""
    text = bank_js.read_text(encoding="utf-8")
    counts = {th: len(re.findall(re.escape(f'theme: "{th}"'), text)) for th in THEMES}
    print(f"\nCoverage of {bank_js.name} across the 13 Sverige i fokus themes:")
    for th in THEMES:
        n = counts[th]
        flag = "  " if n >= 2 else "⚠ "
        print(f"  {flag}{n:2d}  {th}")
    thin = [th for th, n in counts.items() if n < 2]
    if thin:
        print(f"\n{len(thin)} theme(s) with < 2 questions — author more before launch.")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--parse-only", action="store_true")
    ap.add_argument("--coverage", metavar="BANK_JS", help="print theme coverage of a bank and exit")
    args = ap.parse_args()

    if args.coverage:
        coverage_report(Path(args.coverage))
        return 0

    if not args.parse_only:
        links = find_pdf_links()
        if not links:
            print("No PDF links found yet — UHR has likely not published example "
                  "questions. The study material 'Sverige i fokus' and example "
                  "questions will appear on uhr.se before the exam.")
        download(links)

    all_q = []
    for pdf in sorted(RAW_DIR.glob("*.pdf")):
        parsed = parse_examples(pdf)
        keyed = sum(1 for q in parsed if q["correct"] is not None)
        print(f"{pdf.name}: {len(parsed)} example questions, {keyed} with a key")
        all_q.extend(parsed)

    if all_q:
        OUT_FILE.write_text(json.dumps(all_q, ensure_ascii=False, indent=2))
        print(f"wrote {len(all_q)} questions -> {OUT_FILE}")
    else:
        print("No example questions parsed yet — nothing written.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
