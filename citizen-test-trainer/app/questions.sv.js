// Question bank for the Swedish medborgarskapsprov (samhällskunskap).
//
// SOURCE: grounded in UHR's official study material "Sverige i fokus"
// (Utbildningsmaterial till medborgarskapsprov, 2026, 1:a upplagan),
// the material the real test is based on. Questions are authored from that
// material (13 chapters). Real exam format: ~60 questions, 4 options, one
// correct, 90 minutes. UHR's own example questions should be folded in via
// ingest/fetch_sverige_i_fokus.py as they are published.
//
// Schema: { id, theme, chapter, q, opts[4], correct(0-3),
//           expl:{en,uk,ar}, tr?:{ uk:{q,opts}, ar:{q,opts} }, terms?:[...] }
//
// The first FREE_QUESTIONS entries are the free-tier sample — kept as a
// representative spread with translations to showcase the bilingual feature.

window.QUESTION_BANK = [
  // ---------------- free-tier spread (with translations) ----------------
  {
    id: "sv001", theme: "Så här styrs Sverige", chapter: 3,
    q: "Hur många ledamöter har Sveriges riksdag?",
    opts: ["149", "249", "349", "449"], correct: 2,
    expl: {
      en: "The Riksdag has 349 members, elected every four years.",
      uk: "У Riksdag (парламенті) 349 депутатів, яких обирають кожні чотири роки.",
      ar: "يضم البرلمان (الريكسداغ) 349 عضوًا يُنتخبون كل أربع سنوات."
    },
    tr: {
      uk: { q: "Скільки депутатів у шведському парламенті (Riksdag)?", opts: ["149", "249", "349", "449"] },
      ar: { q: "كم عدد أعضاء البرلمان السويدي (الريكسداغ)؟", opts: ["149", "249", "349", "449"] }
    },
    terms: [{ term: "riksdag", expl: {
      sv: "Sveriges folkvalda parlament som stiftar lagar.",
      en: "Sweden's elected parliament that makes the laws.",
      uk: "обраний парламент Швеції, який ухвалює закони.",
      ar: "البرلمان المنتخب في السويد الذي يسنّ القوانين." } }]
  },
  {
    id: "sv002", theme: "Så här styrs Sverige", chapter: 3,
    q: "Vad är Sveriges statsskick?",
    opts: ["Republik", "Konstitutionell monarki", "Absolut monarki", "Federation"], correct: 1,
    expl: {
      en: "Sweden is a constitutional monarchy: the king is head of state but has no political power.",
      uk: "Швеція — конституційна монархія: король є главою держави, але не має політичної влади.",
      ar: "السويد ملكية دستورية: الملك رئيس الدولة لكن دون سلطة سياسية."
    },
    tr: {
      uk: { q: "Яка форма правління у Швеції?", opts: ["Республіка", "Конституційна монархія", "Абсолютна монархія", "Федерація"] },
      ar: { q: "ما نظام الحكم في السويد؟", opts: ["جمهورية", "ملكية دستورية", "ملكية مطلقة", "اتحاد فيدرالي"] }
    }
  },
  {
    id: "sv003", theme: "Sveriges demokratiska system", chapter: 2,
    q: "Vad betyder ordet demokrati?",
    opts: ["Kungastyre", "Folkstyre", "Militärstyre", "Enpartistyre"], correct: 1,
    expl: {
      en: "'Democracy' comes from Greek and means rule by the people (folkstyre).",
      uk: "Слово «демократія» походить з грецької й означає народовладдя (folkstyre).",
      ar: "كلمة «ديمقراطية» يونانية الأصل وتعني حكم الشعب (folkstyre)."
    },
    tr: {
      uk: { q: "Що означає слово «демократія»?", opts: ["Правління короля", "Народовладдя", "Військове правління", "Однопартійне правління"] },
      ar: { q: "ماذا تعني كلمة «ديمقراطية»؟", opts: ["حكم الملك", "حكم الشعب", "حكم عسكري", "حكم الحزب الواحد"] }
    }
  },
  {
    id: "sv004", theme: "Politiska val och partier", chapter: 4,
    q: "Hur gammal måste man vara för att rösta i riksdagsvalet?",
    opts: ["16 år", "18 år", "20 år", "21 år"], correct: 1,
    expl: {
      en: "You must be 18 and a Swedish citizen to vote in the riksdag election.",
      uk: "Щоб голосувати на виборах до риксдагу, потрібно мати 18 років і бути громадянином Швеції.",
      ar: "يجب أن تبلغ 18 عامًا وأن تكون مواطنًا سويديًا للتصويت في انتخابات الريكسداغ."
    },
    tr: {
      uk: { q: "Скільки років потрібно, щоб голосувати на виборах до риксдагу?", opts: ["16 років", "18 років", "20 років", "21 рік"] },
      ar: { q: "كم يجب أن يكون العمر للتصويت في انتخابات الريكسداغ؟", opts: ["16 عامًا", "18 عامًا", "20 عامًا", "21 عامًا"] }
    }
  },
  {
    id: "sv005", theme: "Sverige och omvärlden", chapter: 11,
    q: "Vilket år blev Sverige medlem i EU?",
    opts: ["1985", "1995", "2004", "2009"], correct: 1,
    expl: {
      en: "Sweden has been a member of the European Union since 1995.",
      uk: "Швеція є членом Європейського Союзу з 1995 року.",
      ar: "السويد عضو في الاتحاد الأوروبي منذ عام 1995."
    },
    tr: {
      uk: { q: "У якому році Швеція стала членом ЄС?", opts: ["1985", "1995", "2004", "2009"] },
      ar: { q: "في أي عام أصبحت السويد عضوًا في الاتحاد الأوروبي؟", opts: ["1985", "1995", "2004", "2009"] }
    }
  },
  {
    id: "sv006", theme: "Sverige och omvärlden", chapter: 11,
    q: "Vilket år blev Sverige medlem i försvarsalliansen Nato?",
    opts: ["1949", "1995", "2022", "2024"], correct: 3,
    expl: {
      en: "Sweden joined NATO in 2024, after Russia's attack on Ukraine in 2022, ending its long non-alignment.",
      uk: "Швеція вступила до НАТО у 2024 році, після нападу Росії на Україну в 2022-му, завершивши тривалий нейтралітет.",
      ar: "انضمت السويد إلى الناتو عام 2024، بعد هجوم روسيا على أوكرانيا عام 2022، منهيةً حيادها الطويل."
    },
    tr: {
      uk: { q: "У якому році Швеція вступила до оборонного альянсу НАТО?", opts: ["1949", "1995", "2022", "2024"] },
      ar: { q: "في أي عام انضمت السويد إلى حلف الناتو؟", opts: ["1949", "1995", "2022", "2024"] }
    }
  },
  {
    id: "sv007", theme: "Välfärdssamhället", chapter: 9,
    q: "Hur finansieras den svenska välfärden främst?",
    opts: ["Genom skatter", "Genom privata försäkringar", "Genom lån från EU", "Genom kungen"], correct: 0,
    expl: {
      en: "Welfare — healthcare, schools, social support — is mainly funded through taxes paid jointly.",
      uk: "Добробут — охорона здоров'я, школи, соціальна підтримка — фінансується переважно зі спільних податків.",
      ar: "الرفاه — الرعاية الصحية والمدارس والدعم الاجتماعي — يُموّل أساسًا من الضرائب المشتركة."
    },
    tr: {
      uk: { q: "Як переважно фінансується шведський добробут?", opts: ["Через податки", "Через приватні страховки", "Через позики від ЄС", "Через короля"] },
      ar: { q: "كيف يُموَّل نظام الرفاه السويدي بشكل أساسي؟", opts: ["عن طريق الضرائب", "عن طريق التأمين الخاص", "عن طريق قروض من الاتحاد الأوروبي", "عن طريق الملك"] }
    }
  },
  {
    id: "sv008", theme: "Mänskliga rättigheter", chapter: 7,
    q: "Vad heter samernas folkvalda parlament i Sverige?",
    opts: ["Riksdagen", "Sametinget", "Landstinget", "Regionfullmäktige"], correct: 1,
    expl: {
      en: "The Sami, Sweden's recognised indigenous people, have their own elected assembly called Sametinget.",
      uk: "Саами — визнаний корінний народ Швеції — мають власний виборний парламент Sametinget.",
      ar: "للسامي، وهم السكان الأصليون المعترف بهم في السويد، برلمانهم المنتخب الخاص المسمى Sametinget."
    },
    tr: {
      uk: { q: "Як називається виборний парламент саамів у Швеції?", opts: ["Riksdagen", "Sametinget", "Landstinget", "Regionfullmäktige"] },
      ar: { q: "ما اسم برلمان السامي المنتخب في السويد؟", opts: ["Riksdagen", "Sametinget", "Landstinget", "Regionfullmäktige"] }
    }
  },

  // ---------------- Kapitel 1 — Landet Sverige ----------------
  {
    id: "sv009", theme: "Landet Sverige", chapter: 1,
    q: "Ungefär hur många människor bor i Sverige?",
    opts: ["Cirka 5 miljoner", "Cirka 11 miljoner", "Cirka 25 miljoner", "Cirka 50 miljoner"], correct: 1,
    expl: {
      en: "Nearly 11 million people live in Sweden, most of them in the south and along the coasts.",
      uk: "У Швеції живе майже 11 мільйонів людей, більшість — на півдні та вздовж узбереж.",
      ar: "يعيش في السويد نحو 11 مليون نسمة، معظمهم في الجنوب وعلى طول السواحل."
    }
  },
  {
    id: "sv010", theme: "Landet Sverige", chapter: 1,
    q: "Vilka är Sveriges tre största sjöar?",
    opts: ["Vänern, Vättern och Mälaren", "Östersjön, Skagerrak och Kattegatt", "Gotland, Öland och Åland", "Kiruna, Malmberget och Kebnekaise"], correct: 0,
    expl: {
      en: "Sweden's three largest lakes are Vänern, Vättern and Mälaren.",
      uk: "Три найбільші озера Швеції — Венерн, Веттерн і Меларен.",
      ar: "أكبر ثلاث بحيرات في السويد هي فينرن وفيترن ومالارن."
    }
  },
  {
    id: "sv011", theme: "Landet Sverige", chapter: 1,
    q: "Vilket år ska Sveriges utsläpp av växthusgaser vara så nära noll som möjligt enligt klimatlagen?",
    opts: ["2030", "2045", "2060", "2100"], correct: 1,
    expl: {
      en: "Sweden's climate law sets the goal that greenhouse-gas emissions be as close to zero as possible by 2045.",
      uk: "Кліматичний закон Швеції ставить мету, щоб викиди парникових газів були якомога ближчими до нуля до 2045 року.",
      ar: "يحدّد قانون المناخ السويدي هدفًا بأن تكون انبعاثات الغازات الدفيئة قريبة من الصفر قدر الإمكان بحلول عام 2045."
    }
  },

  // ---------------- Kapitel 2 — demokratiska systemet ----------------
  {
    id: "sv012", theme: "Sveriges demokratiska system", chapter: 2,
    q: "Vad menas med att val i Sverige är hemliga?",
    opts: ["Att ingen får rösta", "Att ingen behöver avslöja hur de röstar", "Att bara politiker får rösta", "Att resultatet hålls hemligt"], correct: 1,
    expl: {
      en: "A secret ballot means no one has to reveal how they voted — everyone votes behind a screen.",
      uk: "Таємне голосування означає, що ніхто не мусить розкривати, як він проголосував — усі голосують за ширмою.",
      ar: "الاقتراع السرّي يعني ألّا يضطر أحد للكشف عن كيفية تصويته — يصوّت الجميع خلف ساتر."
    }
  },
  {
    id: "sv013", theme: "Sveriges demokratiska system", chapter: 2,
    q: "Vad kan vara ett hot mot demokratin?",
    opts: ["Högt valdeltagande", "Lågt valdeltagande och spridning av falsk information", "Att det finns många partier", "Att medierna är fria"], correct: 1,
    expl: {
      en: "Low turnout and the spread of false information and hate can weaken democracy.",
      uk: "Низька явка та поширення неправдивої інформації й ненависті можуть послабити демократію.",
      ar: "ضعف المشاركة في التصويت ونشر المعلومات الكاذبة والكراهية يمكن أن يُضعف الديمقراطية."
    }
  },

  // ---------------- Kapitel 3 — Så här styrs Sverige ----------------
  {
    id: "sv014", theme: "Så här styrs Sverige", chapter: 3,
    q: "Vem utser ministrarna i regeringen?",
    opts: ["Kungen", "Statsministern", "Riksdagens talman", "Folket direkt"], correct: 1,
    expl: {
      en: "The Riksdag elects the prime minister, who then chooses the ministers of the government.",
      uk: "Риксдаг обирає прем'єр-міністра, який потім призначає міністрів уряду.",
      ar: "ينتخب البرلمان رئيس الوزراء، الذي يختار بعد ذلك وزراء الحكومة."
    }
  },
  {
    id: "sv015", theme: "Så här styrs Sverige", chapter: 3,
    q: "Vad ansvarar Sveriges regioner främst för?",
    opts: ["Skolan", "Hälso- och sjukvården", "Polisen", "Försvaret"], correct: 1,
    expl: {
      en: "The 21 regions are mainly responsible for health and medical care, and also public transport.",
      uk: "21 регіон відповідає передусім за охорону здоров'я, а також за громадський транспорт.",
      ar: "الأقاليم الـ21 مسؤولة أساسًا عن الرعاية الصحية، وكذلك عن النقل العام."
    }
  },
  {
    id: "sv016", theme: "Så här styrs Sverige", chapter: 3,
    q: "Hur många kommuner är Sverige indelat i?",
    opts: ["21", "150", "290", "349"], correct: 2,
    expl: {
      en: "Sweden has 290 municipalities, responsible for schools, elderly care, water and much local service.",
      uk: "У Швеції 290 комун, які відповідають за школи, догляд за літніми, водопостачання та місцеві послуги.",
      ar: "في السويد 290 بلدية مسؤولة عن المدارس ورعاية المسنّين والمياه وكثير من الخدمات المحلية."
    }
  },
  {
    id: "sv017", theme: "Så här styrs Sverige", chapter: 3,
    q: "Vad heter Sveriges kung?",
    opts: ["Carl XVI Gustaf", "Gustav Vasa", "Frederik X", "Carl Philip"], correct: 0,
    expl: {
      en: "Sweden's king is Carl XVI Gustaf; his eldest daughter Victoria is crown princess.",
      uk: "Король Швеції — Карл XVI Густав; його старша донька Вікторія є кронпринцесою.",
      ar: "ملك السويد هو كارل السادس عشر غوستاف؛ وابنته الكبرى فيكتوريا وليّة العهد."
    }
  },

  // ---------------- Kapitel 4 — Politiska val och partier ----------------
  {
    id: "sv018", theme: "Politiska val och partier", chapter: 4,
    q: "Hur ofta hålls ordinarie val till riksdagen?",
    opts: ["Vart tredje år", "Vart fjärde år", "Vart femte år", "Vart sjätte år"], correct: 1,
    expl: {
      en: "Elections to the Riksdag, regions and municipalities are held every four years; EU elections every five.",
      uk: "Вибори до риксдагу, регіонів і комун відбуваються кожні чотири роки; вибори до ЄС — кожні п'ять.",
      ar: "تُجرى انتخابات البرلمان والأقاليم والبلديات كل أربع سنوات؛ وانتخابات الاتحاد الأوروبي كل خمس."
    }
  },
  {
    id: "sv019", theme: "Politiska val och partier", chapter: 4,
    q: "Hur många procent av rösterna måste ett parti få för att komma in i riksdagen?",
    opts: ["Minst 2 procent", "Minst 4 procent", "Minst 10 procent", "Minst 20 procent"], correct: 1,
    expl: {
      en: "A party needs at least 4% of the votes to win seats in the Riksdag.",
      uk: "Щоб отримати місця в риксдагу, партія повинна набрати щонайменше 4% голосів.",
      ar: "يحتاج الحزب إلى 4% على الأقل من الأصوات للفوز بمقاعد في البرلمان."
    }
  },
  {
    id: "sv020", theme: "Politiska val och partier", chapter: 4,
    q: "Vad röstade svenska folket om i folkomröstningen 2003?",
    opts: ["Om att gå med i EU", "Om att byta till euro", "Om att gå med i Nato", "Om att sänka skatten"], correct: 1,
    expl: {
      en: "In 2003 Swedes voted no to replacing the Swedish krona with the euro, so Sweden kept the krona.",
      uk: "У 2003 році шведи проголосували проти заміни крони на євро, тож Швеція зберегла крону.",
      ar: "في 2003 صوّت السويديون بلا لاستبدال الكرونة باليورو، فاحتفظت السويد بالكرونة."
    }
  },

  // ---------------- Kapitel 5 — Lag och rätt ----------------
  {
    id: "sv021", theme: "Lag och rätt", chapter: 5,
    q: "Hur många grundlagar har Sverige?",
    opts: ["En", "Två", "Fyra", "Tio"], correct: 2,
    expl: {
      en: "Sweden has four fundamental laws, including the Instrument of Government (regeringsformen).",
      uk: "У Швеції чотири основні закони, зокрема Форма правління (regeringsformen).",
      ar: "للسويد أربعة قوانين أساسية، منها وثيقة الحكم (regeringsformen)."
    }
  },
  {
    id: "sv022", theme: "Lag och rätt", chapter: 5,
    q: "Vilken domstol är första instans för brottmål i Sverige?",
    opts: ["Högsta domstolen", "Hovrätten", "Tingsrätten", "Europadomstolen"], correct: 2,
    expl: {
      en: "The district court (tingsrätten) is the first instance; decisions can be appealed to the hovrätten.",
      uk: "Окружний суд (tingsrätten) є першою інстанцією; рішення можна оскаржити в hovrätten.",
      ar: "محكمة المقاطعة (tingsrätten) هي أول درجة؛ ويمكن استئناف القرارات أمام محكمة الاستئناف (hovrätten)."
    }
  },
  {
    id: "sv023", theme: "Lag och rätt", chapter: 5,
    q: "Från vilken ålder är man straffmyndig i Sverige?",
    opts: ["13 år", "15 år", "18 år", "21 år"], correct: 1,
    expl: {
      en: "You can be prosecuted for a crime from the age of 15 in Sweden.",
      uk: "У Швеції особу можна притягнути до кримінальної відповідальності з 15 років.",
      ar: "يمكن مقاضاة الشخص جنائيًا في السويد اعتبارًا من سن 15 عامًا."
    }
  },
  {
    id: "sv024", theme: "Lag och rätt", chapter: 5,
    q: "Vad innebär allemansrätten?",
    opts: ["Rätten att äga vapen", "Rätten att vistas i naturen oavsett vem som äger marken", "Rätten att bygga var man vill", "Rätten att jaga fritt"], correct: 1,
    expl: {
      en: "The right of public access lets everyone be in nature regardless of who owns the land — responsibly.",
      uk: "Право загального доступу дозволяє кожному перебувати на природі незалежно від власника землі — відповідально.",
      ar: "حق الوصول العام يتيح للجميع التواجد في الطبيعة بغضّ النظر عن مالك الأرض — بمسؤولية."
    },
    terms: [{ term: "allemansrätten", expl: {
      sv: "Rätten att röra sig fritt i naturen, skyddad i grundlagen.",
      en: "The right to roam freely in nature, protected by the constitution.",
      uk: "право вільно перебувати на природі, захищене конституцією.",
      ar: "حق التنقل بحرية في الطبيعة، محميّ بموجب الدستور." } }]
  },
  {
    id: "sv025", theme: "Lag och rätt", chapter: 5,
    q: "Hur betraktas en person som är misstänkt för ett brott tills en dom har fallit?",
    opts: ["Som skyldig", "Som oskyldig", "Som dömd", "Som vittne"], correct: 1,
    expl: {
      en: "A suspect is considered innocent until convicted — a core part of legal certainty (rättssäkerhet).",
      uk: "Підозрюваний вважається невинним, доки не буде засуджений — основа правової певності (rättssäkerhet).",
      ar: "يُعدّ المشتبه به بريئًا حتى تثبت إدانته — وهو جوهر الأمان القانوني (rättssäkerhet)."
    }
  },

  // ---------------- Kapitel 6 — Medier ----------------
  {
    id: "sv026", theme: "Mediernas roll", chapter: 6,
    q: "Vad innebär offentlighetsprincipen?",
    opts: ["Att alla möten är offentliga", "Att allmänna handlingar hos myndigheter är offentliga", "Att medier ägs av staten", "Att all reklam är förbjuden"], correct: 1,
    expl: {
      en: "The principle of public access means official documents held by authorities are public, unless secret.",
      uk: "Принцип відкритості означає, що офіційні документи органів влади є публічними, якщо не є таємними.",
      ar: "مبدأ العلنية يعني أن الوثائق الرسمية لدى الجهات الحكومية علنية، ما لم تكن سرّية."
    }
  },
  {
    id: "sv027", theme: "Mediernas roll", chapter: 6,
    q: "Vem bestämmer vad som får sägas i svenska medier?",
    opts: ["Staten", "Kungen", "Medierna är fria — staten styr inte innehållet", "Polisen"], correct: 2,
    expl: {
      en: "In Sweden the media are free; the state cannot decide or control what they report.",
      uk: "У Швеції медіа вільні; держава не може вирішувати чи контролювати їхній зміст.",
      ar: "في السويد الإعلام حرّ؛ ولا تستطيع الدولة تحديد أو التحكم بما يُنشر."
    }
  },

  // ---------------- Kapitel 7 — Mänskliga rättigheter ----------------
  {
    id: "sv028", theme: "Mänskliga rättigheter", chapter: 7,
    q: "Vilket år antog FN förklaringen om de mänskliga rättigheterna?",
    opts: ["1918", "1945", "1948", "1979"], correct: 2,
    expl: {
      en: "The UN adopted the Universal Declaration of Human Rights in 1948, with 30 articles.",
      uk: "ООН ухвалила Загальну декларацію прав людини у 1948 році — 30 статей.",
      ar: "اعتمدت الأمم المتحدة الإعلان العالمي لحقوق الإنسان عام 1948، ويضم 30 مادة."
    }
  },
  {
    id: "sv029", theme: "Mänskliga rättigheter", chapter: 7,
    q: "Vad innebär jämställdhet i Sverige?",
    opts: ["Att alla har samma lön", "Att kvinnor och män har samma rättigheter, skyldigheter och möjligheter", "Att bara kvinnor får arbeta", "Att alla måste vara lika"], correct: 1,
    expl: {
      en: "Gender equality means women and men have the same rights, obligations and power over their lives.",
      uk: "Ґендерна рівність означає, що жінки й чоловіки мають однакові права, обов'язки та владу над своїм життям.",
      ar: "المساواة بين الجنسين تعني أن للنساء والرجال الحقوق والواجبات والسلطة نفسها على حياتهم."
    }
  },
  {
    id: "sv030", theme: "Mänskliga rättigheter", chapter: 7,
    q: "Vilket år blev Sverige först i världen med att förbjuda att slå barn?",
    opts: ["1944", "1979", "2000", "2020"], correct: 1,
    expl: {
      en: "In 1979 Sweden became the first country in the world to ban hitting children.",
      uk: "У 1979 році Швеція першою у світі заборонила бити дітей.",
      ar: "في عام 1979 أصبحت السويد أول دولة في العالم تحظر ضرب الأطفال."
    }
  },
  {
    id: "sv031", theme: "Mänskliga rättigheter", chapter: 7,
    q: "Vilka fem grupper erkände Sverige som nationella minoriteter år 2000?",
    opts: [
      "Judar, romer, samer, sverigefinnar och tornedalingar",
      "Danskar, norrmän, finländare, islänningar och tyskar",
      "Kurder, araber, somalier, syrier och afghaner",
      "Katoliker, muslimer, hinduer, buddhister och judar"
    ], correct: 0,
    expl: {
      en: "In 2000 Sweden recognised Jews, Roma, Sami, Sweden Finns and Tornedalians as national minorities.",
      uk: "У 2000 році Швеція визнала євреїв, ромів, саамів, шведських фінів і торнедальців національними меншинами.",
      ar: "في عام 2000 اعترفت السويد باليهود والروما والسامي والفنلنديين السويديين والتورنيدال كأقليات وطنية."
    }
  },
  {
    id: "sv032", theme: "Mänskliga rättigheter", chapter: 7,
    q: "Vad säger den svenska samtyckeslagen?",
    opts: ["Att sex är förbjudet", "Att sex kräver att alla deltar frivilligt", "Att bara gifta får ha sex", "Att sex måste anmälas"], correct: 1,
    expl: {
      en: "The consent law means anyone who wants sex must make sure the other person takes part voluntarily.",
      uk: "Закон про згоду означає, що той, хто хоче сексу, має переконатися, що інша особа бере участь добровільно.",
      ar: "قانون الموافقة يعني أنّ من يريد ممارسة الجنس عليه التأكد من أن الطرف الآخر يشارك بمحض إرادته."
    }
  },
  {
    id: "sv033", theme: "Mänskliga rättigheter", chapter: 7,
    q: "Är barnäktenskap tillåtet i Sverige?",
    opts: ["Ja", "Nej, det är förbjudet enligt lag", "Bara med föräldrarnas tillstånd", "Bara över 16 år"], correct: 1,
    expl: {
      en: "Child marriage — anyone under 18 marrying — is forbidden by Swedish law.",
      uk: "Дитячі шлюби — коли одружується особа до 18 років — заборонені шведським законом.",
      ar: "زواج الأطفال — أي زواج شخص دون 18 عامًا — محظور بموجب القانون السويدي."
    }
  },

  // ---------------- Kapitel 8 — Arbetsmarknad och privatekonomi ----------------
  {
    id: "sv034", theme: "Arbetsmarknad och privatekonomi", chapter: 8,
    q: "Hur bestäms lönerna på den svenska arbetsmarknaden?",
    opts: [
      "Staten bestämmer alla löner",
      "Genom förhandlingar mellan fackförbund och arbetsgivare (kollektivavtal)",
      "Kungen bestämmer lönerna",
      "EU bestämmer lönerna"
    ], correct: 1,
    expl: {
      en: "In Sweden pay is set by negotiations between unions and employers (collective agreements), not the state.",
      uk: "У Швеції зарплати визначаються переговорами між профспілками та роботодавцями (колдоговори), а не державою.",
      ar: "في السويد تُحدَّد الأجور عبر مفاوضات بين النقابات وأصحاب العمل (اتفاقيات جماعية)، وليس من الدولة."
    },
    terms: [{ term: "fackförbund", expl: {
      sv: "En organisation som företräder arbetstagare och förhandlar om löner.",
      en: "A trade union that represents employees and negotiates pay.",
      uk: "профспілка, яка представляє працівників і веде переговори про зарплату.",
      ar: "نقابة عمالية تمثّل الموظفين وتتفاوض على الأجور." } }]
  },
  {
    id: "sv035", theme: "Arbetsmarknad och privatekonomi", chapter: 8,
    q: "Vad är A-kassan?",
    opts: [
      "En skatt på lönen",
      "En försäkring som ger ersättning vid arbetslöshet",
      "En bank för unga",
      "En myndighet för pensioner"
    ], correct: 1,
    expl: {
      en: "The a-kassa (unemployment insurance) pays money to unemployed members who meet the conditions.",
      uk: "A-kassa (страхування на випадок безробіття) виплачує гроші безробітним членам, які відповідають умовам.",
      ar: "صندوق البطالة (A-kassa) يدفع أموالًا للأعضاء العاطلين عن العمل المستوفين للشروط."
    }
  },
  {
    id: "sv036", theme: "Arbetsmarknad och privatekonomi", chapter: 8,
    q: "Måste man betala skatt på sin lön i Sverige?",
    opts: ["Nej, lön är skattefri", "Ja, och det är olagligt att arbeta utan att betala skatt", "Bara om man tjänar mycket", "Bara svenska medborgare"], correct: 1,
    expl: {
      en: "Everyone who works pays income tax; working without paying tax is illegal.",
      uk: "Кожен, хто працює, платить прибутковий податок; працювати без сплати податку незаконно.",
      ar: "كل من يعمل يدفع ضريبة دخل؛ والعمل دون دفع الضريبة غير قانوني."
    }
  },

  // ---------------- Kapitel 9 — Välfärdssamhället ----------------
  {
    id: "sv037", theme: "Välfärdssamhället", chapter: 9,
    q: "Vad är moms?",
    opts: ["En skatt på lön", "En skatt på varor och tjänster", "En avgift till facket", "En pension"], correct: 1,
    expl: {
      en: "Moms (VAT) is a tax you pay when buying goods and services.",
      uk: "Moms (ПДВ) — це податок, який сплачується під час купівлі товарів і послуг.",
      ar: "ضريبة القيمة المضافة (moms) ضريبة تدفعها عند شراء السلع والخدمات."
    }
  },
  {
    id: "sv038", theme: "Välfärdssamhället", chapter: 9,
    q: "Vem ansvarar för äldreomsorgen i Sverige?",
    opts: ["Staten", "Regionerna", "Kommunerna", "Privatpersoner"], correct: 2,
    expl: {
      en: "By law the municipalities are responsible for elderly care, such as home help and care homes.",
      uk: "За законом за догляд за літніми (домашня допомога, будинки для літніх) відповідають комуни.",
      ar: "بموجب القانون، البلديات مسؤولة عن رعاية المسنّين، كالمساعدة المنزلية ودور الرعاية."
    }
  },
  {
    id: "sv039", theme: "Välfärdssamhället", chapter: 9,
    q: "För vilka åldrar finns grundskola i alla svenska kommuner?",
    opts: ["3–5 år", "6–16 år", "7–18 år", "10–20 år"], correct: 1,
    expl: {
      en: "Every municipality provides compulsory school (grundskola) for children aged 6 to 16.",
      uk: "Кожна комуна забезпечує обов'язкову школу (grundskola) для дітей від 6 до 16 років.",
      ar: "توفّر كل بلدية مدرسة إلزامية (grundskola) للأطفال من 6 إلى 16 عامًا."
    }
  },

  // ---------------- Kapitel 10 — Moderna historia ----------------
  {
    id: "sv040", theme: "Sveriges moderna historia", chapter: 10,
    q: "Vart utvandrade över en miljon svenskar mellan 1850 och 1920?",
    opts: ["Till Tyskland", "Till USA", "Till Ryssland", "Till Storbritannien"], correct: 1,
    expl: {
      en: "Over a million Swedes emigrated to the USA between 1850 and 1920 hoping for a better life.",
      uk: "Понад мільйон шведів емігрували до США між 1850 і 1920 роками в надії на краще життя.",
      ar: "هاجر أكثر من مليون سويدي إلى الولايات المتحدة بين 1850 و1920 أملًا في حياة أفضل."
    }
  },
  {
    id: "sv041", theme: "Sveriges moderna historia", chapter: 10,
    q: "Vilket år hölls det första riksdagsvalet där både män och kvinnor fick rösta?",
    opts: ["1865", "1909", "1921", "1945"], correct: 2,
    expl: {
      en: "In 1921 both men and women voted in a riksdag election for the first time — Sweden had become a democracy.",
      uk: "У 1921 році чоловіки й жінки вперше голосували на виборах до риксдагу — Швеція стала демократією.",
      ar: "في عام 1921 صوّت الرجال والنساء لأول مرة في انتخابات البرلمان — وبذلك أصبحت السويد ديمقراطية."
    }
  },
  {
    id: "sv042", theme: "Sveriges moderna historia", chapter: 10,
    q: "Vad var miljonprogrammet på 1960-talet?",
    opts: [
      "En plan att bygga en miljon bostäder på tio år",
      "En miljon nya jobb",
      "En militär övning",
      "Ett bidrag på en miljon kronor"
    ], correct: 0,
    expl: {
      en: "The 'million programme' was a state plan in the 1960s to build a million homes in ten years.",
      uk: "«Мільйонна програма» — це державний план 1960-х побудувати мільйон помешкань за десять років.",
      ar: "«برنامج المليون» كان خطة حكومية في الستينيات لبناء مليون مسكن خلال عشر سنوات."
    }
  },
  {
    id: "sv043", theme: "Sveriges moderna historia", chapter: 10,
    q: "Var Sverige med som stridande part i första och andra världskriget?",
    opts: ["Ja, i båda", "Nej, Sverige var neutralt i båda", "Bara i första", "Bara i andra"], correct: 1,
    expl: {
      en: "Sweden declared itself neutral and did not fight in either world war.",
      uk: "Швеція оголосила нейтралітет і не воювала в жодній зі світових воєн.",
      ar: "أعلنت السويد حيادها ولم تشارك مقاتِلةً في أيٍّ من الحربين العالميتين."
    }
  },

  // ---------------- Kapitel 11 — Sverige och omvärlden ----------------
  {
    id: "sv044", theme: "Sverige och omvärlden", chapter: 11,
    q: "Vilket land förlorade Sverige i kriget 1808–1809?",
    opts: ["Norge", "Finland", "Danmark", "Estland"], correct: 1,
    expl: {
      en: "Sweden lost Finland, which had been part of Sweden for nearly 700 years, in the 1808–1809 war with Russia.",
      uk: "У війні 1808–1809 років з Росією Швеція втратила Фінляндію, що майже 700 років була частиною Швеції.",
      ar: "خسرت السويد فنلندا، التي كانت جزءًا منها نحو 700 عام، في حرب 1808–1809 مع روسيا."
    }
  },
  {
    id: "sv045", theme: "Sverige och omvärlden", chapter: 11,
    q: "Vad kallas EU:s princip om att människor och varor fritt kan röra sig mellan medlemsländerna?",
    opts: ["De fyra friheterna", "Schengenavtalet", "Kollektivavtalet", "Folkhemmet"], correct: 0,
    expl: {
      en: "The 'four freedoms' let people and goods move freely — e.g. any EU citizen can work or study in another EU country.",
      uk: "«Чотири свободи» дозволяють вільний рух людей і товарів — напр., громадянин ЄС може працювати чи навчатися в іншій країні ЄС.",
      ar: "«الحريات الأربع» تتيح حرية تنقّل الأشخاص والبضائع — فمثلًا يمكن لأي مواطن أوروبي العمل أو الدراسة في دولة أوروبية أخرى."
    }
  },
  {
    id: "sv046", theme: "Sverige och omvärlden", chapter: 11,
    q: "Vad innebär totalförsvarsplikt i Sverige?",
    opts: [
      "Att alla män måste bli soldater",
      "Att alla mellan 16 och 70 år kan behöva hjälpa till att försvara landet",
      "Att bara medborgare försvarar landet",
      "Att försvaret är frivilligt"
    ], correct: 1,
    expl: {
      en: "Total defence obligation means everyone living in Sweden aged 16–70 may have to help defend the country if needed.",
      uk: "Обов'язок тотальної оборони означає, що всі мешканці Швеції віком 16–70 років можуть бути залучені до оборони країни за потреби.",
      ar: "واجب الدفاع الشامل يعني أن كل مقيم في السويد بين 16 و70 عامًا قد يُطلب منه المساعدة في الدفاع عن البلاد عند الحاجة."
    }
  },

  // ---------------- Kapitel 12 — Sekulär stat ----------------
  {
    id: "sv047", theme: "En sekulär stat och religion", chapter: 12,
    q: "Vad betyder det att Sverige är en sekulär stat?",
    opts: [
      "Att religion är förbjuden",
      "Att staten är religiöst neutral och inte gynnar någon religion",
      "Att alla måste tillhöra Svenska kyrkan",
      "Att bara kristendom är tillåten"
    ], correct: 1,
    expl: {
      en: "A secular state is religiously neutral: it does not favour or discriminate against any religion, and there is freedom of religion.",
      uk: "Світська держава релігійно нейтральна: вона не надає переваг і не дискримінує жодну релігію, і діє свобода віросповідання.",
      ar: "الدولة العلمانية محايدة دينيًا: لا تُفضّل أو تميّز ضد أي دين، وتكفل حرية المعتقد."
    }
  },
  {
    id: "sv048", theme: "En sekulär stat och religion", chapter: 12,
    q: "Vilket år skildes den svenska staten och Svenska kyrkan åt?",
    opts: ["1951", "1979", "2000", "2020"], correct: 2,
    expl: {
      en: "The state and the Church of Sweden were separated in 2000; the church became one religious community among many.",
      uk: "Держава і Шведська церква були розділені у 2000 році; церква стала однією з багатьох релігійних громад.",
      ar: "انفصلت الدولة عن كنيسة السويد عام 2000؛ وأصبحت الكنيسة إحدى الطوائف الدينية بين كثيرين."
    }
  },
  {
    id: "sv049", theme: "En sekulär stat och religion", chapter: 12,
    q: "Vilken är den näst största religionen i Sverige?",
    opts: ["Judendom", "Islam", "Hinduism", "Buddhism"], correct: 1,
    expl: {
      en: "After Christianity, Islam is the second-largest religion in Sweden, with mosques across the country.",
      uk: "Після християнства іслам є другою за величиною релігією у Швеції, з мечетями по всій країні.",
      ar: "بعد المسيحية، الإسلام هو ثاني أكبر ديانة في السويد، وله مساجد في أنحاء البلاد."
    }
  },

  // ---------------- Kapitel 13 — Traditioner och högtider ----------------
  {
    id: "sv050", theme: "Traditioner och högtider", chapter: 13,
    q: "Vad firar man i Sverige på första maj?",
    opts: ["Sveriges nationaldag", "Arbetarnas dag", "Midsommar", "Kristi himmelsfärd"], correct: 1,
    expl: {
      en: "1 May is International Workers' Day, a public holiday marked especially by the labour movement.",
      uk: "1 травня — Міжнародний день трудящих, вихідний день, який особливо відзначає робітничий рух.",
      ar: "الأول من مايو هو اليوم العالمي للعمّال، وهو عطلة رسمية تحتفل بها الحركة العمالية بوجه خاص."
    }
  },
  {
    id: "sv051", theme: "Traditioner och högtider", chapter: 13,
    q: "När firas Valborgsmässoafton, som välkomnar våren med stora brasor?",
    opts: ["24 december", "30 april", "6 juni", "31 oktober"], correct: 1,
    expl: {
      en: "Walpurgis Night (Valborg) is celebrated on 30 April to welcome spring, with large bonfires and songs.",
      uk: "Вальпургієва ніч (Valborg) святкується 30 квітня, щоб зустріти весну, з великими багаттями й піснями.",
      ar: "تُحتفل ليلة فالبورغ (Valborg) في 30 أبريل للترحيب بالربيع، بنيران كبيرة وأغانٍ."
    }
  },

  // ============================================================
  // Scaling batch — grounded in Sverige i fokus. Swedish question +
  // options are complete; explanations are English for now (UK/AR/FA/TR
  // added by the translation pass — see ingest/). No shortcuts on the
  // question content or answer keys.
  // ============================================================

  // Kapitel 1 — Landet Sverige
  { id: "sv052", theme: "Landet Sverige", chapter: 1,
    q: "Vilket är det största landet i Norden?", opts: ["Danmark", "Norge", "Sverige", "Finland"], correct: 2,
    expl: { en: "The Nordic region has five countries (Denmark, Finland, Iceland, Norway, Sweden); Sweden is the largest." } },
  { id: "sv053", theme: "Landet Sverige", chapter: 1,
    q: "Vilka tre stora landsdelar brukar Sverige delas in i?", opts: ["Götaland, Svealand och Norrland", "Skåne, Uppland och Lappland", "Öst, Väst och Syd", "Gotland, Öland och Åland"], correct: 0,
    expl: { en: "Sweden is divided into three large parts: Götaland (south), Svealand (central) and Norrland (north)." } },
  { id: "sv054", theme: "Landet Sverige", chapter: 1,
    q: "Vad heter Sveriges högsta berg?", opts: ["Kebnekaise", "Kilimanjaro", "Galdhøpiggen", "Åreskutan"], correct: 0,
    expl: { en: "Kebnekaise, in the mountains along the Norwegian border, is Sweden's highest peak at about 2,000 m." } },
  { id: "sv055", theme: "Landet Sverige", chapter: 1,
    q: "Vilken är en viktig förnybar energikälla i Sveriges älvar?", opts: ["Kolkraft", "Vattenkraft", "Kärnkraft", "Oljekraft"], correct: 1,
    expl: { en: "Hydropower from running water in the rivers produces a large share of Sweden's electricity." } },

  // Kapitel 2 — demokratiska systemet
  { id: "sv056", theme: "Sveriges demokratiska system", chapter: 2,
    q: "Vad innebär yttrandefrihet?", opts: ["Rätten att äga vapen", "Rätten att skriva och säga vad man tycker", "Rätten att inte betala skatt", "Rätten att rösta flera gånger"], correct: 1,
    expl: { en: "Freedom of expression is the right to write and say what you think." } },
  { id: "sv057", theme: "Sveriges demokratiska system", chapter: 2,
    q: "Vilket av följande är ett sätt att påverka samhället i en demokrati?", opts: ["Att muta politiker", "Att demonstrera eller gå med i en förening", "Att hota journalister", "Att sprida falsk information"], correct: 1,
    expl: { en: "You can influence society by voting, joining a party or association, contacting politicians, or demonstrating." } },

  // Kapitel 3 — Så här styrs Sverige
  { id: "sv058", theme: "Så här styrs Sverige", chapter: 3,
    q: "Vad består 'staten' av i Sverige?", opts: ["Bara kungen", "Riksdag, regering, myndigheter och domstolar", "Bara kommunerna", "Bara regeringen"], correct: 1,
    expl: { en: "The state consists of the Riksdag, the government, the public authorities and the courts." } },
  { id: "sv059", theme: "Så här styrs Sverige", chapter: 3,
    q: "Vad är oppositionens uppgift i riksdagen?", opts: ["Att styra landet", "Att granska regeringen och föreslå en annan politik", "Att utse kungen", "Att döma brottslingar"], correct: 1,
    expl: { en: "The opposition is the parties that don't support the government; their job is to scrutinise it and propose alternatives." } },
  { id: "sv060", theme: "Så här styrs Sverige", chapter: 3,
    q: "Vilka kontrollerar att myndigheterna gör rätt?", opts: ["Kungen", "Justitieombudsmannen (JO) och Justitiekanslern (JK)", "Riksbanken", "Polisen"], correct: 1,
    expl: { en: "Special watchdogs, the Parliamentary Ombudsman (JO) and the Chancellor of Justice (JK), check that authorities act correctly." } },
  { id: "sv061", theme: "Så här styrs Sverige", chapter: 3,
    q: "Vilket av följande ansvarar kommunen för?", opts: ["Försvaret", "Skola, äldreomsorg och vatten", "Utrikespolitiken", "Sjukhusvården"], correct: 1,
    expl: { en: "Municipalities handle much everyday service: schools, elderly and child care, water and sewage, adult education." } },

  // Kapitel 4 — Politiska val och partier
  { id: "sv062", theme: "Politiska val och partier", chapter: 4,
    q: "Vad betyder proportionella val?", opts: ["Att vinnaren tar allt", "Att partierna får platser efter sin andel av rösterna", "Att kungen väljer", "Att bara stora partier får platser"], correct: 1,
    expl: { en: "Proportional elections give parties seats in proportion to their share of the vote (20% of votes ≈ 20% of seats)." } },
  { id: "sv063", theme: "Politiska val och partier", chapter: 4,
    q: "Måste man vara svensk medborgare för att rösta i kommunvalet?", opts: ["Ja, alltid", "Nej, men man ska ha varit folkbokförd i Sverige i minst tre år", "Ja, i minst fem år", "Nej, inga krav alls"], correct: 1,
    expl: { en: "For municipal and regional elections you needn't be a citizen, but must have been registered in Sweden for three years (EU/Nordic citizens: just registered)." } },
  { id: "sv064", theme: "Politiska val och partier", chapter: 4,
    q: "Hur många partier satt i riksdagen fram till valet 2026?", opts: ["Fyra", "Sex", "Åtta", "Tolv"], correct: 2,
    expl: { en: "Eight parties held seats: C, KD, L, MP, M, S, SD and V." } },

  // Kapitel 5 — Lag och rätt
  { id: "sv065", theme: "Lag och rätt", chapter: 5,
    q: "Vilken grundlag säger att all offentlig makt utgår från folket?", opts: ["Tryckfrihetsförordningen", "Regeringsformen", "Successionsordningen", "Yttrandefrihetsgrundlagen"], correct: 1,
    expl: { en: "The Instrument of Government (regeringsformen) states that all public power proceeds from the people." } },
  { id: "sv066", theme: "Lag och rätt", chapter: 5,
    q: "Vad skyddar tryckfrihetsförordningen?", opts: ["Rätten att bära vapen", "Det fria ordet i tryckt form", "Rätten till bostad", "Kungens makt"], correct: 1,
    expl: { en: "The Freedom of the Press Act protects the free word in print — the right to publish books, newspapers and magazines." } },
  { id: "sv067", theme: "Lag och rätt", chapter: 5,
    q: "Vilken myndighet gör pass och nationella id-kort till svenska medborgare?", opts: ["Skatteverket", "Polisen", "Migrationsverket", "Försäkringskassan"], correct: 1,
    expl: { en: "The police make passports and national ID cards, and decide on permits such as for a demonstration." } },
  { id: "sv068", theme: "Lag och rätt", chapter: 5,
    q: "Vad är nämndemän i en domstol?", opts: ["Poliser i rätten", "Lekmän som dömer tillsammans med domaren och representerar allmänheten", "Advokater", "Åklagare"], correct: 1,
    expl: { en: "Lay judges (nämndemän) judge together with the judge in the district court and give the public insight into the process." } },
  { id: "sv069", theme: "Lag och rätt", chapter: 5,
    q: "Vilket av följande yttranden är förbjudet enligt lag?", opts: ["Att kritisera regeringen", "Hets mot folkgrupp", "Att demonstrera", "Att skriva en debattartikel"], correct: 1,
    expl: { en: "Freedom of expression is protected, but incitement against a group (hets mot folkgrupp), defamation and hate crime are forbidden." } },

  // Kapitel 6 — Medier
  { id: "sv070", theme: "Mediernas roll", chapter: 6,
    q: "Vad kännetecknar public service-medier i Sverige?", opts: ["De ägs av staten och styrs politiskt", "De har ett särskilt uppdrag och ska vara oberoende", "De finansieras bara av reklam", "De är förbjudna"], correct: 1,
    expl: { en: "Three public-service companies have a special remit and must be independent of political and commercial interests." } },
  { id: "sv071", theme: "Mediernas roll", chapter: 6,
    q: "Vem är juridiskt ansvarig för vad som publiceras i en tidning eller i tv?", opts: ["Läsaren", "Den ansvariga utgivaren", "Regeringen", "Journalistförbundet"], correct: 1,
    expl: { en: "A responsible publisher (ansvarig utgivare) is legally responsible for what is published." } },

  // Kapitel 7 — Mänskliga rättigheter
  { id: "sv072", theme: "Mänskliga rättigheter", chapter: 7,
    q: "Vad förbjuder den svenska diskrimineringslagen?", opts: ["All reklam", "Att behandla människor sämre på grund av t.ex. kön, ålder, etnicitet eller religion", "Att starta företag", "Att resa utomlands"], correct: 1,
    expl: { en: "The Discrimination Act forbids treating people worse because of sex, age, ethnicity, religion, disability or sexual orientation." } },
  { id: "sv073", theme: "Mänskliga rättigheter", chapter: 7,
    q: "Sedan vilket år är FN:s barnkonvention lag i Sverige?", opts: ["2000", "2009", "2020", "2024"], correct: 2,
    expl: { en: "The UN Convention on the Rights of the Child has been Swedish law since 2020." } },
  { id: "sv074", theme: "Mänskliga rättigheter", chapter: 7,
    q: "Vem kan straffas enligt den svenska sexköpslagen?", opts: ["Den som säljer sex", "Den som köper sex", "Båda", "Ingen"], correct: 1,
    expl: { en: "Buying sex is illegal in Sweden; the buyer can be punished, but not the person who sells." } },
  { id: "sv075", theme: "Mänskliga rättigheter", chapter: 7,
    q: "Vilken myndighet arbetar för allas lika rättigheter och att diskrimineringslagen följs?", opts: ["Diskrimineringsombudsmannen (DO)", "Skatteverket", "Polisen", "Migrationsverket"], correct: 0,
    expl: { en: "The Equality Ombudsman (DO) works for equal rights and ensures the Discrimination Act is followed." } },
  { id: "sv076", theme: "Mänskliga rättigheter", chapter: 7,
    q: "Är det tillåtet att gifta sig med en person av samma kön i Sverige?", opts: ["Nej", "Ja", "Bara i vissa kommuner", "Bara utomlands"], correct: 1,
    expl: { en: "Same-sex marriage is legal; the right to live with whom you want is protected by law." } },

  // Kapitel 8 — Arbetsmarknad och privatekonomi
  { id: "sv077", theme: "Arbetsmarknad och privatekonomi", chapter: 8,
    q: "Ungefär hur stor andel av dem som arbetar i Sverige jobbar i privat sektor?", opts: ["Cirka 30 procent", "Cirka 50 procent", "Cirka 70 procent", "Cirka 90 procent"], correct: 2,
    expl: { en: "About 70% work in the private sector and about 30% in the public sector (state, regions, municipalities)." } },
  { id: "sv078", theme: "Arbetsmarknad och privatekonomi", chapter: 8,
    q: "Vad gör Kronofogdemyndigheten?", opts: ["Delar ut pass", "Ser till att skulder blir betalda och kan hjälpa vid skuldsanering", "Bestämmer räntan", "Anställer poliser"], correct: 1,
    expl: { en: "The Enforcement Authority ensures debts are paid and can help heavily indebted people through debt restructuring." } },
  { id: "sv079", theme: "Arbetsmarknad och privatekonomi", chapter: 8,
    q: "Till vem ska alla som haft en inkomst under året deklarera?", opts: ["Försäkringskassan", "Skatteverket", "Arbetsförmedlingen", "Kronofogden"], correct: 1,
    expl: { en: "Everyone who has had an income must declare it to the Swedish Tax Agency (Skatteverket)." } },

  // Kapitel 9 — Välfärdssamhället
  { id: "sv080", theme: "Välfärdssamhället", chapter: 9,
    q: "Vad är socialtjänsten i en kommun ansvarig för?", opts: ["Att bygga vägar", "Att ge stöd och skydd till personer som behöver det", "Att sköta försvaret", "Att driva sjukhus"], correct: 1,
    expl: { en: "Each municipality's social services give support and protection — e.g. to families in need, homeless people, or those exposed to violence." } },
  { id: "sv081", theme: "Välfärdssamhället", chapter: 9,
    q: "Vart vänder man sig oftast först för icke-akut vård?", opts: ["Till akutsjukhuset", "Till en vårdcentral (primärvård)", "Till polisen", "Till kommunfullmäktige"], correct: 1,
    expl: { en: "Primary care — the health centre (vårdcentral) — is usually the first point of contact for non-emergency care." } },
  { id: "sv082", theme: "Välfärdssamhället", chapter: 9,
    q: "Vad finansierar staten inom välfärden?", opts: ["Snöröjning", "Pension, sjukförsäkring, studiestöd och barnbidrag", "Biblioteken", "Kollektivtrafiken"], correct: 1,
    expl: { en: "The state funds pensions, sickness and parental insurance, unemployment insurance, study support and child allowance." } },

  // Kapitel 10 — Moderna historia
  { id: "sv083", theme: "Sveriges moderna historia", chapter: 10,
    q: "Vad innebär 'den svenska modellen' på arbetsmarknaden?", opts: ["Att staten bestämmer alla löner", "Att arbetsgivare och fackförbund själva kommer överens om villkoren i kollektivavtal", "Att ingen får strejka", "Att kungen bestämmer"], correct: 1,
    expl: { en: "The 'Swedish model', rooted in the 1938 Saltsjöbaden agreement, means employers and unions — not politicians — agree labour terms." } },
  { id: "sv084", theme: "Sveriges moderna historia", chapter: 10,
    q: "Vem formulerade idén om 'folkhemmet' 1928?", opts: ["Raoul Wallenberg", "Per Albin Hansson", "Carl XVI Gustaf", "Alfred Nobel"], correct: 1,
    expl: { en: "Social Democratic leader Per Albin Hansson described the 'people's home' — a society of security and community for all." } },
  { id: "sv085", theme: "Sveriges moderna historia", chapter: 10,
    q: "Vilken svensk diplomat gav judar skyddspass under andra världskriget?", opts: ["Dag Hammarskjöld", "Raoul Wallenberg", "Olof Palme", "Per Albin Hansson"], correct: 1,
    expl: { en: "Diplomat Raoul Wallenberg issued protective passports that shielded Jews from being sent to concentration camps." } },
  { id: "sv086", theme: "Sveriges moderna historia", chapter: 10,
    q: "Vilket år fattades beslutet om allmän rösträtt i Sverige?", opts: ["1865", "1909", "1918", "1945"], correct: 2,
    expl: { en: "The decision on universal suffrage came in 1918; the first election where both men and women voted was in 1921." } },

  // Kapitel 11 — Sverige och omvärlden
  { id: "sv087", theme: "Sverige och omvärlden", chapter: 11,
    q: "Vad är ett av FN:s viktigaste syften?", opts: ["Att bestämma svenska skatter", "Att bevara fred och säkerhet i världen", "Att styra EU", "Att sätta räntan"], correct: 1,
    expl: { en: "The UN works to keep peace and security, resolve conflicts, and promote human rights and the equal value of all peoples." } },
  { id: "sv088", theme: "Sverige och omvärlden", chapter: 11,
    q: "Vad gör den statliga myndigheten Sida?", opts: ["Sköter sjukvården", "Arbetar för att minska fattigdom och förtryck i världen", "Bygger vägar i Sverige", "Delar ut pass"], correct: 1,
    expl: { en: "Sida runs Sweden's international development cooperation — reducing poverty and oppression and supporting democracy abroad." } },
  { id: "sv089", theme: "Sverige och omvärlden", chapter: 11,
    q: "Hur gammal ska man vara för att omfattas av den allmänna värnplikten?", opts: ["Ha fyllt 15 år", "Ha fyllt 18 år", "Ha fyllt 20 år", "Ha fyllt 25 år"], correct: 1,
    expl: { en: "General conscription covers all men and women who have turned 18; only some are selected for military training." } },
  { id: "sv090", theme: "Sverige och omvärlden", chapter: 11,
    q: "Vilket år blev Norge på fredlig väg en självständig stat, skild från Sverige?", opts: ["1809", "1865", "1905", "1945"], correct: 2,
    expl: { en: "Norway, forced into a union with Sweden after the Napoleonic wars, peacefully became independent in 1905." } },

  // Kapitel 12 — Sekulär stat
  { id: "sv091", theme: "En sekulär stat och religion", chapter: 12,
    q: "Vilket år kom religionsfrihetslagen som gav alla rätt att fritt välja religion eller ingen alls?", opts: ["1860", "1951", "2000", "2020"], correct: 1,
    expl: { en: "The 1951 Freedom of Religion Act let people freely choose their religion — or none at all." } },
  { id: "sv092", theme: "En sekulär stat och religion", chapter: 12,
    q: "Vilket är det största kristna samfundet i Sverige?", opts: ["Katolska kyrkan", "Svenska kyrkan", "Ortodoxa kyrkan", "Pingstkyrkan"], correct: 1,
    expl: { en: "The Church of Sweden, Lutheran-Protestant, is the largest Christian community, with around five million members." } },

  // Kapitel 13 — Traditioner och högtider
  { id: "sv093", theme: "Traditioner och högtider", chapter: 13,
    q: "Vilken högtid firas i mars eller april till minne av Jesus död och uppståndelse?", opts: ["Jul", "Påsk", "Midsommar", "Valborg"], correct: 1,
    expl: { en: "Easter (påsk) is a Christian holiday in March or April remembering the death and resurrection of Jesus." } },
  { id: "sv094", theme: "Traditioner och högtider", chapter: 13,
    q: "När firas nyårsafton i Sverige?", opts: ["1 januari", "31 december", "6 juni", "24 december"], correct: 1,
    expl: { en: "New Year's Eve is celebrated on 31 December, often with parties and fireworks at midnight." } }
];
