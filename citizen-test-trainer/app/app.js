/* Indfødsretsprøven Trainer — exam simulator + practice mode.
 *
 * Real exam rules (SIRI): 45 minutes, 45 questions, pass >= 36 for
 * indfødsretsprøven; medborgerskabsprøven is 25 questions / 30 min / pass >= 20.
 * The prototype uses the medborgerskabsprøven format because the sample bank
 * is small; both are driven by EXAM_CONFIG below.
 */

const EXAM_CONFIG = {
  questionCount: 25,
  minutes: 30,
  passMark: 20,
};

const LETTERS = ["A", "B", "C"];

const els = {
  screens: {
    start: document.getElementById("screen-start"),
    quiz: document.getElementById("screen-quiz"),
    result: document.getElementById("screen-result"),
  },
  explLang: document.getElementById("explLang"),
  bankInfo: document.getElementById("bank-info"),
  progress: document.getElementById("quiz-progress"),
  timer: document.getElementById("quiz-timer"),
  theme: document.getElementById("q-theme"),
  qText: document.getElementById("q-text"),
  options: document.getElementById("q-options"),
  feedback: document.getElementById("q-feedback"),
  next: document.getElementById("btn-next"),
  quit: document.getElementById("btn-quit"),
  resultBadge: document.getElementById("result-badge"),
  resultTitle: document.getElementById("result-title"),
  resultDetail: document.getElementById("result-detail"),
  resultReview: document.getElementById("result-review"),
};

let state = null;
let timerHandle = null;

function show(name) {
  for (const [key, el] of Object.entries(els.screens)) {
    el.classList.toggle("hidden", key !== name);
  }
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function explanationFor(q) {
  const lang = els.explLang.value;
  if (lang === "none") return "";
  return (q.expl && q.expl[lang]) || q.expl?.en || "";
}

function startSession(mode) {
  const bank = shuffled(window.QUESTION_BANK);
  const questions =
    mode === "exam" ? bank.slice(0, EXAM_CONFIG.questionCount) : bank;
  state = { mode, questions, index: 0, answers: [] };

  els.timer.classList.toggle("hidden", mode !== "exam");
  if (mode === "exam") startTimer(EXAM_CONFIG.minutes * 60);

  show("quiz");
  renderQuestion();
}

function startTimer(seconds) {
  stopTimer();
  let remaining = seconds;
  const tick = () => {
    const m = String(Math.floor(remaining / 60)).padStart(2, "0");
    const s = String(remaining % 60).padStart(2, "0");
    els.timer.textContent = `${m}:${s}`;
    els.timer.classList.toggle("low", remaining <= 120);
    if (remaining <= 0) {
      stopTimer();
      finishSession(true);
      return;
    }
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
  els.progress.textContent = `Spørgsmål ${state.index + 1} af ${state.questions.length}`;
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

function answer(choice, btn) {
  const q = state.questions[state.index];
  const correct = choice === q.correct;
  state.answers.push({ q, choice, correct });

  for (const b of els.options.children) b.disabled = true;

  if (state.mode === "practice") {
    // Instant feedback with explanation in the chosen language.
    btn.classList.add(correct ? "correct" : "wrong");
    if (!correct) els.options.children[q.correct].classList.add("correct");

    const expl = explanationFor(q);
    els.feedback.className = `feedback ${correct ? "good" : "bad"}`;
    els.feedback.innerHTML =
      (correct ? "✅ Rigtigt!" : `❌ Forkert. Det rigtige svar er <strong>${LETTERS[q.correct]}: ${q.opts[q.correct]}</strong>.`) +
      (expl ? `<span class="expl">${expl}</span>` : "");
    els.feedback.classList.remove("hidden");
    els.next.classList.remove("hidden");
  } else {
    // Exam mode: no feedback, straight to the next question.
    advance();
  }
}

function advance() {
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
  const passed = score >= (isExam ? EXAM_CONFIG.passMark : Math.ceil(total * 0.8));

  els.resultBadge.textContent = passed ? "🎉" : "📚";
  els.resultTitle.textContent = passed ? "Bestået!" : "Ikke bestået — endnu";
  els.resultDetail.textContent =
    `${score} af ${total} rigtige` +
    (isExam ? ` (beståelseskrav: ${EXAM_CONFIG.passMark})` : "") +
    (timedOut ? " · Tiden udløb" : "");

  const wrong = state.answers.filter((a) => !a.correct);
  els.resultReview.innerHTML = wrong.length
    ? "<h2 style='margin:0 0 .8rem'>Gennemgå dine fejl</h2>" +
      wrong
        .map((a) => {
          const expl = explanationFor(a.q);
          return `<div class="review-item">
            <div class="rq">${a.q.q}</div>
            <div class="ra err">Dit svar: ${a.q.opts[a.choice]}</div>
            <div class="ra ok">Rigtigt svar: ${a.q.opts[a.q.correct]}</div>
            ${expl ? `<div class="expl">${expl}</div>` : ""}
          </div>`;
        })
        .join("")
    : "<p style='text-align:center;color:#6b7280'>Alle svar var rigtige — flot!</p>";

  show("result");
}

document.getElementById("btn-practice").addEventListener("click", () => startSession("practice"));
document.getElementById("btn-exam").addEventListener("click", () => startSession("exam"));
els.next.addEventListener("click", advance);
els.quit.addEventListener("click", () => {
  stopTimer();
  show("start");
});
document.getElementById("btn-restart").addEventListener("click", () => show("start"));

els.bankInfo.textContent =
  `Spørgsmålsbank: ${window.QUESTION_BANK.length} spørgsmål · ` +
  `prototype-udgave (udvides med officielle prøvesæt 2010–2025).`;
