/* API + static hosting for the citizenship exam trainer.
 *
 * Modes:
 *  - Without STRIPE_SECRET_KEY (dev mode): POST /api/checkout grants access
 *    immediately and returns the access token — lets you test the whole
 *    funnel locally with no Stripe account.
 *  - With STRIPE_SECRET_KEY: /api/checkout creates a Stripe Checkout
 *    session; the webhook (or the success-page claim fallback) marks the
 *    user paid and the success URL hands the token back to the app.
 *
 * Storage is a JSON file (db.json). Fine for a prototype and low volume;
 * swap for SQLite/Postgres before real traffic.
 *
 * Env vars: PORT, PUBLIC_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
 *           STRIPE_PRICE_ID (or PRICE_DKK, default 149).
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const express = require("express");

const PORT = process.env.PORT || 8080;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
const PRICE_DKK = parseInt(process.env.PRICE_DKK || "149", 10);
const DB_FILE = path.join(__dirname, "db.json");
const APP_DIR = path.join(__dirname, "..", "app");

const stripe = process.env.STRIPE_SECRET_KEY
  ? require("stripe")(process.env.STRIPE_SECRET_KEY)
  : null;

/* ------------------------------------------------------------ storage */

function loadDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    return { users: {} }; // users[email] = {token, paid, createdAt, paidAt, sessionId}
  }
}

function saveDb(db) {
  const tmp = DB_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

function upsertUser(db, email) {
  const key = email.trim().toLowerCase();
  if (!db.users[key]) {
    db.users[key] = {
      token: crypto.randomBytes(24).toString("base64url"),
      paid: false,
      createdAt: new Date().toISOString(),
    };
  }
  return db.users[key];
}

function findByToken(db, token) {
  return Object.entries(db.users).find(([, u]) => u.token === token);
}

function markPaid(db, email, sessionId) {
  const user = upsertUser(db, email);
  user.paid = true;
  user.paidAt = user.paidAt || new Date().toISOString();
  if (sessionId) user.sessionId = sessionId;
  saveDb(db);
  return user;
}

const isEmail = (s) => typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

/* --------------------------------------------------------------- app */

const app = express();

// Stripe webhook needs the raw body for signature verification — register
// it before the JSON parser.
app.post("/api/stripe-webhook", express.raw({ type: "application/json" }), (req, res) => {
  if (!stripe) return res.status(400).send("stripe not configured");
  let event;
  try {
    event = process.env.STRIPE_WEBHOOK_SECRET
      ? stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET)
      : JSON.parse(req.body);
  } catch (err) {
    return res.status(400).send(`webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_email || session.customer_details?.email;
    if (email) {
      const db = loadDb();
      markPaid(db, email, session.id);
      console.log(`[paid] ${email} (webhook)`);
      // TODO(production): email the magic link `${PUBLIC_URL}/?token=...`
      // via a transactional provider (Postmark/Resend).
    }
  }
  res.json({ received: true });
});

app.use(express.json());

/** Start a purchase. Dev mode grants access instantly. */
app.post("/api/checkout", async (req, res) => {
  const { email } = req.body || {};
  if (!isEmail(email)) return res.status(400).json({ error: "invalid email" });

  const db = loadDb();

  if (!stripe) {
    const user = markPaid(db, email, null);
    console.log(`[paid] ${email} (dev mode — no Stripe key)`);
    return res.json({ devMode: true, token: user.token });
  }

  try {
    const user = upsertUser(db, email);
    saveDb(db);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        process.env.STRIPE_PRICE_ID
          ? { price: process.env.STRIPE_PRICE_ID, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: "dkk",
                unit_amount: PRICE_DKK * 100,
                product_data: { name: "CitizenPrep — fuld adgang" },
              },
            },
      ],
      success_url: `${PUBLIC_URL}/api/claim?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${PUBLIC_URL}/`,
      metadata: { token: user.token },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("checkout failed:", err.message);
    res.status(502).json({ error: "checkout failed" });
  }
});

/** Success-page fallback: verify the session with Stripe, then hand the
 *  token to the app via redirect. Covers webhook delays/misconfiguration. */
app.get("/api/claim", async (req, res) => {
  if (!stripe) return res.redirect("/");
  try {
    const session = await stripe.checkout.sessions.retrieve(String(req.query.session_id));
    if (session.payment_status === "paid") {
      const email = session.customer_email || session.customer_details?.email;
      const db = loadDb();
      const user = markPaid(db, email, session.id);
      return res.redirect(`/?token=${encodeURIComponent(user.token)}`);
    }
  } catch (err) {
    console.error("claim failed:", err.message);
  }
  res.redirect("/");
});

/** Entitlement check used by the app on load. */
app.get("/api/access", (req, res) => {
  const db = loadDb();
  const hit = findByToken(db, String(req.query.token || ""));
  if (!hit) return res.status(404).json({ paid: false });
  const [email, user] = hit;
  res.json({ email, paid: !!user.paid });
});

/** Magic-link re-login: look up an existing paid user by email.
 *  In production this sends an email; in dev it returns the link. */
app.post("/api/login", (req, res) => {
  const { email } = req.body || {};
  if (!isEmail(email)) return res.status(400).json({ error: "invalid email" });
  const db = loadDb();
  const user = db.users[email.trim().toLowerCase()];
  // Always answer 200 so the endpoint can't be used to probe accounts.
  if (user?.paid) {
    const link = `${PUBLIC_URL}/?token=${encodeURIComponent(user.token)}`;
    console.log(`[magic-link] ${email}: ${link}`);
    if (!stripe) return res.json({ ok: true, devLink: link });
    // TODO(production): send `link` by email.
  }
  res.json({ ok: true });
});

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, stripe: !!stripe, questions: undefined })
);

app.use(express.static(APP_DIR));

app.listen(PORT, () => {
  console.log(`trainer running on ${PUBLIC_URL} (stripe: ${stripe ? "live" : "dev mode"})`);
});
