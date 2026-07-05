/* Server API tests — no framework, just assertions against a live instance
 * on an isolated temp SQLite file. Run: node server/test_server.js
 */

const assert = require("node:assert");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");

const PORT = 8100 + Math.floor(Math.random() * 800);
process.env.PORT = String(PORT);
process.env.DB_PATH = path.join(os.tmpdir(), `citizenprep-test-${PORT}.sqlite`);
delete process.env.STRIPE_SECRET_KEY; // force dev mode
const BASE = `http://localhost:${PORT}`;

const app = require("./server");
const db = require("./db");

let server;
const post = (p, body) =>
  fetch(BASE + p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const get = (p) => fetch(BASE + p);

async function run() {
  server = app.listen(PORT);
  await new Promise((r) => server.once("listening", r));
  let passed = 0;
  const ok = (name) => { console.log(`  ✓ ${name}`); passed++; };

  // health
  let r = await get("/api/health");
  assert.equal(r.status, 200);
  assert.equal((await r.json()).stripe, false);
  ok("health reports dev mode");

  // invalid email rejected
  r = await post("/api/checkout", { email: "nope" });
  assert.equal(r.status, 400);
  ok("checkout rejects invalid email");

  // dev checkout grants access + returns token
  r = await post("/api/checkout", { email: "Anna@Example.SE", market: "SE" });
  assert.equal(r.status, 200);
  const { devMode, token } = await r.json();
  assert.equal(devMode, true);
  assert.ok(token && token.length > 10);
  ok("dev checkout grants access and returns token");

  // access check with token
  r = await get(`/api/access?token=${encodeURIComponent(token)}`);
  assert.equal(r.status, 200);
  const acc = await r.json();
  assert.equal(acc.paid, true);
  assert.equal(acc.email, "anna@example.se"); // normalised lowercase
  ok("access check confirms paid + normalises email");

  // bad token -> 404 not paid
  r = await get("/api/access?token=deadbeef");
  assert.equal(r.status, 404);
  ok("unknown token returns 404");

  // login for existing paid user returns dev link
  r = await post("/api/login", { email: "anna@example.se" });
  const login = await r.json();
  assert.equal(login.ok, true);
  assert.ok(login.devLink && login.devLink.includes(token));
  ok("login returns magic dev-link for paid user");

  // login for unknown user still 200, no link (no account probing)
  r = await post("/api/login", { email: "ghost@example.se" });
  const login2 = await r.json();
  assert.equal(login2.ok, true);
  assert.equal(login2.devLink, undefined);
  ok("login does not leak whether an account exists");

  // idempotent markPaid: paid_at must not change on re-pay
  const u1 = db.markPaid("idem@example.se", "sess_1", "SE");
  await new Promise((r) => setTimeout(r, 5));
  const u2 = db.markPaid("idem@example.se", "sess_2", "SE");
  assert.equal(u1.paid_at, u2.paid_at);
  assert.equal(u1.token, u2.token);
  ok("markPaid is idempotent (stable paid_at + token)");

  // stripe event idempotency helper
  assert.equal(db.claimStripeEvent("evt_1"), true);
  assert.equal(db.claimStripeEvent("evt_1"), false);
  ok("claimStripeEvent dedupes repeated webhook ids");

  // event tracking + metrics
  await post("/api/event", { name: "page_view", market: "SE", anonId: "a1" });
  await post("/api/event", { name: "page_view", market: "SE", anonId: "a2" });
  r = await post("/api/event", {});
  assert.equal(r.status, 400);
  const metrics = await (await get("/api/metrics")).json();
  assert.ok(metrics.page_view >= 2);
  assert.ok(metrics.checkout_start >= 1); // from the earlier dev checkout
  ok("events are recorded and summarised in /api/metrics");

  // static hosting works
  r = await get("/trainer.sv.html");
  assert.equal(r.status, 200);
  assert.ok((await r.text()).includes("CitizenPrep"));
  ok("serves the Swedish trainer page");

  console.log(`\n✅ ${passed} server tests passed`);
}

run()
  .catch((e) => { console.error("\n❌ test failed:\n", e); process.exitCode = 1; })
  .finally(() => {
    if (server) server.close();
    try { fs.rmSync(process.env.DB_PATH, { force: true }); fs.rmSync(process.env.DB_PATH + "-wal", { force: true }); fs.rmSync(process.env.DB_PATH + "-shm", { force: true }); } catch {}
  });
