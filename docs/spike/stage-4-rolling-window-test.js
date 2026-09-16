"use strict";
const $ = (id) => document.getElementById(id);

// Real places, roughly Delhi -> Sankri, ~290 km straight-line. Spacing is
// mostly >15 km so most steps should trigger the drift detector — deliberately
// exercising the trigger logic at nearly every step rather than mostly no-ops.
const ROUTE = [
  { name: "Delhi", lat: 28.61, lon: 77.21 },
  { name: "Panipat", lat: 29.39, lon: 76.97 },
  { name: "Ambala", lat: 30.38, lon: 76.78 },
  { name: "Saharanpur", lat: 29.97, lon: 77.55 },
  { name: "Roorkee", lat: 29.87, lon: 77.89 },
  { name: "Rishikesh", lat: 30.09, lon: 78.27 },
  { name: "Mussoorie", lat: 30.45, lon: 78.08 },
  { name: "Barkot", lat: 30.81, lon: 78.20 },
  { name: "Netwar", lat: 31.00, lon: 78.22 },
  { name: "Sankri", lat: 31.05, lon: 78.28 },
];

const state = { idx: -1, running: false };

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
    const cls = i < state.idx ? "done" : i === state.idx ? "now" : "";
    return `<span class="wp ${cls}">${i + 1}. ${wp.name}</span>`;
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

  if (result.skipped === "not-needed") log(`  skipped: not-needed (still within 15 km of the prepared centre)`);
  else if (result.skipped === "offline") log(`  skipped: offline (backoff ${Math.round(result.backoffMs / 1000)}s)`);
  else if (result.skipped === "backoff") log(`  skipped: backoff, ${Math.round(result.retryInMs / 1000)}s remaining`);
  else if (result.skipped === "already-running") log(`  skipped: already running`);
  else log(`  done — fetched ${result.fetched}, failed ${result.failed}, evicted ${result.evicted}, +${result.peaksAdded} peaks${result.aborted ? " ⚠ aborted (nothing changed)" : ""}`);

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
  $("log").textContent = "idle — tap \"Next waypoint\" to start";
  renderRoute();
  await refreshPrep();
  await refreshTiles();
});

renderRoute();
refreshPrep();
refreshTiles();
