/* CitizenPrep — practice, mistake review and exam simulator
 * with freemium gating backed by the API in ../server (optional: the app
 * degrades gracefully to free mode on pure static hosting).
 *
 * Real exam rules (SIRI): medborgerskabsprøven is 25 questions / 30 min /
 * pass >= 20 — the format the simulator mirrors. Free users get a reduced
 * bank and a 10-question demo exam.
 */

const EXAM_CONFIG = { questionCount: 25, minutes: 30, passMark: 20 };
const DEMO_CONFIG = { questionCount: 10, minutes: 12, passMark: 8 };
const FREE_QUESTIONS = 10;
const LETTERS = ["A", "B", "C"];
const API = ""; // same origin; server serves both app and /api

/* ---------------------------------------------------------------- i18n */

const UI = {
  da: {
    ui_lang: "Sprog:",
    expl_lang: "Forklaringer:",
    expl_none: "Kun dansk",
    full_access: "Fuld adgang ✓",
    hero_title: "Bestå indfødsretsprøven i første forsøg",
    hero_sub: "Træn med spørgsmål i samme format som den rigtige prøve — med øjeblikkelig feedback og forklaringer på dit eget sprog.",
    mode_practice: "Øvelse",
    mode_practice_sub: "Ét spørgsmål ad gangen med øjeblikkelig feedback og forklaring.",
    mode_exam: "Prøvesimulator",
    mode_mistakes: "Repetér fejl",
    theme: "Emne",
    all_themes: "Alle emner",
    stat_answered: "besvarede",
    stat_accuracy: "rigtige",
    stat_weakest: "svageste emne",
    stat_exams: "seneste eksamen",
    pricing_title: "Fuld adgang",
    pricing_sub: "Alle spørgsmål, fuld eksamenssimulator og alle forklaringer — indtil du har bestået.",
    buy: "Køb fuld adgang",
    buy_title: "Køb fuld adgang",
    buy_sub: "Indtast din e-mail. Du får et adgangslink tilsendt efter betaling.",
    buy_pay: "Til betaling",
    cancel: "Annuller",
    next: "Næste →",
    quit: "Afslut",
    again: "Prøv igen",
    kbd_hint: "Tastatur: A · B · C, Enter = næste",
    upsell: "Vil du træne med hele spørgsmålsbanken og den fulde eksamen?",
    footer: "Prototype. Spørgsmålsformatet følger den officielle prøve (SIRI). Dette er ikke en officiel tjeneste.",
    exam_sub_full: (n, min) => `${n} spørgsmål · ${min} minutter · som til den rigtige prøve.`,
    exam_sub_demo: (n, min) => `Demo: ${n} spørgsmål · ${min} minutter. Fuld eksamen kræver fuld adgang.`,
    mistakes_sub: (n) => n ? `${n} spørgsmål, du tidligere har svaret forkert på.` : "Ingen fejl at repetere — endnu.",
    free_info: (free, total) => `Gratis udgave: ${free} af ${total} spørgsmål.`,
    bank_info: (n) => `Spørgsmålsbank: ${n} spørgsmål · prototype-udgave (udvides med officielle prøvesæt 2010–2025).`,
    q_progress: (i, n) => `Spørgsmål ${i} af ${n}`,
    correct_fb: "✅ Rigtigt!",
    wrong_fb: (letter, text) => `❌ Forkert. Det rigtige svar er <strong>${letter}: ${text}</strong>.`,
    passed: "Bestået!",
    failed: "Ikke bestået — endnu",
    result_detail: (score, total, pass) => `${score} af ${total} rigtige (beståelseskrav: ${pass})`,
    timed_out: " · Tiden udløb",
    review_title: "Gennemgå dine fejl",
    all_correct: "Alle svar var rigtige — flot!",
    last_exam: (score, total) => `${score}/${total}`,
    buying: "Vent…",
    buy_failed: "Betalingen kunne ikke startes. Prøv igen, eller kontakt os.",
    unlocked: "Fuld adgang låst op! 🎉",
    offline_buy: "Betaling er ikke tilgængelig i denne demo-visning (backend kører ikke).",
  },
  en: {
    ui_lang: "Language:",
    expl_lang: "Explanations:",
    expl_none: "Danish only",
    full_access: "Full access ✓",
    hero_title: "Pass the Danish citizenship test on your first try",
    hero_sub: "Train with questions in the exact format of the real exam — with instant feedback and explanations in your own language.",
    mode_practice: "Practice",
    mode_practice_sub: "One question at a time with instant feedback and explanations.",
    mode_exam: "Exam simulator",
    mode_mistakes: "Review mistakes",
    theme: "Topic",
    all_themes: "All topics",
    stat_answered: "answered",
    stat_accuracy: "correct",
    stat_weakest: "weakest topic",
    stat_exams: "last exam",
    pricing_title: "Full access",
    pricing_sub: "All questions, the full exam simulator and all explanations — until you pass.",
    buy: "Get full access",
    buy_title: "Get full access",
    buy_sub: "Enter your email. You'll receive an access link after payment.",
    buy_pay: "Continue to payment",
    cancel: "Cancel",
    next: "Next →",
    quit: "Quit",
    again: "Try again",
    kbd_hint: "Keyboard: A · B · C, Enter = next",
    upsell: "Want to train with the full question bank and the full exam?",
    footer: "Prototype. Question format follows the official exam (SIRI). This is not an official service.",
    exam_sub_full: (n, min) => `${n} questions · ${min} minutes · just like the real exam.`,
    exam_sub_demo: (n, min) => `Demo: ${n} questions · ${min} minutes. The full exam requires full access.`,
    mistakes_sub: (n) => n ? `${n} questions you previously answered incorrectly.` : "No mistakes to review — yet.",
    free_info: (free, total) => `Free version: ${free} of ${total} questions.`,
    bank_info: (n) => `Question bank: ${n} questions · prototype edition (to be extended with official exam sets 2010–2025).`,
    q_progress: (i, n) => `Question ${i} of ${n}`,
    correct_fb: "✅ Correct!",
    wrong_fb: (letter, text) => `❌ Wrong. The correct answer is <strong>${letter}: ${text}</strong>.`,
    passed: "Passed!",
    failed: "Not passed — yet",
    result_detail: (score, total, pass) => `${score} of ${total} correct (pass mark: ${pass})`,
    timed_out: " · Time ran out",
    review_title: "Review your mistakes",
    all_correct: "All answers were correct — well done!",
    last_exam: (score, total) => `${score}/${total}`,
    buying: "Please wait…",
    buy_failed: "Could not start the payment. Please try again or contact us.",
    unlocked: "Full access unlocked! 🎉",
    offline_buy: "Payment is not available in this demo view (backend not running).",
  },
};

/* ------------------------------------------------------- persistence */

const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem("itt:" + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("itt:" + key, JSON.stringify(value)); } catch {}
  },
};

let uiLang = store.get("uiLang", "da");
let explLang = store.get("explLang", "en");
let qstats = store.get("qstats", {});      // { [qid]: {right, wrong} }
let examHistory = store.get("examHistory", []); // [{ts, score, total, passed}]
let accessToken = store.get("token", null);
let paid = false;

const t = (key, ...args) => {
  const val = (UI[uiLang] || UI.da)[key] ?? UI.da[key] ?? key;
  return typeof val === "function" ? val(...args) : val;
};

/* -------------------------------------------------------------- DOM */

const $ = (id) => document.getElementById(id);
const els = {
  screens: { start: $("screen-start"), quiz: $("screen-quiz"), result: $("screen-result") },
  uiLang: $("uiLang"), explLang: $("explLang"), paidBadge: $("paid-badge"),
  themeFilter: $("themeFilter"), examCardSub: $("exam-card-sub"), mistakesCardSub: $("mistakes-card-sub"),
  statsPanel: $("stats-panel"),
  pricing: $("pricing"), freeInfo: $("free-info"), bankInfo: $("bank-info"),
  progress: $("quiz-progress"), timer: $("quiz-timer"), progressFill: $("progressbar-fill"),
  theme: $("q-theme"), qText: $("q-text"), options: $("q-options"), feedback: $("q-feedback"),
  next: $("btn-next"), quit: $("btn-quit"),
  resultBadge: $("result-badge"), resultTitle: $("result-title"),
  resultDetail: $("result-detail"), resultReview: $("result-review"), resultUpsell: $("result-upsell"),
  buyDialog: $("buy-dialog"), buyForm: $("buy-form"), buyEmail: $("buy-email"),
  buyError: $("buy-error"), buySubmit: $("buy-submit"),
  toast: $("toast"),
};

let state = null;
let timerHandle = null;

/* ------------------------------------------------------------ helpers */

function show(name) {
  for (const [key, el] of Object.entries(els.screens)) el.classList.toggle("hidden", key !== name);
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.remove("hidden");
  setTimeout(() => els.toast.classList.add("hidden"), 3500);
}

function availableBank() {
  return paid ? window.QUESTION_BANK : window.QUESTION_BANK.slice(0, FREE_QUESTIONS);
}

function mistakeQuestions() {
  return availableBank().filter((q) => (qstats[q.id]?.wrong || 0) > 0);
}

function explanationFor(q) {
  if (explLang === "none") return "";
  return q.expl?.[explLang] || q.expl?.en || "";
}

/* --------------------------------------------------------------- i18n */

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-opt]").forEach((el) => {
    el.textContent = t(el.dataset.i18nOpt);
  });
  renderStart();
}

/* -------------------------------------------------------- start screen */

function renderStart() {
  const bank = availableBank();
  const exam = paid ? EXAM_CONFIG : DEMO_CONFIG;

  els.examCardSub.textContent = paid
    ? t("exam_sub_full", exam.questionCount, exam.minutes)
    : t("exam_sub_demo", exam.questionCount, exam.minutes);

  const mistakes = mistakeQuestions();
  els.mistakesCardSub.textContent = t("mistakes_sub", mistakes.length);
  $("btn-mistakes").disabled = mistakes.length === 0;
  $("btn-mistakes").style.opacity = mistakes.length === 0 ? 0.55 : 1;

  // Theme filter
  const themes = [...new Set(bank.map((q) => q.theme))];
  els.themeFilter.innerHTML =
    `<option value="">${t("all_themes")}</option>` +
    themes.map((th) => `<option value="${th}">${th}</option>`).join("");

  // Stats
  const answered = Object.values(qstats).reduce((s, x) => s + x.right + x.wrong, 0);
  if (answered > 0 || examHistory.length > 0) {
    els.statsPanel.classList.remove("hidden");
    const right = Object.values(qstats).reduce((s, x) => s + x.right, 0);
    $("stat-answered").textContent = answered;
    $("stat-accuracy").textContent = answered ? Math.round((right / answered) * 100) + " %" : "–";

    const perTheme = {};
    for (const q of window.QUESTION_BANK) {
      const s = qstats[q.id];
      if (!s) continue;
      perTheme[q.theme] = perTheme[q.theme] || { right: 0, wrong: 0 };
      perTheme[q.theme].right += s.right;
      perTheme[q.theme].wrong += s.wrong;
    }
    let weakest = "–";
    let worst = 1.01;
    for (const [th, s] of Object.entries(perTheme)) {
      const total = s.right + s.wrong;
      if (total < 2) continue;
      const acc = s.right / total;
      if (acc < worst) { worst = acc; weakest = th; }
    }
    $("stat-weakest").textContent = weakest;

    const last = examHistory[examHistory.length - 1];
    $("stat-exams").textContent = last ? t("last_exam", last.score, last.total) : "–";
  } else {
    els.statsPanel.classList.add("hidden");
  }

  // Pricing / gating info
  els.pricing.classList.toggle("hidden", paid);
  els.paidBadge.classList.toggle("hidden", !paid);
  els.freeInfo.textContent = paid ? "" : t("free_info", FREE_QUESTIONS, window.QUESTION_BANK.length);
  els.bankInfo.textContent = t("bank_info", window.QUESTION_BANK.length);
}

/* ------------------------------------------------------------ sessions */

function startSession(mode, questions) {
  if (!questions.length) return;
  state = { mode, questions, index: 0, answers: [], config: paid ? EXAM_CONFIG : DEMO_CONFIG };

  els.timer.classList.toggle("hidden", mode !== "exam");
  if (mode === "exam") startTimer(state.config.minutes * 60);

  show("quiz");
  renderQuestion();
}

function startPractice() {
  const theme = els.themeFilter.value;
  let qs = shuffled(availableBank());
  if (theme) qs = qs.filter((q) => q.theme === theme);
  startSession("practice", qs);
}

function startExam() {
  const cfg = paid ? EXAM_CONFIG : DEMO_CONFIG;
  startSession("exam", shuffled(availableBank()).slice(0, cfg.questionCount));
}

function startMistakes() {
  startSession("practice", shuffled(mistakeQuestions()));
}

function startTimer(seconds) {
  stopTimer();
  let remaining = seconds;
  const tick = () => {
    const m = String(Math.floor(remaining / 60)).padStart(2, "0");
    const s = String(remaining % 60).padStart(2, "0");
    els.timer.textContent = `${m}:${s}`;
    els.timer.classList.toggle("low", remaining <= 120);
    if (remaining <= 0) { stopTimer(); finishSession(true); return; }
    remaining--;
  };
  tick();
  timerHandle = setInterval(tick, 1000);
}

function stopTimer() {
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = null;
}

function renderQuestion() {
  const q = state.questions[state.index];
  els.progress.textContent = t("q_progress", state.index + 1, state.questions.length);
  els.progressFill.style.width = `${(state.index / state.questions.length) * 100}%`;
  els.theme.textContent = q.theme;
  els.qText.textContent = q.q;
  els.feedback.classList.add("hidden");
  els.next.classList.add("hidden");
  els.options.innerHTML = "";

  q.opts.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "opt";
    btn.innerHTML = `<span class="letter">${LETTERS[i]}</span>${opt}`;
    btn.addEventListener("click", () => answer(i, btn));
    els.options.appendChild(btn);
  });
}

function recordStat(qid, correct) {
  const s = qstats[qid] || { right: 0, wrong: 0 };
  correct ? s.right++ : s.wrong++;
  qstats[qid] = s;
  store.set("qstats", qstats);
}

function answer(choice, btn) {
  if (!state || state.answers.length > state.index) return; // already answered
  const q = state.questions[state.index];
  const correct = choice === q.correct;
  state.answers.push({ q, choice, correct });
  recordStat(q.id, correct);

  for (const b of els.options.children) b.disabled = true;

  if (state.mode === "practice") {
    btn.classList.add(correct ? "correct" : "wrong");
    if (!correct) els.options.children[q.correct].classList.add("correct");

    const expl = explanationFor(q);
    els.feedback.className = `feedback ${correct ? "good" : "bad"}`;
    els.feedback.innerHTML =
      (correct ? t("correct_fb") : t("wrong_fb", LETTERS[q.correct], q.opts[q.correct])) +
      (expl ? `<span class="expl">${expl}</span>` : "");
    els.feedback.classList.remove("hidden");
    els.next.classList.remove("hidden");
    els.next.focus();
  } else {
    advance();
  }
}

function advance() {
  if (!state) return;
  if (state.index + 1 >= state.questions.length) {
    finishSession(false);
  } else {
    state.index++;
    renderQuestion();
  }
}

function finishSession(timedOut) {
  stopTimer();
  const total = state.questions.length;
  const score = state.answers.filter((a) => a.correct).length;
  const isExam = state.mode === "exam";
  const passMark = isExam ? state.config.passMark : Math.ceil(total * 0.8);
  const passed = score >= passMark;

  if (isExam) {
    examHistory.push({ ts: new Date().toISOString(), score, total, passed });
    examHistory = examHistory.slice(-20);
    store.set("examHistory", examHistory);
  }

  els.resultBadge.textContent = passed ? "🎉" : "📚";
  els.resultTitle.textContent = passed ? t("passed") : t("failed");
  els.resultDetail.textContent =
    t("result_detail", score, total, passMark) + (timedOut ? t("timed_out") : "");

  els.resultUpsell.classList.toggle("hidden", paid);

  const wrong = state.answers.filter((a) => !a.correct);
  els.resultReview.innerHTML = wrong.length
    ? `<h2 style='margin:0 0 .8rem'>${t("review_title")}</h2>` +
      wrong.map((a) => {
        const expl = explanationFor(a.q);
        return `<div class="review-item">
          <div class="rq">${a.q.q}</div>
          <div class="ra err">✗ ${a.q.opts[a.choice]}</div>
          <div class="ra ok">✓ ${a.q.opts[a.q.correct]}</div>
          ${expl ? `<div class="expl">${expl}</div>` : ""}
        </div>`;
      }).join("")
    : `<p style='text-align:center;color:var(--muted)'>${t("all_correct")}</p>`;

  state = null;
  show("result");
}

/* ------------------------------------------------------ access / buy */

async function api(path, options) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function checkAccess() {
  // Token can arrive via ?token=... (magic link / after checkout)
  const url = new URL(location.href);
  const urlToken = url.searchParams.get("token");
  if (urlToken) {
    accessToken = urlToken;
    store.set("token", accessToken);
    url.searchParams.delete("token");
    history.replaceState(null, "", url.pathname + url.search);
  }
  if (!accessToken) return;
  try {
    const me = await api(`/api/access?token=${encodeURIComponent(accessToken)}`);
    if (me.paid) {
      const wasPaid = paid;
      paid = true;
      renderStart();
      if (!wasPaid && urlToken) toast(t("unlocked"));
    }
  } catch { /* backend absent or token invalid — stay in free mode */ }
}

function openBuyDialog() {
  els.buyError.classList.add("hidden");
  els.buyDialog.showModal();
  els.buyEmail.focus();
}

async function submitBuy(e) {
  e.preventDefault();
  const email = els.buyEmail.value.trim();
  if (!email) return;
  els.buySubmit.disabled = true;
  els.buySubmit.textContent = t("buying");
  els.buyError.classList.add("hidden");
  try {
    const out = await api("/api/checkout", { method: "POST", body: JSON.stringify({ email }) });
    if (out.url) {
      location.href = out.url; // Stripe Checkout
      return;
    }
    if (out.token) {
      // Dev mode: access granted immediately.
      accessToken = out.token;
      store.set("token", accessToken);
      paid = true;
      els.buyDialog.close();
      renderStart();
      toast(t("unlocked"));
      return;
    }
    throw new Error("unexpected response");
  } catch (err) {
    els.buyError.textContent = err.message === "Failed to fetch" ? t("offline_buy") : t("buy_failed");
    els.buyError.classList.remove("hidden");
  } finally {
    els.buySubmit.disabled = false;
    els.buySubmit.textContent = t("buy_pay");
  }
}

/* ------------------------------------------------------------- wiring */

els.uiLang.value = uiLang;
els.explLang.value = explLang;

els.uiLang.addEventListener("change", () => {
  uiLang = els.uiLang.value;
  store.set("uiLang", uiLang);
  applyI18n();
});
els.explLang.addEventListener("change", () => {
  explLang = els.explLang.value;
  store.set("explLang", explLang);
});

$("btn-practice").addEventListener("click", startPractice);
$("btn-exam").addEventListener("click", startExam);
$("btn-mistakes").addEventListener("click", startMistakes);
els.next.addEventListener("click", advance);
els.quit.addEventListener("click", () => { stopTimer(); state = null; renderStart(); show("start"); });
$("btn-restart").addEventListener("click", () => { renderStart(); show("start"); });
$("btn-buy").addEventListener("click", openBuyDialog);
$("btn-buy-2").addEventListener("click", openBuyDialog);
$("buy-cancel").addEventListener("click", () => els.buyDialog.close());
els.buyForm.addEventListener("submit", submitBuy);

document.addEventListener("keydown", (e) => {
  if (els.screens.quiz.classList.contains("hidden")) return;
  if (els.buyDialog.open) return;
  const key = e.key.toLowerCase();
  const idx = ["a", "1"].includes(key) ? 0 : ["b", "2"].includes(key) ? 1 : ["c", "3"].includes(key) ? 2 : -1;
  if (idx >= 0) {
    const btn = els.options.children[idx];
    if (btn && !btn.disabled) btn.click();
  } else if (key === "enter" && !els.next.classList.contains("hidden")) {
    e.preventDefault();
    advance();
  }
});

applyI18n();
show("start");
checkAccess();
