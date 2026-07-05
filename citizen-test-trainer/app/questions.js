// Question bank for the indfødsretsprøven trainer.
//
// SOURCE STATUS: sample bank. Questions below are authored to match the real
// exam format (25 questions, 3 options, pass >= 20) and the themes of SIRI's
// official læremateriale. Before launch, replace/extend this bank with the
// real published exam sets via ingest/fetch_exams.py (SIRI publishes all
// past exams 2010-2025 with answer keys).
//
// Schema: { id, theme, q (danish), opts [3], correct (0-2), expl: {en, uk, pl} }

window.QUESTION_BANK = [
  {
    id: "s001",
    theme: "Demokrati og grundloven",
    q: "Hvilket år fik Danmark sin første grundlov?",
    opts: ["1849", "1901", "1920"],
    correct: 0,
    expl: {
      en: "Denmark's first constitution (Grundloven) was signed on 5 June 1849, ending absolute monarchy.",
      uk: "Перша конституція Данії (Grundloven) була підписана 5 червня 1849 року, що поклало край абсолютній монархії.",
      pl: "Pierwsza konstytucja Danii (Grundloven) została podpisana 5 czerwca 1849 r., kończąc monarchię absolutną."
    }
  },
  {
    id: "s002",
    theme: "Demokrati og grundloven",
    q: "Hvor mange medlemmer har Folketinget?",
    opts: ["159", "179", "199"],
    correct: 1,
    expl: {
      en: "The Danish parliament (Folketinget) has 179 members, including 2 from the Faroe Islands and 2 from Greenland.",
      uk: "Данський парламент (Folketinget) має 179 членів, зокрема 2 від Фарерських островів і 2 від Гренландії.",
      pl: "Duński parlament (Folketinget) liczy 179 członków, w tym 2 z Wysp Owczych i 2 z Grenlandii."
    }
  },
  {
    id: "s003",
    theme: "Demokrati og grundloven",
    q: "Hvor gammel skal man være for at kunne stemme til folketingsvalg?",
    opts: ["16 år", "18 år", "21 år"],
    correct: 1,
    expl: {
      en: "The voting age in Denmark is 18, the same as the age of legal majority.",
      uk: "Виборчий вік у Данії — 18 років, як і вік повноліття.",
      pl: "Wiek uprawniający do głosowania w Danii to 18 lat, tyle samo co wiek pełnoletności."
    }
  },
  {
    id: "s004",
    theme: "Demokrati og grundloven",
    q: "Hvor ofte skal der senest afholdes valg til Folketinget?",
    opts: ["Hvert 3. år", "Hvert 4. år", "Hvert 5. år"],
    correct: 1,
    expl: {
      en: "Parliamentary elections must be held at least every four years, but the prime minister can call them earlier.",
      uk: "Парламентські вибори мають відбуватися щонайменше кожні чотири роки, але прем'єр-міністр може оголосити їх раніше.",
      pl: "Wybory parlamentarne muszą odbywać się co najmniej co cztery lata, ale premier może je rozpisać wcześniej."
    }
  },
  {
    id: "s005",
    theme: "Demokrati og grundloven",
    q: "Hvad kaldes Danmarks styreform?",
    opts: ["Republik", "Konstitutionelt monarki", "Absolut monarki"],
    correct: 1,
    expl: {
      en: "Denmark is a constitutional monarchy: the monarch is head of state, but power is exercised by elected bodies under the constitution.",
      uk: "Данія — конституційна монархія: монарх є главою держави, але влада здійснюється виборними органами згідно з конституцією.",
      pl: "Dania jest monarchią konstytucyjną: monarcha jest głową państwa, ale władzę sprawują organy wybieralne zgodnie z konstytucją."
    }
  },
  {
    id: "s006",
    theme: "Demokrati og grundloven",
    q: "Hvor holder Folketinget til?",
    opts: ["Amalienborg", "Christiansborg", "Rosenborg"],
    correct: 1,
    expl: {
      en: "Folketinget sits at Christiansborg Palace in Copenhagen, which also houses the Supreme Court and the Prime Minister's Office.",
      uk: "Folketinget засідає в палаці Крістіансборг у Копенгагені, де також розташовані Верховний суд і офіс прем'єр-міністра.",
      pl: "Folketing obraduje w pałacu Christiansborg w Kopenhadze, gdzie mieszczą się też Sąd Najwyższy i kancelaria premiera."
    }
  },
  {
    id: "s007",
    theme: "Demokrati og grundloven",
    q: "Hvem kontrollerer, at de offentlige myndigheder behandler borgerne korrekt?",
    opts: ["Folketingets Ombudsmand", "Statsministeren", "Politiet"],
    correct: 0,
    expl: {
      en: "The Parliamentary Ombudsman investigates complaints from citizens about public authorities.",
      uk: "Парламентський омбудсмен розглядає скарги громадян на державні органи.",
      pl: "Rzecznik parlamentarny (Ombudsmand) bada skargi obywateli na organy publiczne."
    }
  },
  {
    id: "s008",
    theme: "Demokrati og grundloven",
    q: "Hvornår fik kvinder valgret til Rigsdagen (Folketinget)?",
    opts: ["1901", "1915", "1953"],
    correct: 1,
    expl: {
      en: "Women gained the right to vote in national elections in 1915, celebrated with a large march to Amalienborg on 5 June 1915.",
      uk: "Жінки отримали право голосу на національних виборах у 1915 році; це відзначили великою ходою до Амалієнборга 5 червня 1915 року.",
      pl: "Kobiety uzyskały prawo głosu w wyborach krajowych w 1915 r., co uczczono wielkim pochodem do Amalienborga 5 czerwca 1915 r."
    }
  },
  {
    id: "s009",
    theme: "Historie",
    q: "Hvornår blev Danmark besat af Tyskland under 2. verdenskrig?",
    opts: ["9. april 1940", "1. september 1939", "5. maj 1945"],
    correct: 0,
    expl: {
      en: "Germany occupied Denmark on 9 April 1940. The occupation lasted until the liberation on 5 May 1945.",
      uk: "Німеччина окупувала Данію 9 квітня 1940 року. Окупація тривала до визволення 5 травня 1945 року.",
      pl: "Niemcy zajęły Danię 9 kwietnia 1940 r. Okupacja trwała do wyzwolenia 5 maja 1945 r."
    }
  },
  {
    id: "s010",
    theme: "Historie",
    q: "Hvilket år blev Danmark befriet efter den tyske besættelse?",
    opts: ["1944", "1945", "1948"],
    correct: 1,
    expl: {
      en: "Denmark was liberated on 5 May 1945. Many Danes still put lit candles in their windows on the evening of 4 May.",
      uk: "Данію було визволено 5 травня 1945 року. Багато данців досі ставлять запалені свічки у вікна ввечері 4 травня.",
      pl: "Dania została wyzwolona 5 maja 1945 r. Wielu Duńczyków wciąż stawia zapalone świece w oknach wieczorem 4 maja."
    }
  },
  {
    id: "s011",
    theme: "Historie",
    q: "Hvad skete der ved Genforeningen i 1920?",
    opts: [
      "Sønderjylland blev igen en del af Danmark",
      "Danmark blev medlem af EF",
      "Island blev selvstændigt"
    ],
    correct: 0,
    expl: {
      en: "After a referendum in 1920, Southern Jutland (Sønderjylland), lost to Prussia in 1864, was reunited with Denmark.",
      uk: "Після референдуму 1920 року Південна Ютландія (Sønderjylland), втрачена на користь Пруссії у 1864 році, возз'єдналася з Данією.",
      pl: "Po referendum w 1920 r. Jutlandia Południowa (Sønderjylland), utracona na rzecz Prus w 1864 r., została ponownie przyłączona do Danii."
    }
  },
  {
    id: "s012",
    theme: "Historie",
    q: "Hvilket år blev Danmark medlem af EF (nu EU)?",
    opts: ["1957", "1973", "1993"],
    correct: 1,
    expl: {
      en: "Denmark joined the European Community in 1973 after a referendum in 1972, together with the UK and Ireland.",
      uk: "Данія вступила до Європейської Спільноти у 1973 році після референдуму 1972 року, разом із Великою Британією та Ірландією.",
      pl: "Dania przystąpiła do Wspólnoty Europejskiej w 1973 r. po referendum w 1972 r., razem z Wielką Brytanią i Irlandią."
    }
  },
  {
    id: "s013",
    theme: "Historie",
    q: "Var Danmark blandt de lande, der stiftede NATO?",
    opts: ["Ja, i 1949", "Nej, Danmark kom med i 1973", "Danmark er ikke medlem af NATO"],
    correct: 0,
    expl: {
      en: "Denmark was one of NATO's twelve founding members in 1949.",
      uk: "Данія була однією з дванадцяти країн-засновниць НАТО у 1949 році.",
      pl: "Dania była jednym z dwunastu członków założycieli NATO w 1949 r."
    }
  },
  {
    id: "s014",
    theme: "Danmark i dag",
    q: "Hvem er Danmarks konge?",
    opts: ["Frederik 10.", "Christian 11.", "Henrik 1."],
    correct: 0,
    expl: {
      en: "Frederik X became king on 14 January 2024, when Queen Margrethe II abdicated after 52 years on the throne.",
      uk: "Фредерік X став королем 14 січня 2024 року, коли королева Маргрете II зреклася престолу після 52 років правління.",
      pl: "Fryderyk X został królem 14 stycznia 2024 r., gdy królowa Małgorzata II abdykowała po 52 latach panowania."
    }
  },
  {
    id: "s015",
    theme: "Danmark i dag",
    q: "Hvilke lande er ud over Danmark en del af rigsfællesskabet?",
    opts: ["Island og Norge", "Færøerne og Grønland", "Sverige og Finland"],
    correct: 1,
    expl: {
      en: "The Danish Realm (rigsfællesskabet) consists of Denmark, the Faroe Islands and Greenland.",
      uk: "Данське королівство (rigsfællesskabet) складається з Данії, Фарерських островів і Гренландії.",
      pl: "Wspólnota Królestwa Danii (rigsfællesskabet) obejmuje Danię, Wyspy Owcze i Grenlandię."
    }
  },
  {
    id: "s016",
    theme: "Danmark i dag",
    q: "Hvornår fik Grønland selvstyre?",
    opts: ["1979", "2009", "2015"],
    correct: 1,
    expl: {
      en: "Greenland got home rule (hjemmestyre) in 1979 and extended self-government (selvstyre) in 2009.",
      uk: "Гренландія отримала внутрішнє самоврядування (hjemmestyre) у 1979 році та розширене самоврядування (selvstyre) у 2009 році.",
      pl: "Grenlandia uzyskała autonomię (hjemmestyre) w 1979 r., a rozszerzony samorząd (selvstyre) w 2009 r."
    }
  },
  {
    id: "s017",
    theme: "Danmark i dag",
    q: "Hvor mange regioner er Danmark inddelt i?",
    opts: ["3", "5", "14"],
    correct: 1,
    expl: {
      en: "Since the 2007 structural reform, Denmark has 5 regions (mainly responsible for hospitals) and 98 municipalities.",
      uk: "Після структурної реформи 2007 року Данія має 5 регіонів (відповідають переважно за лікарні) та 98 муніципалітетів.",
      pl: "Od reformy strukturalnej z 2007 r. Dania ma 5 regionów (odpowiedzialnych głównie za szpitale) i 98 gmin."
    }
  },
  {
    id: "s018",
    theme: "Danmark i dag",
    q: "Hvor mange kommuner er der i Danmark?",
    opts: ["78", "98", "128"],
    correct: 1,
    expl: {
      en: "Denmark has 98 municipalities. They handle e.g. schools, childcare, elder care and local services.",
      uk: "У Данії 98 муніципалітетів. Вони відповідають, зокрема, за школи, догляд за дітьми та людьми похилого віку.",
      pl: "Dania ma 98 gmin. Odpowiadają one m.in. za szkoły, opiekę nad dziećmi i osobami starszymi."
    }
  },
  {
    id: "s019",
    theme: "Danmark i dag",
    q: "Hvilken valuta bruger man i Danmark?",
    opts: ["Euro", "Danske kroner", "Svenske kroner"],
    correct: 1,
    expl: {
      en: "Denmark uses the Danish krone. Danes rejected the euro in a referendum in 2000 (one of the EU opt-outs).",
      uk: "Данія використовує данську крону. Данці відхилили євро на референдумі 2000 року (один із данських винятків у ЄС).",
      pl: "Dania używa korony duńskiej. Duńczycy odrzucili euro w referendum w 2000 r. (jedna z duńskich klauzul opt-out w UE)."
    }
  },
  {
    id: "s020",
    theme: "Velfærdssamfundet",
    q: "Hvordan finansieres det danske sundhedsvæsen primært?",
    opts: ["Gennem skatter", "Gennem private forsikringer", "Gennem brugerbetaling"],
    correct: 0,
    expl: {
      en: "Danish healthcare is tax-financed. Visits to your own GP and hospital treatment are free of charge.",
      uk: "Данська охорона здоров'я фінансується з податків. Візити до сімейного лікаря та лікування в лікарні безкоштовні.",
      pl: "Duńska służba zdrowia jest finansowana z podatków. Wizyty u lekarza rodzinnego i leczenie szpitalne są bezpłatne."
    }
  },
  {
    id: "s021",
    theme: "Velfærdssamfundet",
    q: "Hvad er folkekirken?",
    opts: [
      "Den evangelisk-lutherske kirke i Danmark",
      "Den katolske kirke i Danmark",
      "En privat forening"
    ],
    correct: 0,
    expl: {
      en: "The Danish national church (folkekirken) is Evangelical Lutheran and is supported by the state according to the constitution.",
      uk: "Народна церква Данії (folkekirken) — євангелічно-лютеранська і підтримується державою згідно з конституцією.",
      pl: "Duński kościół narodowy (folkekirken) jest ewangelicko-luterański i zgodnie z konstytucją wspierany przez państwo."
    }
  },
  {
    id: "s022",
    theme: "Kultur",
    q: "Hvem skrev eventyr som 'Den lille Havfrue' og 'Den grimme Ælling'?",
    opts: ["Karen Blixen", "H.C. Andersen", "Søren Kierkegaard"],
    correct: 1,
    expl: {
      en: "Hans Christian Andersen (1805–1875) from Odense is Denmark's world-famous fairy-tale author.",
      uk: "Ганс Крістіан Андерсен (1805–1875) з Оденсе — всесвітньо відомий данський казкар.",
      pl: "Hans Christian Andersen (1805–1875) z Odense to światowej sławy duński baśniopisarz."
    }
  },
  {
    id: "s023",
    theme: "Kultur",
    q: "Hvilken dansk forfatter skrev 'Den afrikanske farm'?",
    opts: ["Karen Blixen", "Tove Ditlevsen", "Ludvig Holberg"],
    correct: 0,
    expl: {
      en: "Karen Blixen wrote 'Out of Africa' (Den afrikanske farm, 1937) about her years on a coffee farm in Kenya.",
      uk: "Карен Бліксен написала «З Африки» (Den afrikanske farm, 1937) про роки, проведені на кавовій фермі в Кенії.",
      pl: "Karen Blixen napisała „Pożegnanie z Afryką” (Den afrikanske farm, 1937) o latach spędzonych na farmie kawy w Kenii."
    }
  },
  {
    id: "s024",
    theme: "Kultur",
    q: "Hvilken dansk fysiker modtog Nobelprisen i 1922 for sin atomteori?",
    opts: ["Niels Bohr", "H.C. Ørsted", "Tycho Brahe"],
    correct: 0,
    expl: {
      en: "Niels Bohr received the Nobel Prize in Physics in 1922 for his model of the atom.",
      uk: "Нільс Бор отримав Нобелівську премію з фізики 1922 року за свою модель атома.",
      pl: "Niels Bohr otrzymał Nagrodę Nobla z fizyki w 1922 r. za swój model atomu."
    }
  },
  {
    id: "s025",
    theme: "Kultur",
    q: "I hvilken by ligger legetøjsvirksomheden LEGO's hovedsæde?",
    opts: ["Billund", "Aarhus", "Esbjerg"],
    correct: 0,
    expl: {
      en: "LEGO was founded in Billund in Jutland, which is also home to the original Legoland park.",
      uk: "LEGO було засновано в Біллунні в Ютландії, де також розташований перший парк Legoland.",
      pl: "LEGO zostało założone w Billund w Jutlandii, gdzie znajduje się też pierwszy park Legoland."
    }
  },
  {
    id: "s026",
    theme: "Kultur",
    q: "Hvad fejrer danskerne den 5. juni?",
    opts: ["Grundlovsdag", "Sankt Hans", "Dronningens fødselsdag"],
    correct: 0,
    expl: {
      en: "5 June is Constitution Day (Grundlovsdag), marking the signing of the first constitution in 1849.",
      uk: "5 червня — День конституції (Grundlovsdag), на честь підписання першої конституції 1849 року.",
      pl: "5 czerwca to Dzień Konstytucji (Grundlovsdag), upamiętniający podpisanie pierwszej konstytucji w 1849 r."
    }
  },
  {
    id: "s027",
    theme: "Demokrati og grundloven",
    q: "Hvem udpeger formelt statsministeren i Danmark?",
    opts: ["Kongen", "Folketingets formand", "Højesteret"],
    correct: 0,
    expl: {
      en: "The monarch formally appoints the prime minister, but always following the parliamentary majority (a government cannot have a majority against it).",
      uk: "Монарх формально призначає прем'єр-міністра, але завжди відповідно до парламентської більшості (уряд не може мати більшість проти себе).",
      pl: "Monarcha formalnie powołuje premiera, ale zawsze zgodnie z większością parlamentarną (rząd nie może mieć większości przeciwko sobie)."
    }
  },
  {
    id: "s028",
    theme: "Demokrati og grundloven",
    q: "Hvad betyder magtens tredeling?",
    opts: [
      "Magten er delt mellem den lovgivende, udøvende og dømmende magt",
      "Magten er delt mellem kongen, kirken og militæret",
      "Magten er delt mellem stat, regioner og kommuner"
    ],
    correct: 0,
    expl: {
      en: "The separation of powers divides state power between the legislative (Folketinget), the executive (the government) and the judicial (the courts).",
      uk: "Розподіл влади ділить державну владу між законодавчою (Folketinget), виконавчою (уряд) та судовою (суди) гілками.",
      pl: "Trójpodział władzy dzieli władzę państwową na ustawodawczą (Folketing), wykonawczą (rząd) i sądowniczą (sądy)."
    }
  }
];
