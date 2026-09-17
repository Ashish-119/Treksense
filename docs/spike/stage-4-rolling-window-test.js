"use strict";
const $ = (id) => document.getElementById(id);

// Real places, Kathmandu into the Khumbu (Everest region), Nepal — ~155 km
// straight-line, genuinely fresh ground for this store (never exercised by
// any prior Stage 4 test) and one of the densest real peak areas OSM has
// (Everest, Lhotse, Nuptse, Ama Dablam and more all fall inside this route).
// Note: the whole span is under DEFAULT_KEEP_RADIUS_KM (250 km), so unlike
// the original Delhi -> Sankri route, this one won't trigger eviction —
// that behaviour was already validated separately. This route is for
// prep speed + real coverage in an untouched, peak-rich area.
const ROUTE = [
  { name: "Kathmandu", lat: 27.7172, lon: 85.3240 },
  { name: "Lukla", lat: 27.6869, lon: 86.7314 },
  { name: "Phakding", lat: 27.7486, lon: 86.7154 },
  { name: "Namche Bazaar", lat: 27.8069, lon: 86.7140 },
  { name: "Tengboche", lat: 27.8353, lon: 86.7638 },
  { name: "Dingboche", lat: 27.8926, lon: 86.8331 },
  { name: "Lobuche", lat: 27.9622, lon: 86.8078 },
  { name: "Gorak Shep", lat: 28.0051, lon: 86.8281 },
  { name: "Everest Base Camp", lat: 28.0026, lon: 86.8528 },
  { name: "Kala Patthar", lat: 28.0074, lon: 86.8285 },
];

const state = { idx: -1, running: false, outcomes: [] }; // outcomes[i]: "ok" | "skipped" | "bad", per waypoint

const log = (msg) => { const el = $("log"); el.textContent = (el.textContent === "idle — tap \"Next waypoint\" to start" ? "" : el.textContent + "\n") + msg; el.scrollTop = el.scrollHeight; };
const fmtAge = (ms) => {
  if (ms == null) return "—";
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.round(s / 60) + "m ago";
  if (s < 86400) return Math.round(s / 3600) + "h ago";
  return Math.round(s / 86400) + "d ago";
};
function haversineKm(a, b) {
  const R = 6371, toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat), dLon = toR(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function row(k, v, cls) { return `<div><span class="k">${k}</span><span class="v ${cls || ""}">${v}</span></div>`; }

function renderRoute() {
  $("routeChips").innerHTML = ROUTE.map((wp, i) => {
    // "now" (currently being stepped to) beats a stale outcome from a prior run;
    // otherwise colour by what actually happened here, not just "did we visit it" —
    // a chip that visually says "done" for a step that was skipped/backed-off is misleading.
    const cls = i === state.idx ? "now" : state.outcomes[i] || "";
    const mark = state.outcomes[i] === "bad" ? " ✗" : state.outcomes[i] === "skipped" ? " ⋯" : state.outcomes[i] === "ok" ? " ✓" : "";
    return `<span class="wp ${cls}">${i + 1}. ${wp.name}${mark}</span>`;
  }).join("");
}

async function refreshPrep() {
  const p = await PeakStore.getPrep();
  $("prepRows").innerHTML = p
    ? row("centre", `${p.center.lat.toFixed(3)}, ${p.center.lon.toFixed(3)}`) +
      row("radius", p.radiusKm + " km") +
      row("prepared", fmtAge(p.preparedAt)) +
      row("last online", fmtAge(p.lastOnlineAt))
    : row("status", "nothing prepared yet", "warn");
}
async function refreshTiles() {
  const tiles = await PeakStore.allTiles();
  const tbody = $("tilesTable").querySelector("tbody");
  tbody.innerHTML = tiles.sort((a, b) => a.tileKey.localeCompare(b.tileKey)).map((t) =>
    `<tr><td>${t.tileKey}</td><td><span class="tag ${t.status}">${t.status}</span></td><td>${t.peakCount}</td><td>${fmtAge(t.preparedAt)}</td></tr>`
  ).join("") || `<tr><td colspan="4" style="color:var(--dim)">none yet</td></tr>`;

  const est = await PeakStore.estimateUsage();
  $("usageRow").textContent = est ? `${(est.usage / 1024).toFixed(0)} KB / ${(est.quota / 1024 / 1024).toFixed(0)} MB quota` : "not supported";
}

async function step() {
  if (state.idx >= ROUTE.length - 1) { log("— end of route —"); return false; }
  state.idx++;
  const wp = ROUTE[state.idx];
  renderRoute();
  log(`\n[${state.idx + 1}/${ROUTE.length}] ${wp.name} (${wp.lat}, ${wp.lon})`);

  const result = await PeakStore.autoPrepareIfNeeded({ lat: wp.lat, lon: wp.lon }, {
    onStatus(evt) {
      if (evt.phase === "checking-online") log(`  reason: ${evt.reason} — pinging…`);
      else if (evt.phase === "start") log(`  ${evt.totalTiles} tiles cover this area · ${evt.toFetch} need fetching`);
      else if (evt.phase === "tile-done") log(`  ✓ ${evt.tileKey} — ${evt.peakCount} peaks${evt.degraded ? " (offline dataset)" : ""}`);
      else if (evt.phase === "tile-error") log(`  ✗ ${evt.tileKey} — ${evt.error}`);
      else if (evt.phase === "offline") log(`  ⚠ offline — backing off ${Math.round(evt.backoffMs / 1000)}s`);
    },
  });

  if (result.skipped === "not-needed") { log(`  skipped: not-needed (still within 15 km of the prepared centre)`); state.outcomes[state.idx] = "ok"; }
  else if (result.skipped === "offline") { log(`  skipped: offline (backoff ${Math.round(result.backoffMs / 1000)}s)`); state.outcomes[state.idx] = "skipped"; }
  else if (result.skipped === "backoff") { log(`  skipped: backoff, ${Math.round(result.retryInMs / 1000)}s remaining`); state.outcomes[state.idx] = "skipped"; }
  else if (result.skipped === "already-running") { log(`  skipped: already running`); state.outcomes[state.idx] = "skipped"; }
  else {
    log(`  done — fetched ${result.fetched}, failed ${result.failed}, evicted ${result.evicted}, +${result.peaksAdded} peaks${result.aborted ? " ⚠ aborted (nothing changed)" : ""}`);
    state.outcomes[state.idx] = result.aborted ? "bad" : "ok";
  }
  renderRoute();

  await refreshPrep();
  await refreshTiles();
  return true;
}

$("stepBtn").addEventListener("click", async () => {
  $("stepBtn").disabled = true;
  await step();
  $("stepBtn").disabled = false;
});

$("runBtn").addEventListener("click", async () => {
  if (state.running) return;
  state.running = true;
  $("runBtn").disabled = true;
  $("stepBtn").disabled = true;
  while (state.idx < ROUTE.length - 1 && state.running) {
    const more = await step();
    if (!more) break;
    await new Promise((r) => setTimeout(r, 900));
  }
  state.running = false;
  $("runBtn").disabled = false;
  $("stepBtn").disabled = false;
});

$("resetBtn").addEventListener("click", async () => {
  await PeakStore.clearAll();
  state.idx = -1;
  state.running = false;
  state.outcomes = [];
  $("log").textContent = "idle — tap \"Next waypoint\" to start";
  renderRoute();
  await refreshPrep();
  await refreshTiles();
});

renderRoute();
refreshPrep();
refreshTiles();
