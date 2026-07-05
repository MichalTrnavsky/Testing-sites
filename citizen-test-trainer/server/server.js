/* API + static hosting for the citizenship exam trainer.
 *
 * Storage is SQLite (server/db.js). Emails go through server/mailer.js.
 *
 * Modes:
 *  - Without STRIPE_SECRET_KEY (dev): POST /api/checkout grants access
 *    immediately and returns the token — the whole funnel is testable with
 *    no Stripe account.
 *  - With STRIPE_SECRET_KEY: /api/checkout creates a Stripe Checkout
 *    session; the (idempotent) webhook and the success-page claim mark the
 *    user paid and email them a magic link.
 *
 * Env: PORT, PUBLIC_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
 *      STRIPE_PRICE_ID | PRICE_AMOUNT + PRICE_CURRENCY, EMAIL_PROVIDER…
 */

const path = require("path");
const express = require("express");
const db = require("./db");
const { sendMail, magicLinkEmail, receiptEmail } = require("./mailer");

const PORT = process.env.PORT || 8080;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
const PRICE_AMOUNT = parseInt(process.env.PRICE_AMOUNT || "499", 10);
const PRICE_CURRENCY = (process.env.PRICE_CURRENCY || "sek").toLowerCase();
const APP_DIR = path.join(__dirname, "..", "app");

const stripe = process.env.STRIPE_SECRET_KEY
  ? require("stripe")(process.env.STRIPE_SECRET_KEY)
  : null;

const isEmail = (s) => typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;
const langFor = (market) => (market === "SE" ? "sv" : market === "DK" ? "da" : "en");

/* ---- tiny in-memory rate limiter (per IP + bucket) ---------------------- */

const buckets = new Map();
function rateLimit(key, max, windowMs) {
  const nowMs = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => nowMs - t < windowMs);
  hits.push(nowMs);
  buckets.set(key, hits);
  return hits.length <= max;
}
const clientIp = (req) =>
  (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress || "?";

/* ---- app ---------------------------------------------------------------- */

const app = express();
app.set("trust proxy", true);

// Stripe webhook needs the raw body for signature verification — before JSON.
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

  // Idempotency: Stripe can deliver the same event more than once.
  if (!db.claimStripeEvent(event.id)) return res.json({ received: true, duplicate: true });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_email || session.customer_details?.email;
    const market = session.metadata?.market;
    if (email) {
      const user = db.markPaid(email, session.id, market);
      db.recordEvent({ name: "purchase", market, meta: { via: "webhook" } });
      const link = `${PUBLIC_URL}/${market === "SE" ? "trainer.sv.html" : "trainer.html"}?token=${encodeURIComponent(user.token)}`;
      sendMail(magicLinkEmail({ to: email, link, lang: langFor(market) })).catch((e) => console.error("mail:", e.message));
    }
  }
  res.json({ received: true });
});

app.use(express.json({ limit: "16kb" }));

/** Start a purchase. Dev mode grants access instantly. */
app.post("/api/checkout", async (req, res) => {
  if (!rateLimit(`checkout:${clientIp(req)}`, 10, 60_000))
    return res.status(429).json({ error: "too many requests" });

  const { email, market } = req.body || {};
  if (!isEmail(email)) return res.status(400).json({ error: "invalid email" });

  db.recordEvent({ name: "checkout_start", market, meta: {} });

  if (!stripe) {
    const user = db.markPaid(email, null, market);
    db.recordEvent({ name: "purchase", market, meta: { via: "dev" } });
    sendMail(magicLinkEmail({
      to: email,
      link: `${PUBLIC_URL}/${market === "SE" ? "trainer.sv.html" : "trainer.html"}?token=${encodeURIComponent(user.token)}`,
      lang: langFor(market),
    })).catch(() => {});
    console.log(`[paid] ${email} (dev mode — no Stripe key)`);
    return res.json({ devMode: true, token: user.token });
  }

  try {
    const user = db.upsertUser(email, market);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        process.env.STRIPE_PRICE_ID
          ? { price: process.env.STRIPE_PRICE_ID, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: PRICE_CURRENCY,
                unit_amount: PRICE_AMOUNT * 100,
                product_data: { name: "CitizenPrep — full access" },
              },
            },
      ],
      success_url: `${PUBLIC_URL}/api/claim?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${PUBLIC_URL}/`,
      metadata: { token: user.token, market: market || "" },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("checkout failed:", err.message);
    res.status(502).json({ error: "checkout failed" });
  }
});

/** Success-page fallback: verify the session with Stripe, then hand the
 *  token to the app via redirect (covers webhook delays/misconfig). */
app.get("/api/claim", async (req, res) => {
  if (!stripe) return res.redirect("/");
  try {
    const session = await stripe.checkout.sessions.retrieve(String(req.query.session_id));
    if (session.payment_status === "paid") {
      const email = session.customer_email || session.customer_details?.email;
      const market = session.metadata?.market;
      const user = db.markPaid(email, session.id, market);
      const page = market === "SE" ? "trainer.sv.html" : "trainer.html";
      return res.redirect(`/${page}?token=${encodeURIComponent(user.token)}`);
    }
  } catch (err) {
    console.error("claim failed:", err.message);
  }
  res.redirect("/");
});

/** Entitlement check used by the app on load. */
app.get("/api/access", (req, res) => {
  const user = db.getByToken(String(req.query.token || ""));
  if (!user) return res.status(404).json({ paid: false });
  res.json({ email: user.email, paid: !!user.paid });
});

/** Magic-link re-login for returning buyers. Always 200 (no account probing). */
app.post("/api/login", (req, res) => {
  if (!rateLimit(`login:${clientIp(req)}`, 5, 60_000))
    return res.status(429).json({ error: "too many requests" });

  const { email, market } = req.body || {};
  if (!isEmail(email)) return res.status(400).json({ error: "invalid email" });

  const user = db.getByEmail(email);
  if (user?.paid) {
    const page = user.market === "SE" || market === "SE" ? "trainer.sv.html" : "trainer.html";
    const link = `${PUBLIC_URL}/${page}?token=${encodeURIComponent(user.token)}`;
    const out = sendMail(magicLinkEmail({ to: email, link, lang: langFor(user.market || market) }));
    // Dev mode returns the link so the flow is testable end-to-end.
    return out.then((r) => res.json({ ok: true, devLink: r.dev ? link : undefined }));
  }
  res.json({ ok: true });
});

/** Funnel analytics: the app posts anonymous events (page views, free
 *  start, paywall hit, purchase intent) so we can measure conversion — the
 *  metric the whole paid-acquisition model depends on. */
app.post("/api/event", (req, res) => {
  if (!rateLimit(`event:${clientIp(req)}`, 120, 60_000)) return res.status(429).end();
  const { name, market, anonId, meta } = req.body || {};
  if (typeof name !== "string" || !name) return res.status(400).json({ error: "name required" });
  db.recordEvent({ name, market, anonId, meta });
  res.json({ ok: true });
});

app.get("/api/health", (_req, res) => res.json({ ok: true, stripe: !!stripe }));

/* ---- technical SEO (driven by PUBLIC_URL, so no hard-coded domain) ------ */

// Public, indexable pages. API and success/claim URLs stay out of the map.
const PUBLIC_PAGES = ["/", "/trainer.html", "/trainer.sv.html"];

app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(
    `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${PUBLIC_URL}/sitemap.xml\n`
  );
});

app.get("/sitemap.xml", (_req, res) => {
  const urls = PUBLIC_PAGES.map(
    (p) => `  <url><loc>${PUBLIC_URL}${p}</loc><changefreq>weekly</changefreq></url>`
  ).join("\n");
  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
});

// Basic funnel counts (guard with a token in production).
app.get("/api/metrics", (req, res) => {
  if (process.env.METRICS_TOKEN && req.query.token !== process.env.METRICS_TOKEN)
    return res.status(403).json({ error: "forbidden" });
  res.json(db.funnelSummary());
});

app.use(express.static(APP_DIR));

// Fail loud on an obviously misconfigured production deploy, so we never
// silently run live with dev-mode payments or drop magic-link emails.
function checkConfig() {
  const isProd = process.env.NODE_ENV === "production" || !PUBLIC_URL.includes("localhost");
  if (!isProd) return;
  const warn = [];
  if (!stripe) warn.push("STRIPE_SECRET_KEY missing — payments run in DEV mode (access granted free!)");
  if (stripe && !process.env.STRIPE_WEBHOOK_SECRET) warn.push("STRIPE_WEBHOOK_SECRET missing — webhook signatures not verified");
  if (!process.env.EMAIL_PROVIDER) warn.push("EMAIL_PROVIDER missing — magic-link emails only log to console");
  if (!process.env.METRICS_TOKEN) warn.push("METRICS_TOKEN missing — /api/metrics is public");
  if (warn.length) console.warn("⚠ CONFIG:\n" + warn.map((w) => "  - " + w).join("\n"));
}

if (require.main === module) {
  checkConfig();
  app.listen(PORT, () => {
    console.log(`CitizenPrep running on ${PUBLIC_URL} (stripe: ${stripe ? "live" : "dev mode"})`);
  });
}

module.exports = app;
