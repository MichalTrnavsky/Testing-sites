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

function nurtureEmail({ to, daysLeft, link, lang }) {
  const t = {
    da: {
      subject: `Din prøve er om ${daysLeft} dage`,
      body: `Hej!\n\nDer er ${daysLeft} dage til din prøve. Er du klar?\n\nTag en fuld prøvesimulator nu og se, hvor du står:\n${link}\n\nDu kan det her. Held og lykke!`,
    },
    sv: {
      subject: `Ditt prov är om ${daysLeft} dagar`,
      body: `Hej!\n\nDet är ${daysLeft} dagar kvar till ditt prov. Är du redo?\n\nKör en full provsimulator nu och se var du står:\n${link}\n\nDu klarar det här. Lycka till!`,
    },
    en: {
      subject: `Your exam is in ${daysLeft} days`,
      body: `Hi!\n\nYour exam is in ${daysLeft} days. Are you ready?\n\nTake a full exam simulation now and see where you stand:\n${link}\n\nYou've got this. Good luck!`,
    },
  };
  const m = t[lang] || t.en;
  return { to, subject: m.subject, text: m.body };
}

module.exports = { sendMail, magicLinkEmail, receiptEmail, nurtureEmail };
