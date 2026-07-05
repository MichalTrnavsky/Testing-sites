/* Exam-countdown nurture — sends "your exam is in X days" reminders.
 *
 * Retention + conversion: a booked exam date is the strongest signal a user
 * will come back and (if still on the free tier) convert. Run daily via cron:
 *   node server/nurture.js
 * or enable the in-process daily timer with NURTURE_ENABLED=1 in server.js.
 *
 * Milestones are days-before-exam. On each run a user gets at most one email:
 * the tightest not-yet-sent milestone they've entered. This catches up if a
 * day is skipped and never spams (idempotent via the sent_nurture table).
 */

const db = require("./db");
const { sendMail, nurtureEmail } = require("./mailer");

const MILESTONES = [14, 7, 3, 1]; // descending handled below
const PUBLIC_URL = process.env.PUBLIC_URL || "http://localhost:8080";
const langFor = (market) => (market === "SE" ? "sv" : market === "DK" ? "da" : "en");

// Whole days between two YYYY-MM-DD dates (exam - ref), rounded to midnight.
function daysBetween(refDate, examDate) {
  const a = Date.UTC(refDate.getUTCFullYear(), refDate.getUTCMonth(), refDate.getUTCDate());
  const [y, m, d] = examDate.split("-").map(Number);
  const b = Date.UTC(y, m - 1, d);
  return Math.round((b - a) / 86_400_000);
}

/** Pure milestone selection — the tightest milestone the user has entered. */
function pickMilestone(daysLeft) {
  if (daysLeft < 1) return null;
  const applicable = MILESTONES.filter((m) => daysLeft <= m);
  return applicable.length ? Math.min(...applicable) : null;
}

/** Run one nurture pass. `refDate` defaults to now; injectable for tests.
 *  `send` is injectable so tests can capture without hitting the mailer. */
async function runNurture(refDate = new Date(), send = defaultSend) {
  const users = db.paidUsersWithExam();
  const sent = [];
  for (const u of users) {
    const daysLeft = daysBetween(refDate, u.exam_date);
    const milestone = pickMilestone(daysLeft);
    if (milestone == null) continue;
    if (db.nurtureAlreadySent(u.email, milestone)) continue;

    const page = u.market === "SE" ? "trainer.sv.html" : "trainer.html";
    const link = `${PUBLIC_URL}/${page}?token=${encodeURIComponent(u.token)}`;
    await send(nurtureEmail({ to: u.email, daysLeft, link, lang: langFor(u.market) }));
    db.markNurtureSent(u.email, milestone);
    db.recordEvent({ name: "nurture_sent", market: u.market, meta: { milestone, daysLeft } });
    sent.push({ email: u.email, milestone, daysLeft });
  }
  return sent;
}

function defaultSend(msg) {
  return sendMail(msg).catch((e) => console.error("nurture mail:", e.message));
}

module.exports = { runNurture, pickMilestone, daysBetween, MILESTONES };

if (require.main === module) {
  runNurture()
    .then((sent) => {
      console.log(`nurture: sent ${sent.length} reminder(s)`);
      sent.forEach((s) => console.log(`  ${s.email} → ${s.milestone}d (${s.daysLeft} left)`));
    })
    .catch((e) => { console.error(e); process.exitCode = 1; });
}
