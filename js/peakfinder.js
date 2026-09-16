/* ============================================================
   TrekSense — peakfinder.js   (Peak Finder — Stage 3 AR view)

   Camera + compass + GPS → js/peakstore.js (offline-first data) →
   bearing/elevation-angle projection → labels on the live view.

   Sensor-fusion logic (heading source detection, declination
   stand-in, EMA smoothing) is ported from the Stage 0 spike
   (docs/spike/sensor-spike.html), which was validated on real
   iOS + Android devices. Projection math matches the geometry
   figure in docs/peak-finder-ar-blueprint.html.

   Deliberately NOT built here (out of Stage 3 scope, scheduled
   for Stage 4/5 instead): automatic background preparation, a
   no-camera map-mode fallback, and manual location entry when
   GPS is denied. Denied permissions just show a plain error for
   now — see docs/BUILD-LOG.md.
   ============================================================ */
"use strict";
const $ = (id) => document.getElementById(id);

/* ---------- constants ---------- */
const EARTH_R_KM = 6371;
const R_EFF_M = EARTH_R_KM * 1000 * (7 / 6); // curvature + standard refraction
const DEFAULT_HFOV = 55;
const VFOV_FACTOR = 1.35;
const FRAME_MS_ACTIVE = 50;   // ~20 Hz, matches blueprint t3-7
const FRAME_MS_IDLE = 500;    // ~2 Hz once the phone's been still a while
const IDLE_GYRO_THRESHOLD = 1.5; // deg/s summed |x|+|y|+|z|, below this counts as "still"
const IDLE_HOLD_MS = 3000;
const PREPARE_RADIUS_KM = 100;

const LS_OFFSET_KEY = "ts-pf-heading-offset";
const LS_PITCHOFF_KEY = "ts-pf-pitch-offset";
const LS_HFOV_KEY = "ts-pf-hfov";
const LS_ALT_KEY = "ts-pf-observer-alt";

/* ---------- geo / projection math ---------- */
function toRad(d) { return (d * Math.PI) / 180; }
function toDeg(r) { return (r * 180) / Math.PI; }
function norm360(d) { return ((d % 360) + 360) % 360; }
function norm180(d) { d = norm360(d); return d > 180 ? d - 360 : d; }

function haversineKm(a, b) {
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R_KM * Math.asin(Math.sqrt(h));
}
function bearingDeg(a, b) {
  const dLon = toRad(b.lon - a.lon);
  const y = Math.sin(dLon) * Math.cos(toRad(b.lat));
  const x = Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) - Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(dLon);
  return norm360(toDeg(Math.atan2(y, x)));
}
/* elevation angle above horizontal, degrees. distances in km, elevations in metres. */
function elevationAngleDeg(observerAltM, peakElevM, distKm) {
  const dh = (peakElevM != null ? peakElevM : 0) - (observerAltM || 0);
  const d_m = distKm * 1000;
  const curveDrop = (d_m * d_m) / (2 * R_EFF_M);
  return toDeg(Math.atan2(dh - curveDrop, Math.max(d_m, 1)));
}
const COMPASS_PTS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
function compassPoint(deg) { return COMPASS_PTS[Math.round(norm360(deg) / 22.5) % 16]; }

/* Coarse magnetic declination stand-in — identical model to the Stage 0 spike.
   Only matters when the source isn't already true (Android, mostly). Real WMM
   evaluator is deferred to whenever Android Stage 0 data lands (see BUILD-LOG). */
function declination(lat, lon) {
  if (lat == null) return 0.8;
  const d = 0.6 + (78 - lon) * 0.30 + (lat - 30) * 0.12;
  return Math.max(-1.5, Math.min(4, d));
}

/* ---------- state ---------- */
const S = {
  rawHeading: null, headingSource: "none", headingIsTrue: false, sawAbsolute: false, lastAbsoluteAt: 0,
  smoothed: null, smoothAlpha: 0.18, pitch: 0, roll: 0, gyroRate: null, compassAcc: null, screenAngle: 0,
  headingSamples: [],
  headingOffset: 0, pitchOffset: 0, hFOV: DEFAULT_HFOV, observerAlt: null,
  pos: null,
  peaks: [],
  calib: { step: 0, peakA: null, tapXFrac: null },
  lastRenderAt: 0, idleSince: null,
  camStream: null,
};

function loadPersisted() {
  try {
    const ho = parseFloat(localStorage.getItem(LS_OFFSET_KEY)); if (!isNaN(ho)) S.headingOffset = ho;
    const po = parseFloat(localStorage.getItem(LS_PITCHOFF_KEY)); if (!isNaN(po)) S.pitchOffset = po;
    const hf = parseFloat(localStorage.getItem(LS_HFOV_KEY)); if (!isNaN(hf) && hf >= 25 && hf <= 100) S.hFOV = hf;
    const alt = parseFloat(localStorage.getItem(LS_ALT_KEY)); if (!isNaN(alt)) S.observerAlt = alt;
  } catch (e) {}
}
function persistOffsets() {
  try {
    localStorage.setItem(LS_OFFSET_KEY, String(S.headingOffset));
    localStorage.setItem(LS_PITCHOFF_KEY, String(S.pitchOffset));
  } catch (e) {}
}
function persistCalibration() {
  try {
    localStorage.setItem(LS_HFOV_KEY, String(S.hFOV));
    localStorage.setItem(LS_OFFSET_KEY, String(S.headingOffset));
  } catch (e) {}
}
function persistAltitude() {
  try { localStorage.setItem(LS_ALT_KEY, String(S.observerAlt)); } catch (e) {}
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $("site-header").innerHTML = headerHTML("peaks");
  $("bottom-nav").innerHTML = bottomNavHTML("peaks");
  updateThemeIcons();
  loadPersisted();
  renderPreflight();
  $("pkfStartBtn").addEventListener("click", startFlow);
  $("pkfErrorRetry").addEventListener("click", () => location.reload());
  $("pkfSheetClose").addEventListener("click", () => $("pkfSheet").classList.remove("show"));
  $("pkfResetBtn").addEventListener("click", () => {
    S.headingOffset = 0; S.pitchOffset = 0; persistOffsets();
    toast("Field correction reset.");
  });
  $("pkfPrepareToggleBtn").addEventListener("click", () => { $("pkfBanner").hidden = !$("pkfBanner").hidden; });
  $("pkfPrepareBtn").addEventListener("click", doPrepare);
  $("pkfSensorChip").addEventListener("click", () => toast("Wave your phone in a slow figure-8 a few times to recalibrate the compass."));
  $("pkfCalibBtn").addEventListener("click", openCalibStep1);
  $("pkfCalibClose").addEventListener("click", closeCalib);
  $("pkfCalibTapCancel").addEventListener("click", (e) => { e.stopPropagation(); closeCalib(); });
  $("pkfCalibTapHint").addEventListener("click", onCalibTap);
  $("pkfAltInput").addEventListener("change", (e) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) { S.observerAlt = v; persistAltitude(); toast("Altitude set to " + v + " m."); }
  });
  if (S.observerAlt != null) $("pkfAltInput").value = S.observerAlt;
});

function renderPreflight() {
  const hasCam = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const hasDO = typeof DeviceOrientationEvent !== "undefined";
  const hasGeo = "geolocation" in navigator;
  const secure = window.isSecureContext;
  const row = (k, v, cls) => `<div><span class="k">${k}</span><span class="v ${cls || ""}">${v}</span></div>`;
  $("pkfChecklist").innerHTML =
    row("Secure connection", secure ? "yes" : "no — sensors will fail", secure ? "ok" : "bad") +
    row("Camera", hasCam ? "available" : "missing", hasCam ? "ok" : "bad") +
    row("Compass / orientation", hasDO ? "available" : "missing", hasDO ? "ok" : "bad") +
    row("Location", hasGeo ? "available" : "missing", hasGeo ? "ok" : "bad");
}

async function startFlow() {
  $("pkfStartBtn").disabled = true;
  $("pkfGateErr").textContent = "";
  try {
    await requestOrientationPermission();
    attachSensorListeners();
    await startCamera();
    await waitForFirstPosition();

    updateScreenAngle();
    window.addEventListener("orientationchange", updateScreenAngle);
    if (screen.orientation) screen.orientation.addEventListener("change", updateScreenAngle);

    $("pkfGate").hidden = true;
    $("pkfView").hidden = false;
    await loadPeaksForCurrentArea();
    setupDragHandlers();
    requestAnimationFrame(loop);
  } catch (e) {
    showError(e);
  }
  $("pkfStartBtn").disabled = false;
}

async function requestOrientationPermission() {
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
    const r = await DeviceOrientationEvent.requestPermission();
    if (r !== "granted") throw new Error("Motion & orientation permission was denied — Peak Finder needs it to know which way you're facing.");
  }
  if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
    try { await DeviceMotionEvent.requestPermission(); } catch (e) {}
  }
}
function attachSensorListeners() {
  window.addEventListener("deviceorientationabsolute", onOrient, true);
  window.addEventListener("deviceorientation", onOrient, true);
  window.addEventListener("devicemotion", onMotion, true);
}
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    $("pkfCam").srcObject = stream;
    S.camStream = stream;
  } catch (e) {
    const msg = e.name === "NotAllowedError" ? "Camera permission denied. Allow it in your browser settings and try again."
      : e.name === "NotFoundError" ? "No usable camera found on this device."
      : "Could not start the camera (" + (e.name || e.message) + ").";
    throw new Error(msg);
  }
}
function geoErrorMessage(err) {
  if (err.code === 1) return "Location permission denied. Allow it in your browser settings and try again.";
  if (err.code === 2) return "Location unavailable right now. Try again outdoors with a clear sky view.";
  if (err.code === 3) return "Location timed out. Try again outdoors with a clear sky view.";
  return err.message || "Could not get your location.";
}
function waitForFirstPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error("Geolocation isn't supported in this browser.")); return; }
    let settled = false;
    const timer = setTimeout(() => { if (!settled) { settled = true; reject(new Error("Location timed out. Try again outdoors with a clear sky view.")); } }, 16000);
    navigator.geolocation.watchPosition(
      (pos) => {
        S.pos = { lat: pos.coords.latitude, lon: pos.coords.longitude, alt: pos.coords.altitude, acc: pos.coords.accuracy };
        if (S.observerAlt == null && pos.coords.altitude != null) S.observerAlt = pos.coords.altitude;
        if (!settled) { settled = true; clearTimeout(timer); resolve(); }
      },
      (err) => { if (!settled) { settled = true; clearTimeout(timer); reject(new Error(geoErrorMessage(err))); } },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  });
}
function updateScreenAngle() {
  S.screenAngle = (screen.orientation && typeof screen.orientation.angle === "number") ? screen.orientation.angle : (typeof window.orientation === "number" ? window.orientation : 0);
}
function showError(e) {
  $("pkfErrorMsg").textContent = (e && e.message) || String(e);
  $("pkfError").hidden = false;
  $("pkfGate").hidden = true;
}

/* ---------- sensors ---------- */
function onOrient(e) {
  const now = performance.now();
  const isAbs = e.absolute === true || e.type === "deviceorientationabsolute";
  let h = null, src = "none", isTrue = false;

  if (typeof e.webkitCompassHeading === "number" && !isNaN(e.webkitCompassHeading)) {
    h = e.webkitCompassHeading; src = "ios-true"; isTrue = true;
    if (typeof e.webkitCompassAccuracy === "number") S.compassAcc = e.webkitCompassAccuracy;
    S.sawAbsolute = true; S.lastAbsoluteAt = now;
  } else if (isAbs && typeof e.alpha === "number") {
    h = norm360(360 - e.alpha); src = "absolute-mag";
    S.sawAbsolute = true; S.lastAbsoluteAt = now;
  } else if (typeof e.alpha === "number") {
    if (now - S.lastAbsoluteAt < 1500) return; // already have a better source
    h = norm360(360 - e.alpha); src = "relative";
  }
  if (h == null) return;
  h = norm360(h + S.screenAngle);

  S.rawHeading = h; S.headingSource = src; S.headingIsTrue = isTrue;
  if (typeof e.beta === "number") S.pitch = e.beta - 90;
  if (typeof e.gamma === "number") S.roll = e.gamma;

  S.headingSamples.push({ t: now, h: h });
  while (S.headingSamples.length && now - S.headingSamples[0].t > 2500) S.headingSamples.shift();
}
function onMotion(e) {
  if (e.rotationRate && typeof e.rotationRate.alpha === "number") {
    S.gyroRate = e.rotationRate.alpha;
    const mag = Math.abs(e.rotationRate.alpha || 0) + Math.abs(e.rotationRate.beta || 0) + Math.abs(e.rotationRate.gamma || 0);
    const now = performance.now();
    if (mag > IDLE_GYRO_THRESHOLD) S.idleSince = null;
    else if (S.idleSince == null) S.idleSince = now;
  }
}
function smoothHeading() {
  const raw = S.rawHeading;
  if (raw == null) return null;
  if (S.smoothed == null) { S.smoothed = raw; return raw; }
  S.smoothed = norm360(S.smoothed + S.smoothAlpha * norm180(raw - S.smoothed));
  return S.smoothed;
}
function computeTrueHeading() {
  const sm = smoothHeading();
  if (sm == null) return null;
  const base = S.headingIsTrue ? sm : norm360(sm + declination(S.pos && S.pos.lat, S.pos && S.pos.lon));
  return norm360(base + S.headingOffset);
}
function circMean(arr) {
  let s = 0, c = 0;
  arr.forEach((h) => { s += Math.sin(toRad(h)); c += Math.cos(toRad(h)); });
  return norm360(toDeg(Math.atan2(s, c)));
}
function poseConfidence() {
  if (S.compassAcc != null) {
    if (S.compassAcc < 0) return { level: "bad", label: "uncalibrated — tap to fix" };
    if (S.compassAcc <= 10) return { level: "good", label: "±" + Math.round(S.compassAcc) + "°" };
    if (S.compassAcc <= 20) return { level: "warn", label: "±" + Math.round(S.compassAcc) + "°" };
    return { level: "bad", label: "±" + Math.round(S.compassAcc) + "° — tap to fix" };
  }
  const hs = S.headingSamples.map((x) => x.h);
  if (hs.length < 5) return { level: "warn", label: "reading…" };
  const mean = circMean(hs);
  const dev = hs.map((h) => Math.abs(norm180(h - mean)));
  const sd = Math.sqrt(dev.reduce((a, b) => a + b * b, 0) / dev.length);
  if (sd < 1.5) return { level: "good", label: "stable" };
  if (sd < 4) return { level: "warn", label: "noisy — hold steady" };
  return { level: "bad", label: "unstable — tap to fix" };
}
function currentFrameInterval() {
  if (S.idleSince != null && performance.now() - S.idleSince > IDLE_HOLD_MS) return FRAME_MS_IDLE;
  return FRAME_MS_ACTIVE;
}

/* ---------- data ---------- */
async function loadPeaksForCurrentArea() {
  if (!S.pos) return;
  const prep = await PeakStore.getPrep();
  const list = await PeakStore.peaksForBox(S.pos, (prep && prep.radiusKm) || PREPARE_RADIUS_KM);
  S.peaks = list;
  if (!list.length) {
    $("pkfBannerText").textContent = "No peaks prepared near you yet.";
    $("pkfBanner").hidden = false;
  }
}
async function doPrepare() {
  if (!S.pos) return;
  $("pkfPrepareBtn").disabled = true;
  const log = $("pkfPrepareLog");
  log.hidden = false;
  log.textContent = "preparing…";
  try {
    const summary = await PeakStore.prepareArea(S.pos, PREPARE_RADIUS_KM, {
      onStatus(evt) {
        if (evt.phase === "start") log.textContent = evt.totalTiles + " tiles cover this area · " + evt.toFetch + " need fetching";
        else if (evt.phase === "tile-done") log.textContent += "\n✓ " + evt.tileKey + " — " + evt.peakCount + " peaks" + (evt.degraded ? " (offline dataset)" : "");
        else if (evt.phase === "tile-error") log.textContent += "\n✗ " + evt.tileKey + " — " + evt.error;
      },
    });
    log.textContent += "\ndone — " + summary.fetched + " fetched, +" + summary.peaksAdded + " peaks";
    if (summary.aborted) log.textContent += "\n⚠ offline or provider down — nothing changed";
    await loadPeaksForCurrentArea();
    if (S.peaks.length) $("pkfBanner").hidden = true;
  } catch (e) {
    log.textContent += "\nerror: " + ((e && e.message) || e);
  }
  $("pkfPrepareBtn").disabled = false;
}

/* ---------- render loop ---------- */
function loop(ts) {
  requestAnimationFrame(loop);
  if (ts - S.lastRenderAt < currentFrameInterval()) return;
  S.lastRenderAt = ts;
  renderFrame();
}
function renderFrame() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const heading = computeTrueHeading();
  updateChips(heading);
  if (heading == null) return;
  drawTicks(heading, S.hFOV, vw);
  if (S.pos && S.peaks.length) {
    const pitch = S.pitch + S.pitchOffset;
    placeLabels(heading, pitch, S.hFOV, vw, vh);
  }
}
function updateChips(heading) {
  $("pkfHeadingBig").innerHTML = heading == null ? "—<small>°</small>" : Math.round(heading) + "<small>° " + compassPoint(heading) + "</small>";
  const conf = poseConfidence();
  $("pkfSensorDot").className = "dot" + (conf.level === "good" ? "" : conf.level === "warn" ? " warn" : " bad");
  $("pkfSensorTxt").textContent = conf.label;
  $("pkfDataChip").textContent = S.peaks.length + " peak" + (S.peaks.length === 1 ? "" : "s") + " loaded";
  $("pkfPosChip").textContent = S.pos ? (S.pos.acc ? "±" + Math.round(S.pos.acc) + " m" : "GPS ok") : "locating…";
}
function drawTicks(heading, hFOV, vw) {
  const box = $("pkfTicks");
  box.innerHTML = "";
  const cards = { 0: "N", 45: "NE", 90: "E", 135: "SE", 180: "S", 225: "SW", 270: "W", 315: "NW" };
  const ppd = vw / hFOV;
  const base = Math.round(heading / 5) * 5;
  for (let d = -Math.ceil(hFOV / 2) - 5; d <= hFOV / 2 + 5; d += 5) {
    const brg = norm360(base + d);
    const off = norm180(brg - heading);
    const left = vw / 2 + off * ppd;
    const maj = brg % 45 === 0;
    const i = document.createElement("i");
    if (maj) i.className = "maj";
    i.style.left = left + "px";
    box.appendChild(i);
    if (maj) {
      const b = document.createElement("b");
      b.style.left = left + "px";
      b.textContent = cards[brg];
      box.appendChild(b);
    }
  }
}

/* ---------- labels + collision layout ---------- */
function placeLabels(heading, pitch, hFOV, vw, vh) {
  const hud = $("pkfHud");
  Array.prototype.slice.call(hud.querySelectorAll(".pkf-label")).forEach((n) => n.remove());
  const leaders = $("pkfLeaders");
  leaders.setAttribute("viewBox", "0 0 " + vw + " " + vh);
  leaders.innerHTML = "";

  const ppdV = vh / (hFOV * VFOV_FACTOR);
  const margin = 10;
  const visible = S.peaks
    .map((p) => {
      const dist = haversineKm(S.pos, p);
      const brg = bearingDeg(S.pos, p);
      const rel = norm180(brg - heading);
      if (Math.abs(rel) > hFOV / 2 + margin) return null;
      const elevAngle = elevationAngleDeg(S.observerAlt || 0, p.elevation, dist);
      return {
        p: p, dist: dist, brg: brg,
        x: vw / 2 + rel * (vw / hFOV),
        y: vh * 0.5 - (pitch + elevAngle) * ppdV,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.dist - b.dist);

  const placed = [];
  visible.forEach((v) => {
    const labelW = v.p.name.length * 6.6 + 22, labelH = 34, gap = 14;
    let bottom = v.y - gap;
    let moved = true, guard = 0;
    while (moved && guard < 40) {
      moved = false; guard++;
      for (let j = 0; j < placed.length; j++) {
        const q = placed[j];
        const overlapX = Math.abs(q.x - v.x) < labelW / 2 + q.w / 2 + 6;
        const top = bottom - labelH;
        const overlapY = !(top > q.bot || bottom < q.top);
        if (overlapX && overlapY) { bottom = q.top - 6; moved = true; }
      }
    }
    placed.push({ x: v.x, w: labelW, top: bottom - labelH, bot: bottom });

    const ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
    ln.setAttribute("x1", v.x); ln.setAttribute("y1", bottom); ln.setAttribute("x2", v.x); ln.setAttribute("y2", v.y);
    leaders.appendChild(ln);
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", v.x); dot.setAttribute("cy", v.y); dot.setAttribute("r", 2.4);
    leaders.appendChild(dot);

    const ft = v.p.elevation != null ? Math.round(v.p.elevation * 3.28084).toLocaleString("en-IN") + " ft" : "elev n/a";
    const distTxt = v.dist < 10 ? v.dist.toFixed(1) : String(Math.round(v.dist));
    const el = document.createElement("button");
    el.type = "button";
    el.className = "pkf-label pkf-hit" + (v.dist > 35 ? " far" : "");
    el.style.left = v.x + "px";
    el.style.top = bottom + "px";
    el.innerHTML = '<div class="nm">' + escapeHTML(v.p.name) + '</div><div class="mt">' + ft + " · " + distTxt + " km · " + compassPoint(v.brg) + "</div>";
    el.addEventListener("click", (ev) => { ev.stopPropagation(); openSheet(v.p, v.dist, v.brg); });
    hud.appendChild(el);
  });
}

/* ---------- detail sheet ---------- */
function openSheet(peak, dist, brg) {
  $("pkfSName").textContent = peak.name;
  $("pkfSSub").textContent = (peak.source === "fallback" ? "Offline dataset" : "OpenStreetMap") + (peak.region ? " · " + peak.region : "");
  $("pkfSFt").textContent = peak.elevation != null ? Math.round(peak.elevation * 3.28084).toLocaleString("en-IN") : "—";
  $("pkfSM").textContent = peak.elevation != null ? peak.elevation.toLocaleString("en-IN") : "n/a";
  const stats = [
    "<span>" + ICONS.route + (dist < 10 ? dist.toFixed(1) : Math.round(dist)) + " km</span>",
    "<span>" + ICONS.compass + compassPoint(brg) + " · " + Math.round(brg) + "°</span>",
  ];
  if (peak.prominence != null) stats.push("<span>" + ICONS.mountain + "prom " + peak.prominence + " m</span>");
  stats.push('<span class="warn">line of sight not checked</span>');
  $("pkfSStats").innerHTML = stats.join("");
  $("pkfSMap").src = "https://maps.google.com/maps?q=" + peak.lat + "," + peak.lon + "(" + encodeURIComponent(peak.name) + ")&t=p&z=12&output=embed";
  $("pkfSDirections").href = "https://www.google.com/maps?q=" + peak.lat + "," + peak.lon + "(" + encodeURIComponent(peak.name) + ")&t=p";
  $("pkfSheet").classList.add("show");
}

/* ---------- field correction (drag to align) ---------- */
let drag = null;
function dragDown(e) {
  const pt = e.touches ? e.touches[0] : e;
  drag = { x: pt.clientX, y: pt.clientY, offset0: S.headingOffset, pitchOff0: S.pitchOffset };
}
function dragMove(e) {
  if (!drag) return;
  const pt = e.touches ? e.touches[0] : e;
  const dx = pt.clientX - drag.x, dy = pt.clientY - drag.y;
  const vw = window.innerWidth, vh = window.innerHeight;
  const ppdH = vw / S.hFOV;
  const ppdV = vh / (S.hFOV * VFOV_FACTOR);
  S.headingOffset = norm180(drag.offset0 - dx / ppdH);
  S.pitchOffset = drag.pitchOff0 - dy / ppdV;
  if (e.cancelable) e.preventDefault();
}
function dragUp() {
  if (drag) persistOffsets();
  drag = null;
}
function setupDragHandlers() {
  const video = $("pkfCam");
  video.addEventListener("mousedown", dragDown);
  window.addEventListener("mousemove", dragMove);
  window.addEventListener("mouseup", dragUp);
  video.addEventListener("touchstart", dragDown, { passive: true });
  window.addEventListener("touchmove", dragMove, { passive: false });
  window.addEventListener("touchend", dragUp);
}

/* ---------- FOV calibration (two-point) ---------- */
function openCalibStep1() {
  S.calib = { step: 1, peakA: null, tapXFrac: null };
  $("pkfCalibTitle").textContent = "Step 1 — pick the peak under the reticle";
  $("pkfCalibHint").textContent = "Aim the phone so a peak you can identify sits under the centre crosshair, then find it below.";
  renderCalibList();
  $("pkfCalib").classList.add("show");
}
function closeCalib() {
  $("pkfCalib").classList.remove("show");
  $("pkfCalibTapHint").hidden = true;
  const mark = document.getElementById("pkfCalibMarkLine");
  if (mark) mark.remove();
  S.calib.step = 0;
}
function renderCalibList(excludeId) {
  const list = S.peaks
    .slice()
    .sort((a, b) => haversineKm(S.pos, a) - haversineKm(S.pos, b))
    .filter((p) => p.id !== excludeId)
    .slice(0, 30);
  $("pkfCalibList").innerHTML = list.length
    ? list.map((p) => {
        const brg = bearingDeg(S.pos, p), d = haversineKm(S.pos, p);
        return '<button type="button" data-id="' + escapeHTML(p.id) + '">' + escapeHTML(p.name) +
          "<small>" + compassPoint(brg) + " · " + Math.round(brg) + "° · " + (d < 10 ? d.toFixed(1) : Math.round(d)) + " km</small></button>";
      }).join("")
    : '<div style="padding:14px;color:#8b939d;font-size:0.85rem">No peaks loaded — prepare this area first, then calibrate.</div>';
  Array.prototype.slice.call($("pkfCalibList").querySelectorAll("button")).forEach((btn) => {
    btn.addEventListener("click", () => onCalibPick(btn.dataset.id));
  });
}
function onCalibPick(id) {
  const peak = S.peaks.find((p) => p.id === id);
  if (!peak) return;
  if (S.calib.step === 1) {
    if (computeTrueHeading() == null) { toast("No heading reading yet — wait a moment and try again."); return; }
    S.calib.peakA = peak;
    // capture the raw-frame reading NOW, while the reticle is actually on peak A —
    // re-reading S.smoothed later (after two more UI steps) would silently assume
    // the phone never moved, which is exactly the assumption this avoids.
    S.calib.rawAtA = S.headingIsTrue ? S.smoothed : norm360(S.smoothed + declination(S.pos.lat, S.pos.lon));
    $("pkfCalib").classList.remove("show");
    S.calib.step = 2;
    $("pkfCalibTapText").textContent = 'Step 2 — without moving the phone, tap exactly where you see a different known peak (not "' + peak.name + '").';
    $("pkfCalibTapHint").hidden = false;
  } else if (S.calib.step === 3) {
    finishCalibration(peak);
  }
}
function onCalibTap(e) {
  if (S.calib.step !== 2) return;
  if (e.target.closest("#pkfCalibTapCancel")) return;
  const vw = window.innerWidth;
  S.calib.tapXFrac = e.clientX / vw;
  $("pkfCalibTapHint").hidden = true;

  const mark = document.createElement("div");
  mark.className = "pkf-calib-mark";
  mark.id = "pkfCalibMarkLine";
  mark.style.left = e.clientX + "px";
  document.body.appendChild(mark);

  S.calib.step = 3;
  $("pkfCalibTitle").textContent = "Step 2 — which peak did you just tap?";
  $("pkfCalibHint").textContent = "Pick the peak you marked, excluding " + S.calib.peakA.name + ".";
  renderCalibList(S.calib.peakA.id);
  $("pkfCalib").classList.add("show");
}
function finishCalibration(peakB) {
  const mark = document.getElementById("pkfCalibMarkLine");
  if (mark) mark.remove();

  const trueBrgA = bearingDeg(S.pos, S.calib.peakA);
  const trueBrgB = bearingDeg(S.pos, peakB);
  const dBearing = norm180(trueBrgB - trueBrgA);
  const dx = S.calib.tapXFrac - 0.5;

  if (Math.abs(dx) < 0.06) {
    toast("Those two peaks are too close together on screen — pick a wider pair and try again.");
    closeCalib();
    return;
  }
  const newHFOV = dBearing / dx;
  if (!isFinite(newHFOV) || newHFOV < 25 || newHFOV > 100) {
    toast("That calibration doesn't look right — make sure you picked the peaks in the order you aimed/tapped them, then try again.");
    closeCalib();
    return;
  }
  S.hFOV = Math.round(newHFOV * 10) / 10;
  S.headingOffset = norm180(trueBrgA - S.calib.rawAtA);

  persistCalibration();
  closeCalib();
  toast("Calibrated — field of view ≈ " + S.hFOV.toFixed(0) + "°.");
}

/* ---------- misc ---------- */
let toastEl, toastTimer;
function toast(msg) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.style.cssText =
      "position:fixed;left:50%;bottom:180px;transform:translateX(-50%);background:rgba(0,0,0,0.85);" +
      "border:1px solid rgba(255,255,255,0.16);color:#fff;padding:10px 16px;border-radius:10px;" +
      "font-size:12.5px;z-index:70;max-width:80vw;text-align:center;opacity:0;transition:opacity .2s;pointer-events:none";
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.style.opacity = "1";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.style.opacity = "0"; }, 3400);
}
