/* Pluggable transactional mailer.
 *
 * Dev (no EMAIL_PROVIDER): logs the message to the console so the whole
 * flow is testable without a provider account.
 * Prod: set EMAIL_PROVIDER + EMAIL_API_KEY and implement the fetch call to
 * your provider (Postmark/Resend/SES). The visual HTML design of these
 * emails is a later design task; the plumbing and plain-text live here.
 */

const FROM = process.env.EMAIL_FROM || "CitizenPrep <no-reply@citizenprep.example>";

async function sendMail({ to, subject, text, html }) {
  if (!process.env.EMAIL_PROVIDER) {
    console.log(`[mail:dev] to=${to} from="${FROM}" subject="${subject}"\n${text}\n`);
    return { dev: true, to, subject };
  }
  // TODO(production): POST to the provider API with EMAIL_API_KEY.
  // Kept explicit so a misconfigured prod deploy fails loudly instead of
  // silently dropping magic links.
  throw new Error(`EMAIL_PROVIDER=${process.env.EMAIL_PROVIDER} set but no integration implemented`);
}

function magicLinkEmail({ to, link, lang }) {
  const t = {
    da: {
      subject: "Din adgang til CitizenPrep",
      body: `Hej!\n\nHer er dit adgangslink til CitizenPrep:\n${link}\n\nLinket giver adgang, indtil du har bestået prøven. Del det ikke med andre.\n\nHeld og lykke med forberedelsen!`,
    },
    sv: {
      subject: "Din åtkomst till CitizenPrep",
      body: `Hej!\n\nHär är din åtkomstlänk till CitizenPrep:\n${link}\n\nLänken ger tillgång tills du klarat provet. Dela den inte med andra.\n\nLycka till med förberedelserna!`,
    },
    en: {
      subject: "Your CitizenPrep access",
      body: `Hi!\n\nHere is your access link to CitizenPrep:\n${link}\n\nIt gives access until you pass the exam. Please don't share it.\n\nGood luck with your preparation!`,
    },
  };
  const m = t[lang] || t.en;
  return { to, subject: m.subject, text: m.body };
}

function receiptEmail({ to, amount, currency, lang }) {
  const line = `${amount} ${currency}`;
  const t = {
    da: { subject: "Kvittering — CitizenPrep", body: `Tak for dit køb.\nBeløb: ${line}\nFuld adgang er aktiveret.` },
    sv: { subject: "Kvitto — CitizenPrep", body: `Tack för ditt köp.\nBelopp: ${line}\nFull tillgång är aktiverad.` },
    en: { subject: "Receipt — CitizenPrep", body: `Thank you for your purchase.\nAmount: ${line}\nFull access is active.` },
  };
  const m = t[lang] || t.en;
  return { to, subject: m.subject, text: m.body };
}

module.exports = { sendMail, magicLinkEmail, receiptEmail };
