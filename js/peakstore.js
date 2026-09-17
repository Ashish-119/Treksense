/* ============================================================
   TrekSense — peakstore.js   (Peak Finder — Stage 2 on-device store)

   Thin IndexedDB wrapper matching the frozen data model in
   docs/peak-finder-ar-blueprint.html:
     - peaks : one row per peak, indexed by tileKey
     - tiles : one row per prepared/stale/fetching 0.5° tile
     - prep  : a singleton recording the last prepared centre

   Depends on js/tiles.js (load it first — <script src="js/tiles.js">
   then <script src="js/peakstore.js">). Works as a browser global
   (`PeakStore`) and via require() for future Node-side tooling/tests.
   ============================================================ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./tiles.js"));
  } else {
    root.PeakStore = factory(root.Tiles);
  }
})(typeof self !== "undefined" ? self : this, function (Tiles) {
  "use strict";

  var DB_NAME = "treksense-peaks";
  var DB_VERSION = 1;
  var DATASET_VERSION = "1";
  var TILE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days — re-fetch a tile older than this
  var DEFAULT_KEEP_RADIUS_KM = 250;                // evict tiles whose centre is farther than this from prep centre
  var DEFAULT_RADIUS_KM = 100;                     // the ~100 km disc the blueprint keeps prepared around the user
  var API_BASE = "";                               // same-origin; Stage 1's /api/peaks lives on this domain
  var TILE_FETCH_TIMEOUT_MS = 20000;               // give up on one tile and move to the next rather than hang the
                                                    // whole prepare — observed some browser/SW-mediated fetches to
                                                    // /api/peaks fail near-instantly even though the server itself
                                                    // always answers when hit directly; bounding this keeps a stuck
                                                    // tile from stalling the other 20+ tiles behind it either way.

  /* ---- Stage 4: automatic rolling window ---- */
  var DRIFT_KM = 15;                    // re-centre once the user is this far from the prepared centre
  var PING_TIMEOUT_MS = 6000;
  var BACKOFF_BASE_MS = 30 * 1000;      // first retry wait after a failed/offline attempt
  var BACKOFF_MAX_MS = 20 * 60 * 1000;  // cap backoff at 20 min so it never gives up for the whole session
  var autoState = { inFlight: false, backoffMs: 0, backoffUntil: 0 };

  var dbPromise = null;
  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains("peaks")) {
          var peaks = db.createObjectStore("peaks", { keyPath: "id" });
          peaks.createIndex("tileKey", "tileKey", { unique: false });
        }
        if (!db.objectStoreNames.contains("tiles")) {
          db.createObjectStore("tiles", { keyPath: "tileKey" });
        }
        if (!db.objectStoreNames.contains("prep")) {
          db.createObjectStore("prep", { keyPath: "key" });
        }
      };
      req.onsuccess = function (e) { resolve(e.target.result); };
      req.onerror = function () { reject(req.error); };
    });
    return dbPromise;
  }

  function reqPromise(req) {
    return new Promise(function (resolve, reject) {
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function txDone(t) {
    return new Promise(function (resolve, reject) {
      t.oncomplete = function () { resolve(); };
      t.onerror = function () { reject(t.error); };
      t.onabort = function () { reject(t.error || new Error("transaction aborted")); };
    });
  }

  async function getTile(tileKey) {
    var db = await openDB();
    return reqPromise(db.transaction("tiles").objectStore("tiles").get(tileKey));
  }

  async function putTile(rec) {
    var db = await openDB();
    var t = db.transaction("tiles", "readwrite");
    t.objectStore("tiles").put(rec);
    return txDone(t);
  }

  async function upsertPeaks(peaks, tileKey) {
    var db = await openDB();
    var t = db.transaction("peaks", "readwrite");
    var store = t.objectStore("peaks");
    var fetchedAt = Date.now();
    (peaks || []).forEach(function (p) {
      store.put({
        id: p.id, name: p.name, lat: p.lat, lon: p.lon,
        elevation: p.elevation != null ? p.elevation : null,
        prominence: p.prominence != null ? p.prominence : null,
        tileKey: tileKey, source: p.source || "osm", fetchedAt: fetchedAt
      });
    });
    return txDone(t);
  }

  async function peaksInTile(tileKey) {
    var db = await openDB();
    var idx = db.transaction("peaks").objectStore("peaks").index("tileKey");
    return reqPromise(idx.getAll(IDBKeyRange.only(tileKey)));
  }

  /** Delete a tile's record and every peak indexed under it, atomically. */
  async function deleteTile(tileKey) {
    var db = await openDB();
    var t = db.transaction(["peaks", "tiles"], "readwrite");
    var cursorReq = t.objectStore("peaks").index("tileKey").openCursor(IDBKeyRange.only(tileKey));
    cursorReq.onsuccess = function (e) {
      var cur = e.target.result;
      if (cur) { cur.delete(); cur.continue(); }
    };
    t.objectStore("tiles").delete(tileKey);
    return txDone(t);
  }

  async function setPrep(rec) {
    var db = await openDB();
    var t = db.transaction("prep", "readwrite");
    t.objectStore("prep").put(Object.assign({ key: "current" }, rec));
    return txDone(t);
  }

  async function getPrep() {
    var db = await openDB();
    return reqPromise(db.transaction("prep").objectStore("prep").get("current"));
  }

  function haversineKm(aLat, aLon, bLat, bLon) {
    var R = 6371, toR = function (d) { return (d * Math.PI) / 180; };
    var dLat = toR(bLat - aLat), dLon = toR(bLon - aLon);
    var h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(aLat)) * Math.cos(toR(bLat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  /** Drop tiles whose centre has fallen more than keepRadiusKm from the new prep centre. */
  async function evictOutside(center, keepRadiusKm) {
    var db = await openDB();
    var allTiles = await reqPromise(db.transaction("tiles").objectStore("tiles").getAll());
    var evicted = [];
    for (var i = 0; i < allTiles.length; i++) {
      var bb = allTiles[i].bbox;
      var cLat = (bb.s + bb.n) / 2, cLon = (bb.w + bb.e) / 2;
      if (haversineKm(center.lat, center.lon, cLat, cLon) > keepRadiusKm) {
        await deleteTile(allTiles[i].tileKey);
        evicted.push(allTiles[i].tileKey);
      }
    }
    return evicted;
  }

  /* ---------------- public API ---------------- */

  /**
   * Fetch + store every tile covering a ~radiusKm disc around `center`,
   * skipping tiles already prepared and fresher than TILE_MAX_AGE_MS.
   * Merges peaks by stable id (never wholesale-replaces a tile's peaks),
   * then evicts tiles that have fallen outside the keep-box.
   *
   * center: { lat, lon }   radiusKm: number (default 100)
   * opts.onStatus(evt) fires with { phase, ... } for a progress UI.
   */
  async function prepareArea(center, radiusKm, opts) {
    opts = opts || {};
    var onStatus = opts.onStatus || function () {};
    var keepRadiusKm = opts.keepRadiusKm || DEFAULT_KEEP_RADIUS_KM;
    radiusKm = radiusKm || DEFAULT_RADIUS_KM;

    var tileKeys = Tiles.tilesCoveringDisc(center.lat, center.lon, radiusKm);
    var now = Date.now();
    var toFetch = [];
    for (var i = 0; i < tileKeys.length; i++) {
      var existing = await getTile(tileKeys[i]);
      if (!existing || existing.status !== "prepared" || now - existing.preparedAt > TILE_MAX_AGE_MS) {
        toFetch.push(tileKeys[i]);
      }
    }
    onStatus({ phase: "start", totalTiles: tileKeys.length, toFetch: toFetch.length });

    var fetched = 0, failed = 0, totalPeaks = 0;
    for (var j = 0; j < toFetch.length; j++) {
      var key = toFetch[j];
      var bbox = Tiles.tileKeyToBbox(key);
      await putTile({ tileKey: key, bbox: bbox, status: "fetching", preparedAt: now, peakCount: 0, datasetVersion: DATASET_VERSION });
      onStatus({ phase: "fetching", tileKey: key, index: j, total: toFetch.length });
      try {
        var url = API_BASE + "/api/peaks?bbox=" + [bbox.s, bbox.w, bbox.n, bbox.e].join(",");
        var ac = new AbortController();
        var tileTimer = setTimeout(function () { ac.abort(); }, TILE_FETCH_TIMEOUT_MS);
        var r;
        try {
          r = await fetch(url, { signal: ac.signal });
        } finally {
          clearTimeout(tileTimer);
        }
        if (!r.ok) throw new Error("HTTP " + r.status);
        var data = await r.json();
        await upsertPeaks(data.peaks, key);
        await putTile({
          tileKey: key, bbox: bbox, status: "prepared", preparedAt: Date.now(),
          peakCount: (data.peaks || []).length, datasetVersion: DATASET_VERSION,
          source: data.source, degraded: !!data.degraded
        });
        fetched++;
        totalPeaks += (data.peaks || []).length;
        onStatus({ phase: "tile-done", tileKey: key, index: j, total: toFetch.length, peakCount: (data.peaks || []).length, degraded: !!data.degraded });
      } catch (e) {
        await putTile({ tileKey: key, bbox: bbox, status: "stale", preparedAt: now, peakCount: 0, datasetVersion: DATASET_VERSION, error: String((e && e.message) || e) });
        failed++;
        onStatus({ phase: "tile-error", tileKey: key, index: j, total: toFetch.length, error: String((e && e.message) || e) });
      }
    }

    // A prepare attempt that tried to fetch tiles and got zero successes (offline,
    // provider down, bogus coordinates…) must NOT touch what's already stored —
    // otherwise one failed attempt at a distant/bad location wipes out perfectly
    // good previously-prepared data. Only finalize (evict + move the prep centre)
    // when nothing needed fetching (already up to date) or at least one tile landed.
    var attemptedFetch = toFetch.length > 0;
    var anySuccess = fetched > 0;
    var finalize = !attemptedFetch || anySuccess;

    var evicted = [];
    if (finalize) {
      evicted = await evictOutside(center, keepRadiusKm);
      await setPrep({ center: center, radiusKm: radiusKm, preparedAt: Date.now(), schemaVersion: DATASET_VERSION, lastOnlineAt: Date.now() });
    }

    var summary = {
      tileKeys: tileKeys, fetched: fetched, failed: failed,
      skipped: tileKeys.length - toFetch.length, evicted: evicted.length, peaksAdded: totalPeaks,
      aborted: attemptedFetch && !anySuccess
    };
    onStatus(Object.assign({ phase: "done" }, summary));
    return summary;
  }

  /**
   * A small, cheap same-origin request that exercises the real network path
   * (browser → Vercel), not just `navigator.onLine` (which only reflects the
   * OS network interface, not real reachability — a phone on Wi-Fi with no
   * internet still reports onLine:true). Hits /api/ping specifically — NOT
   * /api/peaks — because /api/peaks always calls Overpass regardless of bbox
   * size, so its latency reflects Overpass's mood, not device connectivity;
   * that mismatch used to make this report "offline" during perfectly good
   * connections whenever Overpass was merely slow.
   */
  async function pingOnline() {
    if (typeof navigator !== "undefined" && "onLine" in navigator && !navigator.onLine) return false;
    try {
      var ac = new AbortController();
      var timer = setTimeout(function () { ac.abort(); }, PING_TIMEOUT_MS);
      var r = await fetch(API_BASE + "/api/ping", { signal: ac.signal, cache: "no-store" });
      clearTimeout(timer);
      return !!r.ok;
    } catch (e) {
      return false;
    }
  }

  /**
   * The Stage 4 "rolling window": call this on every position update (e.g.
   * from a geolocation watchPosition callback). It decides on its own
   * whether anything needs to happen — drifted > DRIFT_KM from the prepared
   * centre, or nothing prepared yet — and if so, online-gates the attempt
   * (skips + backs off when there's no real connectivity) before running
   * the same prepareArea() Stage 2 already validated. Safe to call rapidly;
   * it no-ops cheaply (one IndexedDB read) the rest of the time.
   *
   * center: { lat, lon }   opts: { radiusKm, keepRadiusKm, driftKm, onStatus }
   * Returns a small result object; callers that want to know whether new
   * data landed should check `result.fetched > 0`.
   */
  async function autoPrepareIfNeeded(center, opts) {
    opts = opts || {};
    var onStatus = opts.onStatus || function () {};
    var driftKm = opts.driftKm || DRIFT_KM;

    if (autoState.inFlight) return { skipped: "already-running" };
    if (Date.now() < autoState.backoffUntil) {
      return { skipped: "backoff", retryInMs: autoState.backoffUntil - Date.now() };
    }

    var prep = await getPrep();
    var reason;
    if (!prep) {
      reason = "no-prep-yet";
    } else {
      var d = haversineKm(prep.center.lat, prep.center.lon, center.lat, center.lon);
      if (d > driftKm) reason = "drifted-" + Math.round(d) + "km";
    }
    if (!reason) return { skipped: "not-needed" };

    onStatus({ phase: "checking-online", reason: reason });
    var online = await pingOnline();
    if (!online) {
      autoState.backoffMs = autoState.backoffMs ? Math.min(autoState.backoffMs * 2, BACKOFF_MAX_MS) : BACKOFF_BASE_MS;
      autoState.backoffUntil = Date.now() + autoState.backoffMs;
      onStatus({ phase: "offline", reason: reason, backoffMs: autoState.backoffMs });
      return { skipped: "offline", reason: reason, backoffMs: autoState.backoffMs };
    }

    autoState.inFlight = true;
    try {
      var summary = await prepareArea(center, opts.radiusKm, { onStatus: onStatus, keepRadiusKm: opts.keepRadiusKm });
      if (summary.aborted) {
        autoState.backoffMs = autoState.backoffMs ? Math.min(autoState.backoffMs * 2, BACKOFF_MAX_MS) : BACKOFF_BASE_MS;
        autoState.backoffUntil = Date.now() + autoState.backoffMs;
      } else {
        autoState.backoffMs = 0;
        autoState.backoffUntil = 0;
      }
      return Object.assign({ reason: reason }, summary);
    } finally {
      autoState.inFlight = false;
    }
  }

  /** Read every stored peak covering a ~radiusKm disc around `center` — no network. */
  async function peaksForBox(center, radiusKm) {
    var tileKeys = Tiles.tilesCoveringDisc(center.lat, center.lon, radiusKm || DEFAULT_RADIUS_KM);
    var out = [], seen = {};
    for (var i = 0; i < tileKeys.length; i++) {
      var list = await peaksInTile(tileKeys[i]);
      for (var j = 0; j < list.length; j++) {
        if (!seen[list[j].id]) { seen[list[j].id] = true; out.push(list[j]); }
      }
    }
    return out;
  }

  /** All tile records (for a status UI / debugging). */
  async function allTiles() {
    var db = await openDB();
    return reqPromise(db.transaction("tiles").objectStore("tiles").getAll());
  }

  async function requestPersistence() {
    if (navigator.storage && navigator.storage.persist) {
      try { return await navigator.storage.persist(); } catch (e) { return false; }
    }
    return false;
  }
  async function isPersisted() {
    if (navigator.storage && navigator.storage.persisted) {
      try { return await navigator.storage.persisted(); } catch (e) { return false; }
    }
    return false;
  }
  async function estimateUsage() {
    if (navigator.storage && navigator.storage.estimate) {
      try { return await navigator.storage.estimate(); } catch (e) { return null; }
    }
    return null;
  }

  async function clearAll() {
    var db = await openDB();
    var t = db.transaction(["peaks", "tiles", "prep"], "readwrite");
    t.objectStore("peaks").clear();
    t.objectStore("tiles").clear();
    t.objectStore("prep").clear();
    return txDone(t);
  }

  return {
    prepareArea: prepareArea,
    autoPrepareIfNeeded: autoPrepareIfNeeded,
    pingOnline: pingOnline,
    peaksForBox: peaksForBox,
    getPrep: getPrep,
    allTiles: allTiles,
    requestPersistence: requestPersistence,
    isPersisted: isPersisted,
    estimateUsage: estimateUsage,
    clearAll: clearAll
  };
});
