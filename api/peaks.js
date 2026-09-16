/* ============================================================
   TrekSense — /api/peaks   (Vercel serverless function)

   Peak Finder v2 backend proxy. Stage 1 of the AR blueprint:
   docs/peak-finder-ar-blueprint.html

   - Provider: OpenStreetMap via the Overpass API (no key). Swap
     queryOverpass() for any other provider — the response shape
     below is the frozen contract the client (Stage 2+) builds on.
   - Takes a BOUNDING BOX, not a radius, so requests from the
     Stage 2+ on-device tile store (js/tiles.js, 0.5° grid) land on
     identical URLs and hit the edge cache — no repeat provider
     calls for an already-prepared area.
   - Degrades to a bundled ~130-peak dataset when the provider fails.

   GET /api/peaks?bbox=south,west,north,east
   Response schema — see docs/PEAKS-API.md for the full contract.
   ============================================================ */

const FALLBACK = require("./_fallback-peaks.json");

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const EARTH_R = 6371;              // km
const MAX_RESULTS = 800;
const PER_ENDPOINT_TIMEOUT_MS = 13500; // 2 endpoints × 13.5s = 27s, fits under vercel.json's 30s maxDuration.
                                        // 12s was too tight for genuinely dense areas (Ladakh's plateau, e.g.) —
                                        // found via a live coverage check across Himachal/Ladakh/Arunachal/Sikkim.
const MAX_BBOX_DEG2 = 1.0;         // ~4 tiles worth (each tile = 0.25 deg^2)
const MAX_BBOX_SIDE_DEG = 3;       // guards a very thin, very long box
const TILE_DEG = 0.5;

function haversineKm(aLat, aLon, bLat, bLon) {
  const toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(bLat - aLat);
  const dLon = toR(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(aLat)) * Math.cos(toR(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(h));
}

/* Overpass "ele" tags are messy: "1234", "1234 m", "1,234", "1234m ASL". */
function parseNumericTag(raw) {
  if (raw == null) return null;
  const m = String(raw).replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const v = parseFloat(m[0]);
  return Number.isFinite(v) ? Math.round(v) : null;
}

/* OSM's natural=peak near towns is full of novelty nodes ("Lucky Hills",
   cycling waypoints). For a Himalaya product, keep a node only if it has a
   real mountain elevation or is notable enough to carry a wiki link. */
function isMountainPeak(tags, elevation) {
  if (elevation != null && elevation >= 1000) return true;
  return !!(tags.wikidata || tags.wikipedia);
}

function normalise(elements) {
  const seen = new Map();
  for (const el of elements || []) {
    const lat = el.lat != null ? el.lat : el.center && el.center.lat;
    const lon = el.lon != null ? el.lon : el.center && el.center.lon;
    const tags = el.tags || {};
    const name = tags.name || tags["name:en"];
    if (lat == null || lon == null || !name) continue;
    const elevation = parseNumericTag(tags.ele != null ? tags.ele : tags["ele:m"]);
    if (!isMountainPeak(tags, elevation)) continue;
    const key = name.toLowerCase() + "@" + Number(lat).toFixed(3) + "," + Number(lon).toFixed(3);
    if (seen.has(key)) continue;
    seen.set(key, {
      id: "osm:" + el.type + "/" + el.id,
      name,
      lat: +Number(lat).toFixed(5),
      lon: +Number(lon).toFixed(5),
      elevation,
      prominence: parseNumericTag(tags.prominence),
      region: tags["place"] || tags["is_in:region"] || tags["is_in"] || null,
      source: "osm",
    });
  }
  return [...seen.values()];
}

async function queryOverpass(bbox) {
  const q =
    `[out:json][timeout:25];` +
    `(node["natural"="peak"]["name"](${bbox.s},${bbox.w},${bbox.n},${bbox.e}););` +
    `out body ${MAX_RESULTS};`;

  let lastErr;
  for (const url of OVERPASS_ENDPOINTS) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), PER_ENDPOINT_TIMEOUT_MS);
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "TrekSense-PeakFinder/2.0 (+https://github.com/Ashish-119/Treksense)",
        },
        body: "data=" + encodeURIComponent(q),
        signal: ac.signal,
      });
      clearTimeout(timer);
      if (!r.ok) { lastErr = new Error("Overpass HTTP " + r.status); continue; }
      const json = await r.json();
      return json.elements || [];
    } catch (e) {
      clearTimeout(timer);
      lastErr = e;
    }
  }
  throw lastErr || new Error("Overpass unavailable");
}

function parseBbox(raw) {
  if (!raw) return { error: "Query param 'bbox' is required: bbox=south,west,north,east" };
  const parts = String(raw).split(",").map((s) => parseFloat(s.trim()));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
    return { error: "'bbox' must be 4 comma-separated numbers: south,west,north,east" };
  }
  const [s, w, n, e] = parts;
  if (s < -90 || n > 90 || w < -180 || e > 180) return { error: "bbox coordinates out of range" };
  if (s >= n || w >= e) return { error: "bbox must have south < north and west < east" };
  if (n - s > MAX_BBOX_SIDE_DEG || e - w > MAX_BBOX_SIDE_DEG) {
    return { error: `bbox side too large — max ${MAX_BBOX_SIDE_DEG}° per side` };
  }
  if ((n - s) * (e - w) > MAX_BBOX_DEG2) {
    return { error: `bbox area too large — max ${MAX_BBOX_DEG2} deg² (~4 tiles). Request one tile at a time.` };
  }
  return { bbox: { s, w, n, e } };
}

/* Only set when bbox is exactly one canonical 0.5° tile (see js/tiles.js) — lets
   the client confirm it landed on a cache-friendly request. */
function tileKeyIfExact(bbox) {
  const eps = 1e-6;
  const snapS = Math.floor(bbox.s / TILE_DEG) * TILE_DEG;
  const snapW = Math.floor(bbox.w / TILE_DEG) * TILE_DEG;
  const isTile =
    Math.abs(bbox.s - snapS) < eps && Math.abs(bbox.w - snapW) < eps &&
    Math.abs(bbox.n - bbox.s - TILE_DEG) < eps && Math.abs(bbox.e - bbox.w - TILE_DEG) < eps;
  return isTile ? Math.round(bbox.s * 10) / 10 + "_" + Math.round(bbox.w * 10) / 10 : null;
}

module.exports = async (req, res) => {
  const q = req.query || {};
  const parsed = parseBbox(q.bbox);
  if (parsed.error) { res.status(400).json({ error: parsed.error }); return; }
  const bbox = parsed.bbox;

  const base = {
    bbox: [bbox.s, bbox.w, bbox.n, bbox.e],
    tileKey: tileKeyIfExact(bbox),
    generatedAt: new Date().toISOString(),
  };

  try {
    const raw = await queryOverpass(bbox);
    const peaks = normalise(raw).sort((a, b) => (b.elevation || 0) - (a.elevation || 0));

    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).json({ ...base, source: "osm", count: peaks.length, peaks });
  } catch (e) {
    const peaks = FALLBACK
      .filter((p) => p.lat >= bbox.s && p.lat <= bbox.n && p.lon >= bbox.w && p.lon <= bbox.e)
      .map((p) => ({
        id: "fallback:" + p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        name: p.name,
        lat: p.lat,
        lon: p.lon,
        elevation: p.elevation != null ? p.elevation : null,
        prominence: null,
        region: p.range || null,
        source: "fallback",
      }))
      .sort((a, b) => (b.elevation || 0) - (a.elevation || 0));

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json({
      ...base,
      source: "fallback",
      degraded: true,
      providerError: String((e && e.message) || e),
      count: peaks.length,
      peaks,
    });
  }
};
