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
from bazos_monitor.analyze import analyze, keyphrases  # noqa: E402

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
    top_kw = stats[0].keyword
    assert "hojdacka" in top_kw, f"čakal hojdačku hore, dostal {top_kw}"
    hoj = next(s for s in stats if s.keyword == "hojdacka")
    assert hoj.deleted_count == 5
    assert 1.5 <= hoj.median_lifespan_days <= 2.5
    store.close()
    print("test_end_to_end_demand OK  (top segment:", top_kw, ")")


if __name__ == "__main__":
    test_parse_listing()
    test_deletion_marker()
    test_keyphrases()
    test_end_to_end_demand()
    print("\nVŠETKY TESTY PREŠLI")
