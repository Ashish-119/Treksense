/* ============================================================
   TrekSense — route.js  (Find Your Route journey planner)
   City → gateway hub → basecamp, with modes, times & waypoints.
   ============================================================ */

const $ = sel => document.querySelector(sel);

const haversine = (a, b) => {
  const R = 6371, toR = d => (d * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat), dLon = toR(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const roadKm = (a, b) => Math.round(haversine(a, b) * 1.32);   // road-winding factor
const fmtH = h => {
  if (h < 1) return `${Math.round(h * 60)} min`;
  const whole = Math.floor(h), half = h - whole >= 0.5;
  return `≈ ${whole}${half ? "½" : ""} h`;
};

document.addEventListener("DOMContentLoaded", () => {
  $("#site-header").innerHTML = headerHTML("route");
  $("#bottom-nav").innerHTML = bottomNavHTML("route");
  updateThemeIcons();

  const citySel = $("#rf-city"), trekSel = $("#rf-trek");
  CITIES.forEach(c => citySel.add(new Option(c.name, c.id)));
  [...TREKS].sort((a, b) => a.name.localeCompare(b.name)).forEach(t =>
    trekSel.add(new Option(`${t.name} — ${t.state}`, t.id)));

  /* restore last plan / deep link (?trek=&from=) */
  const q = new URLSearchParams(location.search);
  let savedPlan = {};
  try { savedPlan = JSON.parse(localStorage.getItem("ts-route") || "{}") || {}; } catch {}
  citySel.value = q.get("from") || savedPlan.city || "delhi";
  trekSel.value = q.get("trek") || savedPlan.trek || "kedarkantha";
  if (!TREK_ROUTES[trekSel.value]) trekSel.value = "kedarkantha";

  const rerun = () => {
    localStorage.setItem("ts-route", JSON.stringify({ city: citySel.value, trek: trekSel.value }));
    render(citySel.value, trekSel.value);
  };
  citySel.addEventListener("change", rerun);
  trekSel.addEventListener("change", rerun);
  rerun();
});

function render(cityId, trekId) {
  const city = CITIES.find(c => c.id === cityId);
  const trek = TREKS.find(t => t.id === trekId);
  const route = TREK_ROUTES[trekId];
  if (!city || !trek || !route) return;
  const hub = HUBS[route.hub];

  const toHubKm = roadKm(city, hub);
  const atHub = toHubKm < 50;                          // starting at the gateway itself
  const totalKm = (atHub ? 0 : toHubKm) + route.km;

  /* mode estimates for the city → hub leg */
  const modes = [];
  if (!atHub) {
    modes.push({ icon: ICONS.plane, name: "Flight", hrs: 1.2 + toHubKm / 650, note: `to ${hub.air}, then taxi`, ok: true });
    modes.push({ icon: ICONS.train, name: "Train", hrs: toHubKm / 55, note: `to ${hub.rail}`, ok: toHubKm < 2200 });
    modes.push({ icon: ICONS.bus, name: "Bus / self-drive", hrs: toHubKm / 50, note: "overnight Volvo on most routes", ok: toHubKm < 1200 });
  }
  const recommended = atHub ? null
    : toHubKm >= 700 ? modes[0]
    : toHubKm >= 250 ? modes[1]
    : modes[2];

  const totalHrs = (recommended ? recommended.hrs : 0) + route.hrs + (recommended ? 1 : 0);

  /* ---- stat tiles ---- */
  $("#rf-stats").innerHTML = `
    <div class="ps-stat"><b>${totalKm.toLocaleString("en-IN")} km</b><span>${city.name} → ${trek.coords.label}</span></div>
    <div class="ps-stat"><b>${fmtH(totalHrs)}</b><span>door to basecamp (${recommended ? recommended.name.toLowerCase() : "by road"})</span></div>
    <div class="ps-stat"><b>${route.km} km</b><span>mountain road from ${hub.name}</span></div>
    <div class="ps-stat"><b>${trek.altitudeFt}</b><span>${trek.name} high point</span></div>`;

  /* ---- recommended legs ---- */
  const legs = [];
  if (recommended) {
    legs.push(`<i class="ic ic-brand">${recommended.icon}</i> <b>${city.name} → ${hub.name}</b> · ${recommended.name}, ${fmtH(recommended.hrs)} <small>(${recommended.note})</small>`);
  } else {
    legs.push(`<i class="ic ic-brand">${ICONS.city}</i> <b>You're already at the gateway</b> — ${hub.name} is the roadhead hub for this trek.`);
  }
  legs.push(`<i class="ic ic-brand">${ICONS.car}</i> <b>${hub.name} → ${trek.coords.label}</b> · ${route.km} km mountain road, ${fmtH(route.hrs)} <small>(shared taxis leave early morning)</small>`);
  legs.push(`<i class="ic ic-brand">${ICONS.boot}</i> <b>${trek.coords.label} → ${trek.name}</b> · ${trek.distanceKm} km on foot over ${trek.days} days`);
  $("#rf-legs").innerHTML = legs.map(l => `<div class="rf-leg">${l}</div>`).join("");

  $("#rf-tip").innerHTML = route.hrs >= 6
    ? `<i class="ic ic-brand">${ICONS.bulb}</i> <b>Plan tip:</b> reach ${hub.name} the evening before — basecamp drives this long start at 6 AM sharp.`
    : `<i class="ic ic-brand">${ICONS.bulb}</i> <b>Plan tip:</b> ${hub.name} to the trailhead is a short hop — a same-day start is comfortable.`;

  /* ---- modes table ---- */
  $("#rf-hub-name").textContent = hub.name;
  $("#rf-mode-rows").innerHTML = atHub
    ? `<div class="rf-leg">You're starting in ${hub.name} itself — head straight for the trailhead road.</div>`
    : modes.filter(m => m.ok).map(m => `
      <div class="rf-mode ${recommended === m ? "best" : ""}">
        <span class="rm-icon ic-brand">${m.icon}</span>
        <div class="rm-info"><b>${m.name}</b><small>${m.note}</small></div>
        <span class="rm-time">${fmtH(m.hrs)}</span>
        ${recommended === m ? '<span class="rm-badge">Recommended</span>' : ""}
      </div>`).join("");

  /* ---- waypoints ---- */
  const via = [...(atHub ? [] : hub.approachVia), hub.name, ...route.via, trek.coords.label];
  $("#rf-via-chips").innerHTML = via.map(v => `<span class="peak"><i class="ic">${ICONS.pin}</i>${v}</span>`).join("");

  /* ---- map: terrain view of the destination + one-tap live directions ---- */
  const { lat, lon, label } = trek.coords;
  $("#rf-iframe").src =
    `https://maps.google.com/maps?q=${lat},${lon}(${encodeURIComponent(label)})&t=p&z=8&output=embed`;
  $("#rf-map-actions").innerHTML = `
    <a class="map-btn map-btn-primary" target="_blank" rel="noopener noreferrer"
       href="https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(city.name + ", India")}&destination=${lat},${lon}&travelmode=driving">
       <i class="ic ic-light">${ICONS.nav}</i> See the full driving route: ${city.name} → ${label}</a>
    <a class="map-btn" href="trek.html?id=${trek.id}"><i class="ic">${ICONS.mountain}</i> View ${trek.name} details</a>`;

  $("#rf-results").classList.remove("hide");
}
