"""Offline testy: parser, úložisko a analytika bez siete.

Používajú umelé HTML v štýle Bazoša + dočasnú SQLite DB, takže overia
celý reťazec logiky (parse -> upsert -> mark deleted -> analyze).
"""

import os
import sys
import tempfile
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from bazos_monitor.parse import parse_listing, is_detail_deleted  # noqa: E402
from bazos_monitor.store import Store  # noqa: E402
from bazos_monitor.analyze import (  # noqa: E402
    analyze, keyphrases, condition_of, analyze_arbitrage, summarize,
)

LISTING_HTML = """
<html><body>
  <div class="inzeraty">
    <div class="inzeratynadpis">
      <a href="/inzerat/111000001/zahradna-hojdacka-nova.php">Záhradná hojdačka nová</a>
      <span class="velikost10">Pridané 15.9. 2026</span>
    </div>
    <div class="inzeratycena">Cena 120 €</div>
  </div>
  <div class="inzeraty">
    <div class="inzeratynadpis">
      <a href="/inzerat/111000002/zahradna-hojdacka-ratanova.php">Záhradná hojdačka ratanová</a>
      <span class="velikost10">Pridané 16.9. 2026</span>
    </div>
    <div class="inzeratycena">Cena 1 250 €</div>
  </div>
  <div class="inzeraty">
    <div class="inzeratynadpis">
      <a href="/inzerat/111000003/travna-kosacka.php">Trávna kosačka Honda</a>
      <span class="velikost10">Pridané 10.9. 2026</span>
    </div>
    <div class="inzeratycena">Cena 300 €</div>
  </div>
</body></html>
"""


def test_parse_listing():
    ads = parse_listing(LISTING_HTML, base_url="https://zahrada.bazos.sk/")
    by_id = {a.ad_id: a for a in ads}
    assert set(by_id) == {"111000001", "111000002", "111000003"}
    assert by_id["111000001"].title == "Záhradná hojdačka nová"
    assert by_id["111000001"].price_eur == 120
    assert by_id["111000002"].price_eur == 1250
    assert by_id["111000001"].posted_date.isoformat() == "2026-09-15"
    assert by_id["111000001"].url == "https://zahrada.bazos.sk/inzerat/111000001/zahradna-hojdacka-nova.php"
    print("test_parse_listing OK")


def test_price_sanity():
    from bazos_monitor.parse import _parse_price
    assert _parse_price("Cena 120 €") == 120
    assert _parse_price("1 250 €") == 1250
    assert _parse_price("74 900 €") == 74900
    # zlepené telefónne číslo/PSČ sa nesmie brať ako cena
    assert _parse_price("Cena 918 949 502 650 €") is None
    print("test_price_sanity OK")


def test_deletion_marker():
    assert is_detail_deleted(200, "... Inzerát bol vymazaný ...") is True
    assert is_detail_deleted(404, "") is True
    assert is_detail_deleted(200, "normálny inzerát Cena 120 €") is False
    print("test_deletion_marker OK")


def test_keyphrases():
    kp = set(keyphrases("Záhradná hojdačka ratanová"))
    assert "hojdacka" in kp
    assert "zahradna hojdacka" in kp
    # stopword/číslo filter
    assert "predam" not in set(keyphrases("Predám hojdačku 2ks"))
    print("test_keyphrases OK")


def test_end_to_end_demand():
    tmp = tempfile.mkdtemp()
    db = os.path.join(tmp, "t.db")
    store = Store(db)

    now = datetime.utcnow()
    # 5x "hojdacka", všetky rýchlo zmazané (krátka životnosť) => vysoký dopyt
    for i in range(5):
        fs = (now - timedelta(days=10 - i)).isoformat()
        store.upsert_listing_ad(
            ad_id=f"H{i}", category="zahrada", title="Záhradná hojdačka",
            url=f"https://x/inzerat/{i}/", price_eur=100, posted_date=None, now_iso=fs,
        )
        # zmaž po ~2 dňoch
        deleted_at = (now - timedelta(days=10 - i) + timedelta(days=2)).isoformat()
        store.mark_deleted(f"H{i}", deleted_at)

    # 5x "kosacka", žiadne zmazanie / dlho visia => nízky dopyt
    for i in range(5):
        fs = (now - timedelta(days=10 - i)).isoformat()
        store.upsert_listing_ad(
            ad_id=f"K{i}", category="zahrada", title="Travna kosacka",
            url=f"https://x/inzerat/k{i}/", price_eur=300, posted_date=None, now_iso=fs,
        )
    store.conn.commit()

    stats = analyze(store, category="zahrada", window_days=30, min_new=3, top=20)
    # hojdačka-cluster (rýchlo mizne) musí prebiť kosačku (nič sa nemaže).
    # Skóre je pri troch hojdačka-kľúčoch rovnaké; poradie medzi nimi je
    # nedeterministické (analyze iteruje set), preto testujeme cluster, nie
    # presný reťazec.
    hojdacka_cluster = {"zahradna", "hojdacka", "zahradna hojdacka"}
    top3 = {s.keyword for s in stats[:3]}
    assert top3 <= hojdacka_cluster, f"hore mali byť len hojdačka-kľúče: {top3}"
    hoj = next(s for s in stats if s.keyword == "hojdacka")
    assert hoj.deleted_count == 5
    assert 1.5 <= hoj.median_lifespan_days <= 2.5
    kos = next(s for s in stats if s.keyword == "kosacka")
    assert hoj.demand_score > kos.demand_score
    store.close()
    print("test_end_to_end_demand OK  (top3:", sorted(top3), ")")


def test_condition_of():
    assert condition_of("Ratanový set NOVÝ nepoužitý") == "new"
    assert condition_of("Ratanový set použitý") == "used"
    assert condition_of("Ratanový set, nová cena 500€") == "unknown"  # 'nová cena' != nový tovar
    assert condition_of("Ratanový set") == "unknown"
    print("test_condition_of OK")


def test_arbitrage_ratan():
    tmp = tempfile.mkdtemp()
    store = Store(os.path.join(tmp, "a.db"))
    now = datetime.utcnow()

    # RATANOVÝ SET: vysoký dopyt (rýchlo mizne), použité ~500€, žiadne lacné nové
    for i in range(8):
        fs = (now - timedelta(days=12 - i)).isoformat()
        store.upsert_listing_ad(
            ad_id=f"R{i}", category="zahrada", title="Ratanovy zahradny set pouzity",
            url=f"https://x/inzerat/r{i}/", price_eur=480 + i * 10, posted_date=None, now_iso=fs,
        )
        store.mark_deleted(f"R{i}", (now - timedelta(days=12 - i) + timedelta(days=2)).isoformat())

    # LACNÝ DOPLNOK: vysoký obrat, ale nízka cena (pod prahom) => vypadne
    for i in range(8):
        fs = (now - timedelta(days=12 - i)).isoformat()
        store.upsert_listing_ad(
            ad_id=f"D{i}", category="zahrada", title="Zahradna hadica pouzita",
            url=f"https://x/inzerat/d{i}/", price_eur=8, posted_date=None, now_iso=fs,
        )
        store.mark_deleted(f"D{i}", (now - timedelta(days=12 - i) + timedelta(days=2)).isoformat())
    store.conn.commit()

    stats = analyze_arbitrage(store, category="zahrada", window_days=30,
                              min_volume=5, min_used_price=100, top=20)
    kws = [s.keyword for s in stats]
    # ratanový set musí byť hore, lacná hadica vôbec (pod prahom ceny)
    assert any("ratan" in k for k in kws), f"ratan chýba: {kws}"
    assert not any("hadica" in k for k in kws), f"lacná hadica sa nemá zobraziť: {kws}"
    top = stats[0]
    assert top.used_median_eur >= 100

    # cenový strop: pridaj drahý traktor (nad strop) -> nesmie sa zobraziť
    for i in range(6):
        fs = (now - timedelta(days=12 - i)).isoformat()
        store.upsert_listing_ad(
            ad_id=f"T{i}", category="stroje", title="Traktor Zetor",
            url=f"https://x/inzerat/t{i}/", price_eur=14000, posted_date=None, now_iso=fs,
        )
    store.conn.commit()
    capped = analyze_arbitrage(store, category=None, window_days=30,
                               min_volume=5, min_used_price=100, top=50,
                               max_used_price=3000)
    assert not any("traktor" in s.keyword or "zetor" in s.keyword for s in capped), \
        "traktor za 14000€ mal byť odfiltrovaný cenovým stropom"
    store.close()
    print("test_arbitrage_ratan OK  (top:", stats[0].keyword,
          f"@ {stats[0].used_median_eur}€, skóre {stats[0].arbitrage_score}; strop OK)")


def test_summarize_kociky():
    tmp = tempfile.mkdtemp()
    store = Store(os.path.join(tmp, "s.db"))
    now = datetime.utcnow()
    window = 10
    # 30/deň x 10 dní = 300 nových kočíkov; 10/deň zmazaných = 100
    idx = 0
    for day in range(window):
        # deň jasne vnútri okna (day dní + 1h dozadu)
        base = now - timedelta(days=day, hours=1)
        for k in range(30):
            fs = base.isoformat()
            title = "Detsky kocik Cybex Priam kombinacia" if k % 2 == 0 else "Kocik Bugaboo"
            store.upsert_listing_ad(
                ad_id=f"K{idx}", category="deti", title=title,
                url=f"https://x/inzerat/{idx}/", price_eur=400 + (k % 5) * 100,
                posted_date=None, now_iso=fs,
            )
            if k < 10:  # 10 z 30 zmaž (krátko po pridaní, stále v okne)
                store.mark_deleted(f"K{idx}", (base + timedelta(minutes=30)).isoformat())
            idx += 1
    store.conn.commit()

    s = summarize(store, category="deti", window_days=window, keyword="kocik", top_products=10)
    assert abs(s.new_per_day - 30.0) < 0.1, s.new_per_day
    assert abs(s.deleted_per_day - 10.0) < 0.1, s.deleted_per_day
    assert s.price_min == 400 and s.price_max == 800
    prods = [p for p, _ in s.top_products]
    assert any("cybex" in p for p in prods), prods
    store.close()
    print("test_summarize_kociky OK  (new/deň:", s.new_per_day,
          "del/deň:", s.deleted_per_day, "top:", s.top_products[0], ")")


def test_crawl_lookback_stops_at_horizon():
    from bazos_monitor.fetch import FetchResult
    from bazos_monitor.crawl import _crawl_category
    from bazos_monitor.categories import ALL_CATEGORIES
    from bazos_monitor.config import Config

    now = datetime.utcnow()
    fresh = now.strftime("%-d.%-m. %Y")
    old = (now - timedelta(days=40)).strftime("%-d.%-m. %Y")

    def card(ad_id, d):
        return (f'<div class="inzeraty"><div class="inzeratynadpis">'
                f'<a href="/inzerat/{ad_id}/vec.php">Vec {ad_id}</a>'
                f'<span>Pridané {d}</span></div>'
                f'<div class="inzeratycena">Cena 100 €</div></div>')

    pages = {
        0: "<html><body>" + "".join(card(1000 + i, fresh) for i in range(3)) + "</body></html>",
        20: "<html><body>" + "".join(card(2000 + i, old) for i in range(3)) + "</body></html>",
        40: "<html><body>" + "".join(card(3000 + i, old) for i in range(3)) + "</body></html>",
    }

    class FakeFetcher:
        def __init__(self): self.fetched = []
        def get(self, url):
            off = 0
            import re as _re
            m = _re.search(r"/(\d+)/$", url)
            if m: off = int(m.group(1))
            self.fetched.append(off)
            return FetchResult(url, 200, pages.get(off, "<html></html>"), ok=True)

    store = Store(os.path.join(tempfile.mkdtemp(), "c.db"))
    cfg = Config(crawl_lookback_days=3, max_pages_per_category=25)
    ff = FakeFetcher()
    _crawl_category(ALL_CATEGORIES["zahrada"], cfg, ff, store, log=lambda *a: None)
    # malo by stiahnuť stranu 0 (fresh) a 1 (old -> za horizontom, stop), nie stranu 2
    assert 0 in ff.fetched and 20 in ff.fetched, ff.fetched
    assert 40 not in ff.fetched, f"nemalo ísť za horizont: {ff.fetched}"
    store.close()
    print("test_crawl_lookback_stops_at_horizon OK  (fetched offsets:", ff.fetched, ")")


def test_parse_subcategories_and_url():
    from bazos_monitor.parse import parse_subcategories, subcat_listing_url
    html = """<html><body>
      <a href="/?hledat=&rubriky=deti&category=120&kitx=ano">Kočíky</a>
      <a href="/?hledat=&rubriky=deti&category=121&kitx=ano">Autosedačky</a>
      <a href="/?rubriky=deti&category=0">Všetko</a>
      <a href="/inzerat/12345/nieco.php">Nejaký inzerát</a>
      <a href="/?hledat=&rubriky=deti&category=120&kitx=ano">Kočíky (dup)</a>
    </body></html>"""
    subs = parse_subcategories(html)
    assert subs == [("120", "Kočíky"), ("121", "Autosedačky")], subs
    u0 = subcat_listing_url("deti.bazos.sk", "deti", "120", 0, 20)
    u1 = subcat_listing_url("deti.bazos.sk", "deti", "120", 1, 20)
    assert "category=120" in u0 and "rubriky=deti" in u0
    assert "/20/?" in u1, u1
    print("test_parse_subcategories_and_url OK")


def test_crawl_subcategories_tags_ads():
    from bazos_monitor.fetch import FetchResult
    from bazos_monitor.crawl import _crawl_with_subcategories
    from bazos_monitor.categories import ALL_CATEGORIES
    from bazos_monitor.config import Config

    now = datetime.utcnow()
    fresh = now.strftime("%-d.%-m. %Y")

    def card(ad_id):
        return (f'<div class="inzeraty"><div class="inzeratynadpis">'
                f'<a href="/inzerat/{ad_id}/x.php">Vec {ad_id}</a>'
                f'<span>Pridané {fresh}</span></div>'
                f'<div class="inzeratycena">Cena 50 €</div></div>')

    main_html = ('<a href="/?rubriky=deti&category=120&kitx=ano">Kočíky</a>'
                 '<a href="/?rubriky=deti&category=121&kitx=ano">Autosedačky</a>')

    class FakeFetcher:
        def get(self, url):
            if "category=120" in url:
                html = "<html><body>" + card(1001) + card(1002) + "</body></html>"
            elif "category=121" in url:
                html = "<html><body>" + card(2001) + "</body></html>"
            else:
                html = "<html><body>" + main_html + "</body></html>"
            return FetchResult(url, 200, html, ok=True)

    store = Store(os.path.join(tempfile.mkdtemp(), "sub.db"))
    cfg = Config(crawl_subcategories=True, crawl_lookback_days=0, max_pages_per_category=1)
    new_c, seen = _crawl_with_subcategories(ALL_CATEGORIES["deti"], cfg, FakeFetcher(), store, log=lambda *a: None)
    rows = {r["ad_id"]: r for r in store.iter_ads("deti")}
    assert rows["1001"]["subcat"] == "Kočíky" and rows["1001"]["subcat_id"] == "120"
    assert rows["2001"]["subcat"] == "Autosedačky"
    assert new_c == 3
    store.close()
    print("test_crawl_subcategories_tags_ads OK  (nové:", new_c, ")")


def test_prune():
    tmp = tempfile.mkdtemp()
    store = Store(os.path.join(tmp, "p.db"))
    now = datetime.utcnow()
    store.upsert_listing_ad(ad_id="new1", category="deti", title="Nove",
                            url="u", price_eur=1, posted_date=None,
                            now_iso=(now - timedelta(days=5)).isoformat())
    store.upsert_listing_ad(ad_id="old1", category="deti", title="Stare",
                            url="u", price_eur=1, posted_date=None,
                            now_iso=(now - timedelta(days=300)).isoformat())
    store.conn.commit()
    n = store.prune_older_than((now - timedelta(days=200)).isoformat())
    assert n == 1
    ids = {r["ad_id"] for r in store.iter_ads("deti")}
    assert ids == {"new1"}, ids
    store.close()
    print("test_prune OK")


def test_freshness_filter():
    tmp = tempfile.mkdtemp()
    store = Store(os.path.join(tmp, "f.db"))
    now = datetime.utcnow()
    # 6 čerstvých (pridané pred 3 dňami) + 6 starých ležiakov (pred 40 dňami)
    for i in range(6):
        fs = (now - timedelta(days=1)).isoformat()
        fresh_posted = (now - timedelta(days=3)).date().isoformat()
        store.upsert_listing_ad(ad_id=f"F{i}", category="zahrada", title="Zahradny gril",
                                url=f"https://x/inzerat/f{i}/", price_eur=200,
                                posted_date=fresh_posted, now_iso=fs)
        old_posted = (now - timedelta(days=40)).date().isoformat()
        store.upsert_listing_ad(ad_id=f"O{i}", category="zahrada", title="Stary lezak vec",
                                url=f"https://x/inzerat/o{i}/", price_eur=200,
                                posted_date=old_posted, now_iso=fs)
    store.conn.commit()

    # bez limitu vidno oboje
    s_all = summarize(store, category="zahrada", window_days=60, top_products=10)
    prods_all = [p for p, _ in s_all.top_products]
    assert any("gril" in p for p in prods_all) and any("lezak" in p for p in prods_all)
    # s limitom 21 dní starý ležiak vypadne
    s_fresh = summarize(store, category="zahrada", window_days=60, top_products=10, max_age_days=21)
    prods_fresh = [p for p, _ in s_fresh.top_products]
    assert any("gril" in p for p in prods_fresh), prods_fresh
    assert not any("lezak" in p for p in prods_fresh), prods_fresh
    store.close()
    print("test_freshness_filter OK")


if __name__ == "__main__":
    test_parse_listing()
    test_price_sanity()
    test_deletion_marker()
    test_keyphrases()
    test_end_to_end_demand()
    test_condition_of()
    test_arbitrage_ratan()
    test_summarize_kociky()
    test_freshness_filter()
    test_crawl_lookback_stops_at_horizon()
    test_parse_subcategories_and_url()
    test_crawl_subcategories_tags_ads()
    test_prune()
    print("\nVŠETKY TESTY PREŠLI")
