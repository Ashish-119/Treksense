/* ============================================================
   TrekSense — shared.js
   Theme, saved-store, icons, SVG scene art, helpers.
   ============================================================ */

/* ---------- Theme ---------- */
(function initTheme() {
  const urlTheme = new URLSearchParams(location.search).get("theme"); // shareable override
  const saved = localStorage.getItem("ts-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme =
    (urlTheme === "light" || urlTheme === "dark") ? urlTheme : saved || (prefersDark ? "dark" : "light");
})();

function toggleTheme() {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("ts-theme", root.dataset.theme);
  updateThemeIcons();
}

function updateThemeIcons() {
  const dark = document.documentElement.dataset.theme === "dark";
  document.querySelectorAll("[data-theme-icon]").forEach(el => {
    el.innerHTML = dark ? ICONS.sun : ICONS.moon;
  });
}

/* ---------- Saved treks (localStorage) ---------- */
const SavedStore = {
  key: "ts-saved",
  all() {
    try { return new Set(JSON.parse(localStorage.getItem(this.key) || "[]")); }
    catch { return new Set(); }
  },
  has(id) { return this.all().has(id); },
  toggle(id) {
    const s = this.all();
    s.has(id) ? s.delete(id) : s.add(id);
    localStorage.setItem(this.key, JSON.stringify([...s]));
    return s.has(id);
  }
};

/* ---------- Icons (inline SVG, stroke-based) ---------- */
const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 8h10M18 8h2M4 16h2M10 16h10"/><circle cx="16" cy="8" r="2.2"/><circle cx="8" cy="16" r="2.2"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20.5 4.7 13a4.8 4.8 0 0 1 0-6.8 4.7 4.7 0 0 1 6.7 0l.6.6.6-.6a4.7 4.7 0 0 1 6.7 0 4.8 4.8 0 0 1 0 6.8Z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  mountain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m3 19 6-11 4 7 3-5 5 9H3Z"/></svg>',
  route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19c4 0 3-6 7-6s3 6 7 6M4 19v-2M20 5l-4 4M20 5h-4M20 5v4"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5Z"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 4h12v17l-6-4.5L6 21Z"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.4l6.1-.8Z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="5.5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8.5 3.5v3M15.5 3.5v3"/></svg>',
  rupee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10M7 8.5h10M7 4c5 0 6.5 1.8 6.5 4.5S12 13 7 13l7 7"/></svg>',
  gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 18a8.5 8.5 0 1 1 14 0"/><path d="m12 14 3.5-4.5"/><circle cx="12" cy="14.5" r="1.6" fill="currentColor"/></svg>'
};

/* ---------- Scene palettes & SVG generator ---------- */
const SCENES = {
  sunset: { sky: ["#f6c98e", "#e2917a", "#8d6b8f"], sun: "#ffe9c4", far: "#a98099", mid: "#6d5577", near: "#413049", snow: "#fdf3ec", stars: false, trees: false, lake: false },
  valley: { sky: ["#bfe0f2", "#8fc0e4", "#6ba3d4"], sun: "#ffffff", far: "#93aec9", mid: "#5f7fa5", near: "#33475e", snow: "#f4f9ff", stars: false, trees: true, lake: false },
  green:  { sky: ["#cfe8d8", "#9fcdb4", "#77b394"], sun: "#fff8dd", far: "#7fa98f", mid: "#537c65", near: "#2f4f3e", snow: "#f2faf4", stars: false, trees: true, lake: false },
  floral: { sky: ["#e8d5ee", "#c6a9d9", "#9d84bd"], sun: "#fff3e0", far: "#a58bbf", mid: "#7a639b", near: "#4c3d68", snow: "#faf3fb", stars: false, trees: false, lake: false, flowers: true },
  winter: { sky: ["#dce9f5", "#b6cee7", "#93b3d6"], sun: "#fffdf5", far: "#9fb6d2", mid: "#7590b5", near: "#4a6285", snow: "#ffffff", stars: false, trees: true, lake: false },
  lakes:  { sky: ["#c5e5e2", "#8ecac9", "#5da8ad"], sun: "#fffce3", far: "#7aa8ad", mid: "#4e7f87", near: "#2d4f57", snow: "#f0fbf9", stars: false, trees: false, lake: true },
  alpine: { sky: ["#1e2a4a", "#3c4a72", "#6d6a95"], sun: "#f4e9c8", far: "#575d86", mid: "#3d4166", near: "#23253f", snow: "#e8e6f4", stars: true, trees: false, lake: false },
  forest: { sky: ["#f3e3c5", "#dab98a", "#a98a63"], sun: "#fff4d6", far: "#a08a6a", mid: "#6c5d45", near: "#3a3428", snow: "#faf4e6", stars: false, trees: true, lake: false },
  meadow: { sky: ["#dff0d8", "#b8dcae", "#8fc48b"], sun: "#fff9d9", far: "#8fb391", mid: "#5f8a67", near: "#35543f", snow: "#f4fbef", stars: false, trees: true, lake: false, flowers: true },
  glacier:{ sky: ["#dfeaf5", "#b3cce4", "#8fb0d4"], sun: "#ffffff", far: "#a8bfd8", mid: "#7c99bd", near: "#51688a", snow: "#ffffff", stars: false, trees: false, lake: false }
};

/* ---------- Palette transforms for gallery variants ---------- */
function hexMix(a, b, t) {
  const pa = a.match(/\w\w/g).map(x => parseInt(x, 16));
  const pb = b.match(/\w\w/g).map(x => parseInt(x, 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

const SCENE_MODS = {
  base:   p => p,
  dawn:   p => ({ ...p, sky: [hexMix(p.sky[0], "#ffb36b", 0.45), hexMix(p.sky[1], "#f08a5d", 0.4), hexMix(p.sky[2], "#b83b5e", 0.3)], sun: "#ffd9a0" }),
  day:    p => ({ ...p, sky: p.sky.map(c => hexMix(c, "#ffffff", 0.28)), sun: "#fffbe8" }),
  dusk:   p => ({ ...p, sky: [hexMix(p.sky[0], "#f38181", 0.4), hexMix(p.sky[1], "#aa4465", 0.45), hexMix(p.sky[2], "#3a1c4a", 0.5)], sun: "#ffc48c", far: hexMix(p.far, "#3a1c4a", 0.25), mid: hexMix(p.mid, "#2a1436", 0.3) }),
  night:  p => ({ ...p, sky: p.sky.map(c => hexMix(c, "#0b1026", 0.72)), sun: "#e8e4d8", far: hexMix(p.far, "#0b1026", 0.5), mid: hexMix(p.mid, "#0b1026", 0.5), near: hexMix(p.near, "#05060f", 0.5), stars: true }),
  winter: p => ({ ...p, sky: p.sky.map(c => hexMix(c, "#e8f0f8", 0.45)), far: hexMix(p.far, "#ffffff", 0.45), mid: hexMix(p.mid, "#ffffff", 0.35), near: hexMix(p.near, "#dfe8f2", 0.25), snow: "#ffffff" }),
  monsoon:p => ({ ...p, sky: p.sky.map(c => hexMix(c, "#8fa39b", 0.5)), sun: "#e9ede8", far: hexMix(p.far, "#5f7268", 0.3), mid: hexMix(p.mid, "#44554c", 0.3), near: hexMix(p.near, "#2f3c35", 0.25) }),
  autumn: p => ({ ...p, sky: p.sky.map(c => hexMix(c, "#f2c078", 0.35)), sun: "#ffe1b0", far: hexMix(p.far, "#b07d4a", 0.28), mid: hexMix(p.mid, "#8a5a30", 0.25), near: hexMix(p.near, "#4f3a22", 0.25) })
};

/* Gallery: generated seasonal views of a trek with contextual captions */
function galleryFor(trek) {
  const cp = trek.checkpoints;
  const top = cp[cp.length - 1].name;
  const base = cp[0].name;
  const mid = cp[Math.max(cp.length - 2, 0)].name;
  const peak = (cp[cp.length - 1].peaks && cp[cp.length - 1].peaks[0]) || "the high peaks";
  return [
    { mod: "dawn",    cap: `First light on ${peak} — spring` },
    { mod: "day",     cap: `Summer midday on the trail to ${top}` },
    { mod: "monsoon", cap: `Monsoon mists over ${mid}` },
    { mod: "autumn",  cap: `Autumn gold above ${base}` },
    { mod: "winter",  cap: `Deep winter snow near ${mid}` },
    { mod: "dusk",    cap: `Alpenglow from ${top}` },
    { mod: "night",   cap: `Night sky over ${base}` }
  ];
}

/**
 * Layered SVG mountain scene used as card / hero art.
 * Pure vector — no external images, crisp at any size.
 */
function sceneSVG(kind, uid, mod) {
  let p = SCENES[kind] || SCENES.valley;
  if (mod && SCENE_MODS[mod]) p = SCENE_MODS[mod](p);
  const id = `g${uid || kind}${Math.floor(Math.random() * 1e5)}`;
  const stars = p.stars
    ? Array.from({ length: 26 }, () =>
        `<circle cx="${(Math.random() * 800).toFixed(0)}" cy="${(Math.random() * 210).toFixed(0)}" r="${(Math.random() * 1.3 + 0.4).toFixed(1)}" fill="#fff" opacity="${(Math.random() * 0.6 + 0.3).toFixed(2)}"/>`).join("")
    : "";
  const trees = p.trees
    ? Array.from({ length: 14 }, (_, i) => {
        const x = 20 + i * 58 + (i % 3) * 12, h = 34 + (i % 4) * 9, y = 470;
        return `<path d="M${x} ${y} l${h * 0.38} -${h} l${h * 0.38} ${h} Z" fill="${p.near}" opacity="0.9"/>`;
      }).join("")
    : "";
  const lake = p.lake
    ? `<ellipse cx="400" cy="470" rx="330" ry="42" fill="${p.sky[1]}" opacity="0.85"/>
       <ellipse cx="400" cy="470" rx="240" ry="28" fill="${p.snow}" opacity="0.25"/>`
    : "";
  const flowers = p.flowers
    ? Array.from({ length: 30 }, () => {
        const x = Math.random() * 800, y = 440 + Math.random() * 55;
        const c = ["#e56399", "#f0a04b", "#fff", "#c26bd4"][Math.floor(Math.random() * 4)];
        return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(Math.random() * 2.4 + 1.2).toFixed(1)}" fill="${c}" opacity="0.85"/>`;
      }).join("")
    : "";

  return `
  <svg class="scene" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrated mountain scene">
    <defs>
      <linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.sky[0]}"/><stop offset="0.55" stop-color="${p.sky[1]}"/><stop offset="1" stop-color="${p.sky[2]}"/>
      </linearGradient>
      <linearGradient id="${id}glow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.sun}" stop-opacity="0.9"/><stop offset="1" stop-color="${p.sun}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#${id}sky)"/>
    ${stars}
    <circle cx="590" cy="130" r="46" fill="${p.sun}" opacity="0.95"/>
    <circle cx="590" cy="130" r="86" fill="url(#${id}glow)" opacity="0.5"/>
    <ellipse cx="180" cy="120" rx="90" ry="18" fill="#ffffff" opacity="0.35"/>
    <ellipse cx="260" cy="150" rx="60" ry="12" fill="#ffffff" opacity="0.25"/>
    <ellipse cx="640" cy="220" rx="80" ry="14" fill="#ffffff" opacity="0.22"/>
    <!-- far range -->
    <path d="M0 320 L90 230 L170 300 L260 195 L340 290 L430 210 L520 300 L610 230 L700 295 L800 225 L800 500 L0 500 Z" fill="${p.far}"/>
    <path d="M245 215 L260 195 L278 218 L263 224 Z" fill="${p.snow}" opacity="0.9"/>
    <path d="M415 228 L430 210 L448 232 L430 240 Z" fill="${p.snow}" opacity="0.9"/>
    <path d="M785 240 L800 225 L800 248 Z" fill="${p.snow}" opacity="0.85"/>
    <!-- mid range -->
    <path d="M0 400 L120 280 L230 380 L330 260 L450 385 L560 285 L690 390 L800 300 L800 500 L0 500 Z" fill="${p.mid}"/>
    <path d="M100 300 L120 280 L145 305 L122 315 Z" fill="${p.snow}"/>
    <path d="M305 290 L330 260 L358 295 L332 306 Z" fill="${p.snow}"/>
    <path d="M537 310 L560 285 L586 313 L562 322 Z" fill="${p.snow}"/>
    <!-- near ridge -->
    <path d="M0 500 L0 430 L160 360 L320 450 L470 370 L640 460 L800 395 L800 500 Z" fill="${p.near}"/>
    ${lake}
    ${trees}
    ${flowers}
  </svg>`;
}

/* ---------- Photos (js/images.js manifest) ---------- */
function trekPhotos(id) {
  return (typeof TREK_IMAGES !== "undefined" && TREK_IMAGES[id]) || [];
}

/* Cover art: real photo layered over the SVG scene.
   If the photo is missing/unloadable, onerror removes it → SVG shows. */
function coverMedia(trek, uid) {
  const photos = trekPhotos(trek.id);
  const img = photos.length
    ? `<img class="cover" src="${photos[0].src}" alt="${trek.name}" loading="lazy" onerror="this.remove()">`
    : "";
  return sceneSVG(trek.scene, uid) + img;
}

/* ---------- Small helpers ---------- */
const fmtINR = n => "₹" + n.toLocaleString("en-IN");

function badgeClass(diff) {
  const d = diff.toLowerCase();
  return d.includes("expedition") ? "expedition"
       : d.includes("easy") ? "easy"
       : d.includes("hard") ? "hard" : "moderate";
}

/* Weather-code → icon/label (Open-Meteo WMO codes) */
function wmo(code) {
  const map = [
    [[0], ["☀️", "Clear sky"]], [[1], ["🌤️", "Mainly clear"]], [[2], ["⛅", "Partly cloudy"]],
    [[3], ["☁️", "Overcast"]], [[45, 48], ["🌫️", "Fog"]],
    [[51, 53, 55, 56, 57], ["🌦️", "Drizzle"]], [[61, 63, 65, 66, 67], ["🌧️", "Rain"]],
    [[71, 73, 75, 77], ["🌨️", "Snowfall"]], [[80, 81, 82], ["🌦️", "Showers"]],
    [[85, 86], ["❄️", "Snow showers"]], [[95, 96, 99], ["⛈️", "Thunderstorm"]]
  ];
  for (const [codes, out] of map) if (codes.includes(code)) return out;
  return ["🌥️", "Cloudy"];
}

/* Header + bottom nav templates (shared across pages) */
function headerHTML(active) {
  return `
  <div class="container header-inner">
    <a class="logo" href="index.html">
      <span class="logo-badge">${ICONS.mountain}</span>
      <span>Trek<em>Sense</em></span>
    </a>
    <nav class="top-nav">
      <a href="index.html#/explore" data-nav="explore" class="${active === "explore" ? "active" : ""}">Explore</a>
      <a href="index.html#/saved" data-nav="saved" class="${active === "saved" ? "active" : ""}">Saved</a>
      <a href="route.html" data-nav="route" class="${active === "route" ? "active" : ""}">Find Your Route</a>
      <a href="plan.html" data-nav="plan" class="${active === "plan" ? "active" : ""}">Trek With Us</a>
    </nav>
    <div class="header-actions">
      <button class="icon-btn" data-theme-icon onclick="toggleTheme()" aria-label="Toggle dark mode"></button>
    </div>
  </div>`;
}

function bottomNavHTML(active) {
  return `
    <a href="index.html#/explore" data-nav="explore" class="${active === "explore" ? "active" : ""}">${ICONS.compass}<span>Explore</span></a>
    <a href="route.html" data-nav="route" class="${active === "route" ? "active" : ""}">${ICONS.pin}<span>Route</span></a>
    <a href="plan.html" data-nav="plan" class="${active === "plan" ? "active" : ""}">${ICONS.route}<span>With Us</span></a>
    <a href="index.html#/saved" data-nav="saved" class="${active === "saved" ? "active" : ""}">${ICONS.bookmark}<span>Saved</span></a>`;
}
