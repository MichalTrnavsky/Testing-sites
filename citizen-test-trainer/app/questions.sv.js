// Question bank for the Swedish medborgarskapsprov (samhällskunskap).
//
// SOURCE STATUS: sample bank. Sweden's test is brand new — the first
// (pilot) sitting is 15 August 2026 and UHR has NOT yet published official
// questions; it will release example questions before the exam, and the
// whole test is based on the official study material "Sverige i fokus"
// (13 themes). These questions are authored from that material and from
// well-established facts about Sweden, in the real format: 4 options, one
// correct. Replace/extend with UHR's example questions as they appear.
//
// Real format: ~60 questions, 4 options, 90 minutes, pass mark TBD (UHR
// calibrates it at the Aug 2026 pilot; internationally ~70-80%).
//
// Schema matches the Danish bank: { id, theme, q, opts[4], correct(0-3),
// expl:{en,uk,ar}, tr:{ uk:{q,opts}, ar:{q,opts} } (optional) }

window.QUESTION_BANK = [
  {
    id: "sv001",
    theme: "Sveriges styrelseskick",
    q: "Hur många ledamöter har Sveriges riksdag?",
    opts: ["149", "249", "349", "449"],
    correct: 2,
    expl: {
      en: "The Swedish parliament (Riksdagen) has 349 members, elected every four years.",
      uk: "Шведський парламент (Riksdagen) налічує 349 депутатів, яких обирають кожні чотири роки.",
      ar: "يتألف البرلمان السويدي (الريكسداغ) من 349 عضوًا يُنتخبون كل أربع سنوات."
    },
    tr: {
      uk: { q: "Скільки депутатів налічує шведський парламент (Riksdagen)?", opts: ["149", "249", "349", "449"] },
      ar: { q: "كم عدد أعضاء البرلمان السويدي (الريكسداغ)؟", opts: ["149", "249", "349", "449"] }
    },
    terms: [
      {
        term: "riksdag",
        expl: {
          sv: "Sveriges folkvalda parlament som stiftar lagar.",
          en: "Sweden's elected parliament that makes the laws.",
          uk: "обраний парламент Швеції, який ухвалює закони.",
          ar: "البرلمان المنتخب في السويد الذي يسنّ القوانين."
        }
      }
    ]
  },
  {
    id: "sv002",
    theme: "Sveriges styrelseskick",
    q: "Vad heter Sveriges statsskick?",
    opts: ["Republik", "Konstitutionell monarki", "Absolut monarki", "Federation"],
    correct: 1,
    expl: {
      en: "Sweden is a constitutional monarchy: the king is head of state, but political power lies with the elected Riksdag and the government.",
      uk: "Швеція — конституційна монархія: король є главою держави, але політична влада належить обраному Riksdag та уряду.",
      ar: "السويد ملكية دستورية: الملك رئيس الدولة، لكن السلطة السياسية بيد البرلمان المنتخب والحكومة."
    },
    tr: {
      uk: { q: "Яка форма правління у Швеції?", opts: ["Республіка", "Конституційна монархія", "Абсолютна монархія", "Федерація"] },
      ar: { q: "ما هو نظام الحكم في السويد؟", opts: ["جمهورية", "ملكية دستورية", "ملكية مطلقة", "اتحاد فيدرالي"] }
    }
  },
  {
    id: "sv003",
    theme: "Sveriges styrelseskick",
    q: "Vem är Sveriges statschef?",
    opts: ["Statsministern", "Kungen", "Riksdagens talman", "Presidenten"],
    correct: 1,
    expl: {
      en: "The King (Carl XVI Gustaf) is Sweden's head of state, but the role is mainly ceremonial. The head of government is the prime minister.",
      uk: "Король (Карл XVI Густав) є главою держави Швеції, але ця роль переважно церемоніальна. Главою уряду є прем'єр-міністр.",
      ar: "الملك (كارل السادس عشر غوستاف) هو رئيس الدولة في السويد، لكن دوره احتفالي في الأساس. رئيس الحكومة هو رئيس الوزراء."
    },
    tr: {
      uk: { q: "Хто є главою держави Швеції?", opts: ["Прем'єр-міністр", "Король", "Спікер парламенту", "Президент"] },
      ar: { q: "من هو رئيس الدولة في السويد؟", opts: ["رئيس الوزراء", "الملك", "رئيس البرلمان", "الرئيس"] }
    }
  },
  {
    id: "sv004",
    theme: "Att påverka i Sverige",
    q: "Hur gammal måste man vara för att rösta i riksdagsvalet?",
    opts: ["16 år", "18 år", "20 år", "21 år"],
    correct: 1,
    expl: {
      en: "You must be 18 and a Swedish citizen to vote in the national (riksdag) election. In municipal and regional elections some non-citizens may vote too.",
      uk: "Щоб голосувати на національних (риксдаг) виборах, потрібно мати 18 років і бути громадянином Швеції. На муніципальних виборах можуть голосувати й деякі негромадяни.",
      ar: "يجب أن تبلغ 18 عامًا وأن تكون مواطنًا سويديًا للتصويت في الانتخابات الوطنية. في الانتخابات البلدية يحق لبعض غير المواطنين التصويت أيضًا."
    },
    tr: {
      uk: { q: "Скільки років має бути людині, щоб голосувати на виборах до риксдагу?", opts: ["16 років", "18 років", "20 років", "21 рік"] },
      ar: { q: "كم يجب أن يكون عمر الشخص للتصويت في انتخابات الريكسداغ؟", opts: ["16 عامًا", "18 عامًا", "20 عامًا", "21 عامًا"] }
    }
  },
  {
    id: "sv005",
    theme: "Att påverka i Sverige",
    q: "Hur ofta hålls det ordinarie val till riksdagen i Sverige?",
    opts: ["Vart tredje år", "Vart fjärde år", "Vart femte år", "Vart sjätte år"],
    correct: 1,
    expl: {
      en: "General elections to the Riksdag are held every four years, on the second Sunday of September.",
      uk: "Чергові вибори до Riksdag відбуваються кожні чотири роки, у другу неділю вересня.",
      ar: "تُجرى الانتخابات العامة للبرلمان كل أربع سنوات، في ثاني أحد من شهر سبتمبر."
    },
    tr: {
      uk: { q: "Як часто у Швеції проходять чергові вибори до риксдагу?", opts: ["Кожні три роки", "Кожні чотири роки", "Кожні п'ять років", "Кожні шість років"] },
      ar: { q: "كم مرة تُجرى الانتخابات العامة للبرلمان في السويد؟", opts: ["كل ثلاث سنوات", "كل أربع سنوات", "كل خمس سنوات", "كل ست سنوات"] }
    }
  },
  {
    id: "sv006",
    theme: "Sverige och världen",
    q: "Vilket år blev Sverige medlem i EU?",
    opts: ["1985", "1995", "2004", "2009"],
    correct: 1,
    expl: {
      en: "Sweden joined the European Union in 1995, after a referendum in 1994.",
      uk: "Швеція вступила до Європейського Союзу у 1995 році, після референдуму 1994 року.",
      ar: "انضمت السويد إلى الاتحاد الأوروبي عام 1995، بعد استفتاء عام 1994."
    },
    tr: {
      uk: { q: "У якому році Швеція стала членом ЄС?", opts: ["1985", "1995", "2004", "2009"] },
      ar: { q: "في أي عام أصبحت السويد عضوًا في الاتحاد الأوروبي؟", opts: ["1985", "1995", "2004", "2009"] }
    }
  },
  {
    id: "sv007",
    theme: "Sverige och världen",
    q: "Vilken valuta används i Sverige?",
    opts: ["Euro", "Svensk krona", "Dansk krone", "Norsk krone"],
    correct: 1,
    expl: {
      en: "Sweden uses the Swedish krona (SEK). Although an EU member, Sweden has not adopted the euro.",
      uk: "Швеція використовує шведську крону (SEK). Попри членство в ЄС, Швеція не перейшла на євро.",
      ar: "تستخدم السويد الكرونة السويدية (SEK). ورغم عضويتها في الاتحاد الأوروبي، لم تعتمد اليورو."
    }
  },
  {
    id: "sv008",
    theme: "Sverige och världen",
    q: "Vilket år blev Sverige medlem i försvarsalliansen Nato?",
    opts: ["1949", "1995", "2023", "2024"],
    correct: 3,
    expl: {
      en: "Sweden became a member of NATO in 2024, ending a long tradition of military non-alignment.",
      uk: "Швеція стала членом НАТО у 2024 році, завершивши давню традицію військового нейтралітету.",
      ar: "أصبحت السويد عضوًا في حلف الناتو عام 2024، منهيةً تقليدًا طويلًا من عدم الانحياز العسكري."
    }
  },
  {
    id: "sv009",
    theme: "Sveriges historia",
    q: "Vad firar man i Sverige den 6 juni?",
    opts: ["Midsommar", "Sveriges nationaldag", "Första maj", "Luciadagen"],
    correct: 1,
    expl: {
      en: "6 June is Sweden's National Day, commemorating Gustav Vasa's election as king in 1523 and the 1809 constitution.",
      uk: "6 червня — Національний день Швеції, на честь обрання Густава Вази королем у 1523 році та конституції 1809 року.",
      ar: "السادس من يونيو هو اليوم الوطني للسويد، إحياءً لانتخاب غوستاف فاسا ملكًا عام 1523 ودستور عام 1809."
    },
    tr: {
      uk: { q: "Що святкують у Швеції 6 червня?", opts: ["Мідсоммар", "Національний день Швеції", "Перше травня", "День Луції"] },
      ar: { q: "ماذا يُحتفل به في السويد في السادس من يونيو؟", opts: ["منتصف الصيف", "اليوم الوطني للسويد", "الأول من مايو", "يوم لوسيا"] }
    }
  },
  {
    id: "sv010",
    theme: "Sveriges historia",
    q: "Vilket år fick alla kvinnor rösträtt i riksdagsval i Sverige?",
    opts: ["1866", "1901", "1921", "1945"],
    correct: 2,
    expl: {
      en: "Women voted in a Swedish national election for the first time in 1921, after the reform that introduced universal suffrage.",
      uk: "Жінки вперше проголосували на національних виборах у Швеції в 1921 році, після реформи загального виборчого права.",
      ar: "صوّتت النساء لأول مرة في انتخابات وطنية سويدية عام 1921، بعد إصلاح أدخل الاقتراع العام."
    }
  },
  {
    id: "sv011",
    theme: "Individens rättigheter och skyldigheter",
    q: "Vad innebär tryckfrihet i Sverige?",
    opts: [
      "Att man får trycka pengar",
      "Rätten att uttrycka sig i tryckt skrift utan censur",
      "Att tidningar är gratis",
      "Att staten bestämmer vad som publiceras"
    ],
    correct: 1,
    expl: {
      en: "Freedom of the press means you may publish text without prior censorship by the state. It is one of Sweden's fundamental constitutional laws.",
      uk: "Свобода преси означає право публікувати тексти без попередньої державної цензури. Це один з основоположних конституційних законів Швеції.",
      ar: "حرية الصحافة تعني حق نشر النصوص دون رقابة مسبقة من الدولة. وهي أحد القوانين الدستورية الأساسية في السويد."
    }
  },
  {
    id: "sv012",
    theme: "Jämställdhet",
    q: "Vad betyder jämställdhet i det svenska samhället?",
    opts: [
      "Att alla har samma lön",
      "Att kvinnor och män har samma rättigheter och möjligheter",
      "Att bara kvinnor får arbeta",
      "Att alla måste vara lika"
    ],
    correct: 1,
    expl: {
      en: "Gender equality (jämställdhet) means women and men have the same rights, opportunities and obligations in all areas of life — a central value in Sweden.",
      uk: "Ґендерна рівність (jämställdhet) означає, що жінки й чоловіки мають однакові права, можливості та обов'язки в усіх сферах життя — ключова цінність у Швеції.",
      ar: "المساواة بين الجنسين تعني أن للنساء والرجال الحقوق والفرص والواجبات نفسها في جميع مجالات الحياة — وهي قيمة محورية في السويد."
    },
    terms: [
      {
        term: "jämställdhet",
        expl: {
          sv: "Att kvinnor och män har samma rättigheter, möjligheter och skyldigheter.",
          en: "That women and men have the same rights, opportunities and obligations.",
          uk: "рівні права, можливості та обов'язки жінок і чоловіків.",
          ar: "أن للنساء والرجال الحقوق والفرص والواجبات نفسها."
        }
      }
    ],
    tr: {
      uk: { q: "Що означає ґендерна рівність у шведському суспільстві?", opts: ["Що всі мають однакову зарплату", "Що жінки й чоловіки мають однакові права та можливості", "Що працювати можуть лише жінки", "Що всі мають бути однакові"] },
      ar: { q: "ماذا تعني المساواة بين الجنسين في المجتمع السويدي؟", opts: ["أن للجميع الراتب نفسه", "أن للنساء والرجال الحقوق والفرص نفسها", "أن النساء فقط يحق لهن العمل", "أن يكون الجميع متشابهين"] }
    }
  },
  {
    id: "sv013",
    theme: "Att bo i Sverige",
    q: "Vad är ett personnummer i Sverige?",
    opts: [
      "Ett telefonnummer",
      "En unik identitetsbeteckning för folkbokförda personer",
      "Ett bankkontonummer",
      "Ett kösystem på myndigheter"
    ],
    correct: 1,
    expl: {
      en: "A personnummer is a unique personal identity number given to people registered in Sweden. You need it for healthcare, banking, work and most public services.",
      uk: "Personnummer — це унікальний ідентифікаційний номер особи, зареєстрованої у Швеції. Він потрібен для медицини, банку, роботи та більшості державних послуг.",
      ar: "الرقم الشخصي (personnummer) هو رقم هوية فريد يُمنح للمسجّلين في السويد. تحتاجه للرعاية الصحية والبنوك والعمل ومعظم الخدمات العامة."
    },
    terms: [
      {
        term: "personnummer",
        expl: {
          sv: "Ett unikt identitetsnummer för alla som är folkbokförda i Sverige.",
          en: "A unique ID number for everyone registered as living in Sweden.",
          uk: "унікальний ідентифікаційний номер для всіх, хто зареєстрований у Швеції.",
          ar: "رقم هوية فريد لكل شخص مسجّل للإقامة في السويد."
        }
      },
      {
        term: "folkbokförd",
        expl: {
          sv: "Registrerad som bosatt på en adress i Sverige hos Skatteverket.",
          en: "Registered with the Tax Agency as living at an address in Sweden.",
          uk: "зареєстрований у податковій службі як мешканець за адресою у Швеції.",
          ar: "مسجّل لدى مصلحة الضرائب كمقيم على عنوان في السويد."
        }
      }
    ]
  },
  {
    id: "sv014",
    theme: "Rättssystemet",
    q: "Vad kallas den domstol som först prövar de flesta brottmål i Sverige?",
    opts: ["Högsta domstolen", "Hovrätten", "Tingsrätten", "Förvaltningsrätten"],
    correct: 2,
    expl: {
      en: "The district court (tingsrätten) is the first instance for most criminal and civil cases. Decisions can be appealed to the court of appeal (hovrätten).",
      uk: "Окружний суд (tingsrätten) є першою інстанцією для більшості кримінальних і цивільних справ. Рішення можна оскаржити в апеляційному суді (hovrätten).",
      ar: "محكمة المقاطعة (tingsrätten) هي أول درجة لمعظم القضايا الجنائية والمدنية. ويمكن استئناف قراراتها أمام محكمة الاستئناف (hovrätten)."
    }
  },
  {
    id: "sv015",
    theme: "Hälsa och vård",
    q: "Vem har huvudansvaret för hälso- och sjukvården i Sverige?",
    opts: ["Staten", "Regionerna", "Kommunerna", "Privata företag"],
    correct: 1,
    expl: {
      en: "The regions (regionerna) are mainly responsible for healthcare in Sweden. Care is largely tax-funded, with capped patient fees.",
      uk: "За охорону здоров'я у Швеції відповідають переважно регіони (regionerna). Медицина здебільшого фінансується з податків, з обмеженою платою для пацієнтів.",
      ar: "الأقاليم (regionerna) هي المسؤولة أساسًا عن الرعاية الصحية في السويد. والرعاية ممولة إلى حد كبير من الضرائب مع رسوم محدودة على المرضى."
    }
  },
  {
    id: "sv016",
    theme: "Att försörja sig i Sverige",
    q: "Vad är a-kassa i Sverige?",
    opts: [
      "En avgift man betalar för att bo i Sverige",
      "En försäkring som ger ersättning om man blir arbetslös",
      "Ett bidrag till alla barnfamiljer",
      "En pensionsform"
    ],
    correct: 1,
    expl: {
      en: "A-kassa (unemployment insurance) gives you income compensation if you lose your job, provided you are a member and meet the conditions.",
      uk: "A-kassa (страхування на випадок безробіття) виплачує компенсацію доходу, якщо ви втратили роботу, за умови членства й виконання вимог.",
      ar: "تأمين البطالة (A-kassa) يمنحك تعويضًا عن الدخل إذا فقدت عملك، شرط أن تكون عضوًا وتستوفي الشروط."
    },
    terms: [
      {
        term: "a-kassa",
        expl: {
          sv: "Arbetslöshetsförsäkring som ger pengar en tid om du blir arbetslös.",
          en: "Unemployment insurance that pays you for a period if you lose your job.",
          uk: "страхування на випадок безробіття, що певний час виплачує гроші, якщо ви втратили роботу.",
          ar: "تأمين ضد البطالة يدفع لك لفترة إذا فقدت عملك."
        }
      }
    ]
  }
];
