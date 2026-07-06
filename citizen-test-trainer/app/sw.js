/* Service worker — makes CitizenPrep installable and usable offline.
 *
 * Our audience is often on cheap phones, limited data and patchy signal, so
 * practising must work without a connection. The app shell + question bank
 * are precached; other same-origin GETs are cached as they're used
 * (stale-while-revalidate). /api/ is always network — offline it simply
 * degrades to the free tier (the app already handles a missing backend).
 */

const VERSION = "cp-v2";
const CORE = [
  "/app.js",
  "/style.css",
  "/landing.css",
  "/trainer.sv.html",
  "/questions.sv.js",
  "/index.sv.html",
  "/manifest.webmanifest",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // always hit the network

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          cached || (req.mode === "navigation" ? caches.match("/trainer.sv.html") : undefined)
        );
      return cached || network;
    })
  );
});
