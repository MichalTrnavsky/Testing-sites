# Deploying CitizenPrep

CitizenPrep is a single Node service with an embedded SQLite database. It
needs **one small instance with a persistent disk** — no separate database
server, no Redis, nothing else self-hosted.

## What you need

| Thing | Why | Notes |
|---|---|---|
| One small VM/instance | Runs the Node app + SQLite | Fly.io machine or a Hetzner CX22 (~€4/mo) is plenty |
| Persistent volume | SQLite file (`/data/data.sqlite`) | Single instance — don't scale past one machine |
| Domain + DNS | `citizenprep.se` | Point records at the host |
| TLS/HTTPS | — | Fly does it automatically; on a VPS, Caddy does it |
| **Stripe** account | Payments | External SaaS — set `STRIPE_SECRET_KEY` + webhook secret |
| **Email provider** | Magic links + receipts | Postmark / Resend / SES — set `EMAIL_PROVIDER` + `EMAIL_API_KEY` |

You do **not** need another server for the database, and you do **not** need
any extra self-hosted app. SQLite on one instance comfortably serves
thousands of users for this read-heavy workload; migrate to Postgres only if
you later need multiple instances.

## Option A — Fly.io (least ops)

```bash
cd citizen-test-trainer
fly launch --no-deploy                      # uses fly.toml + server/Dockerfile
fly volumes create cp_data --region arn --size 1
fly secrets set STRIPE_SECRET_KEY=sk_live_... STRIPE_WEBHOOK_SECRET=whsec_... \
                EMAIL_PROVIDER=postmark EMAIL_API_KEY=... \
                EMAIL_FROM="CitizenPrep <no-reply@citizenprep.se>" \
                METRICS_TOKEN=... NURTURE_ENABLED=1
fly deploy
```
Then point `citizenprep.se` at the app (`fly certs add citizenprep.se`).

## Option B — Hetzner (or any VPS), lowest cost

1. Create one small server (e.g. Hetzner CX22, Ubuntu) and install Docker.
2. Point `citizenprep.se` DNS at the server's IP.
3. Copy the repo, create `.env` (see `server/.env.example`) with your Stripe
   and email secrets, then:
   ```bash
   cd citizen-test-trainer
   docker compose up -d --build
   ```
   Caddy fetches a Let's Encrypt certificate automatically.

One CX22 runs the whole thing (app + SQLite). No separate box needed — you
can even co-host it on an existing Hetzner server that has spare capacity.

## Cost & traffic (no bill surprises)

This app is tiny (small HTML/CSS/JS + question bank; PWA caches repeat
visits), so costs stay low and predictable:

- **Compute is flat.** We run a single machine (SQLite doesn't scale
  horizontally), so there is no autoscaling bill-spike. Fly: ~€5/mo for one
  always-on `shared-cpu-1x`. Hetzner CX22: ~€4/mo fixed.
- **Egress is small.** ~a few hundred KB per session; even 100k
  visits/month ≈ ~50 GB ≈ ~€1–2 on Fly, and **included free** on Hetzner
  (20 TB/mo).
- **If cost predictability is the priority, pick Hetzner** — fixed monthly
  price, generous included traffic, no per-GB metering.
- **Put Cloudflare (free) in front of either host.** It caches static
  assets, absorbs traffic surges before they reach the origin, and adds
  DDoS protection — this is what removes the "what if it goes viral" risk.
- On Fly, also set a **spending limit / budget alert** in the dashboard.

At real niche scale (tens of thousands of Swedish exam-takers per year), one
small instance handles the load comfortably.

## After deploy

- Add the Stripe webhook endpoint: `https://citizenprep.se/api/stripe-webhook`
  (event `checkout.session.completed`), and put its signing secret in
  `STRIPE_WEBHOOK_SECRET`.
- Schedule the nurture job daily (or set `NURTURE_ENABLED=1` to run it
  in-process).
- Back up `/data/data.sqlite` (Fly volume snapshot, or a cron `sqlite3 .backup`).
- Check `GET /api/health` and `GET /api/metrics?token=...`.
