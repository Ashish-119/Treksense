/* ============================================================
   TrekSense — sw.js   (Peak Finder — Stage 2 service worker)

   - App shell: cache-first, precached on install.
   - /api/peaks: network-first, falls back to the last cached
     response when offline (peaksForBox() in js/peakstore.js is
     the real offline path — this is a belt-and-braces second one).
   - Everything else same-origin: cache-first, falling through to
     network and caching what it finds, so the rest of the site
     degrades gracefully too.

   APP_SHELL is intentionally short right now — it covers the
   Stage 2 test harness. Stage 3 adds peak-finder.html and its
   scripts here once they exist. Bump SW_VERSION on any change so
   clients pick up the new cache instead of a stale one.
   ============================================================ */

const SW_VERSION = "pf-stage2-v2"; // bump this on ANY change to an APP_SHELL file — sw.js itself must change or the browser won't notice
const SHELL_CACHE = "ts-shell-" + SW_VERSION;
const API_CACHE = "ts-api-" + SW_VERSION;
const RUNTIME_CACHE = "ts-runtime-" + SW_VERSION;

const APP_SHELL = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/shared.js",
  "/js/effects.js",
  "/js/tiles.js",
  "/js/peakstore.js",
  "/docs/spike/stage-2-store-test.html",
  "/docs/spike/stage-2-store-test.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // add one at a time so a single missing/renamed file doesn't fail the whole install
      Promise.all(APP_SHELL.map((url) => cache.add(url).catch((e) => console.warn("[sw] shell precache skipped", url, e))))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([SHELL_CACHE, API_CACHE, RUNTIME_CACHE]);
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // don't intermediate cross-origin (fonts, maps, Overpass — n/a here anyway)

  if (url.pathname === "/api/peaks") {
    event.respondWith(networkFirst(req, API_CACHE));
    return;
  }

  event.respondWith(cacheFirst(req, APP_SHELL.includes(url.pathname) ? SHELL_CACHE : RUNTIME_CACHE));
});

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(req);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "offline and no cached response for this bbox" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch (e) {
    return cached || Response.error();
  }
}
