/* Storage layer — SQLite via Node's built-in node:sqlite (no dependency).
 *
 * Replaces the earlier JSON file: concurrency-safe, transactional, and it
 * holds users, funnel analytics events, and Stripe idempotency records.
 */

const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const crypto = require("crypto");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data.sqlite");
const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS users (
    email      TEXT PRIMARY KEY,
    token      TEXT UNIQUE NOT NULL,
    paid       INTEGER NOT NULL DEFAULT 0,
    market     TEXT,
    created_at TEXT NOT NULL,
    paid_at    TEXT,
    session_id TEXT
  );
  CREATE TABLE IF NOT EXISTS events (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    ts      TEXT NOT NULL,
    name    TEXT NOT NULL,
    market  TEXT,
    anon_id TEXT,
    meta    TEXT
  );
  CREATE TABLE IF NOT EXISTS processed_events (
    id TEXT PRIMARY KEY,
    ts TEXT NOT NULL
  );
`);

const now = () => new Date().toISOString();
const norm = (email) => String(email).trim().toLowerCase();

const stmts = {
  getByEmail: db.prepare("SELECT * FROM users WHERE email = ?"),
  getByToken: db.prepare("SELECT * FROM users WHERE token = ?"),
  insertUser: db.prepare(
    "INSERT INTO users (email, token, paid, market, created_at) VALUES (?, ?, 0, ?, ?)"
  ),
  setPaid: db.prepare(
    "UPDATE users SET paid = 1, paid_at = COALESCE(paid_at, ?), session_id = ? WHERE email = ?"
  ),
  insertEvent: db.prepare(
    "INSERT INTO events (ts, name, market, anon_id, meta) VALUES (?, ?, ?, ?, ?)"
  ),
  countEvents: db.prepare("SELECT name, COUNT(*) AS n FROM events GROUP BY name"),
  getProcessed: db.prepare("SELECT id FROM processed_events WHERE id = ?"),
  markProcessed: db.prepare("INSERT OR IGNORE INTO processed_events (id, ts) VALUES (?, ?)"),
};

function upsertUser(email, market) {
  const key = norm(email);
  let user = stmts.getByEmail.get(key);
  if (!user) {
    const token = crypto.randomBytes(24).toString("base64url");
    stmts.insertUser.run(key, token, market || null, now());
    user = stmts.getByEmail.get(key);
  }
  return user;
}

function getByToken(token) {
  if (!token) return null;
  return stmts.getByToken.get(token) || null;
}

function markPaid(email, sessionId, market) {
  const user = upsertUser(email, market);
  stmts.setPaid.run(now(), sessionId || null, user.email);
  return stmts.getByEmail.get(user.email);
}

function getByEmail(email) {
  return stmts.getByEmail.get(norm(email)) || null;
}

function recordEvent({ name, market, anonId, meta }) {
  stmts.insertEvent.run(
    now(),
    String(name).slice(0, 64),
    market ? String(market).slice(0, 8) : null,
    anonId ? String(anonId).slice(0, 64) : null,
    meta ? JSON.stringify(meta).slice(0, 2000) : null
  );
}

function funnelSummary() {
  const rows = stmts.countEvents.all();
  return Object.fromEntries(rows.map((r) => [r.name, r.n]));
}

// Stripe idempotency: returns true the first time an event id is seen.
function claimStripeEvent(eventId) {
  if (!eventId) return true;
  if (stmts.getProcessed.get(eventId)) return false;
  stmts.markProcessed.run(eventId, now());
  return true;
}

module.exports = {
  db,
  upsertUser,
  getByToken,
  getByEmail,
  markPaid,
  recordEvent,
  funnelSummary,
  claimStripeEvent,
};
