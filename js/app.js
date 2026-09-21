/* ============================================================
   TrekSense — app.js  (Explore + Saved views)
   ============================================================ */

const state = {
  view: "explore",          // explore | saved
  query: "",
  difficulty: "All",
  region: "All",
  season: "All",
  sort: "featured"
};

const $ = sel => document.querySelector(sel);

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $("#site-header").innerHTML = headerHTML(state.view);
  $("#bottom-nav").innerHTML = bottomNavHTML(state.view);
  updateThemeIcons();

  let searchTimer;
  $("#search-input").addEventListener("input", e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {          // debounce: 120 cards re-render
      state.query = e.target.value.trim().toLowerCase();
      render();
    }, 150);
  });

  $("#filter-toggle").addEventListener("click", () => {
    $("#filter-panel").classList.toggle("show");
    $("#filter-toggle").classList.toggle("open");
  });

  buildFilterChips();
  syncViewFromHash();
  window.addEventListener("hashchange", syncViewFromHash);
});

function syncViewFromHash() {
  state.view = location.hash === "#/saved" ? "saved" : "explore";
  document.querySelectorAll("[data-nav]").forEach(a => {
    a.classList.toggle("active", a.dataset.nav === state.view);
  });
  $("#page-title").textContent = state.view === "saved" ? "Saved Treks" : "Explore Treks";
  $("#page-sub").textContent = state.view === "saved"
    ? "Your shortlist for the next adventure."
    : "Weather, oxygen, difficulty & gear intel for the Indian Himalayas.";
  render();
}

/* ---------- Filters ---------- */
function buildFilterChips() {
  const diffs = ["All", "Easy", "Moderate", "Hard", "Expedition"];
  const regions = ["All", ...[...new Set(TREKS.map(t => t.state))]];
  const seasons = ["All", "Winter", "Spring", "Summer", "Monsoon", "Autumn"];
  const sorts = [
    ["featured", "Featured"], ["price-asc", "Price: low → high"],
    ["price-desc", "Price: high → low"], ["alt-desc", "Highest altitude"],
    ["days-asc", "Shortest first"]
  ];

  $("#chips-difficulty").innerHTML = diffs.map(d =>
    `<button class="chip ${d === state.difficulty ? "active" : ""}" data-diff="${d}">${d}</button>`).join("");
  $("#chips-region").innerHTML = regions.map(r =>
    `<button class="chip ${r === state.region ? "active" : ""}" data-region="${r}">${r}</button>`).join("");
  $("#chips-season").innerHTML = seasons.map(s =>
    `<button class="chip ${s === state.season ? "active" : ""}" data-season="${s}">${s}</button>`).join("");
  $("#chips-sort").innerHTML = sorts.map(([v, l]) =>
    `<button class="chip ${v === state.sort ? "active" : ""}" data-sort="${v}">${l}</button>`).join("");

  $("#filter-panel").addEventListener("click", e => {
    const b = e.target.closest(".chip");
    if (!b) return;
    if (b.dataset.diff) state.difficulty = b.dataset.diff;
    if (b.dataset.region) state.region = b.dataset.region;
    if (b.dataset.season) state.season = b.dataset.season;
    if (b.dataset.sort) state.sort = b.dataset.sort;
    buildFilterChips();
    render();
  }, { once: false });
}

function filteredTreks() {
  let list = [...TREKS];
  if (state.view === "saved") {
    const saved = SavedStore.all();
    list = list.filter(t => saved.has(t.id));
  }
  if (state.query) {
    list = list.filter(t =>
      (t.name + " " + t.region + " " + t.state).toLowerCase().includes(state.query));
  }
  if (state.difficulty !== "All") list = list.filter(t => t.difficulty === state.difficulty);
  if (state.region !== "All") list = list.filter(t => t.state === state.region);
  if (state.season !== "All") list = list.filter(t => t.seasons.includes(state.season));

  const sorters = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "alt-desc": (a, b) => b.altitudeM - a.altitudeM,
    "days-asc": (a, b) => a.days - b.days
  };
  if (sorters[state.sort]) list.sort(sorters[state.sort]);
  return list;
}

/* ---------- Render ---------- */
function render() {
  const list = filteredTreks();
  $("#results-count").innerHTML = `<strong>${list.length}</strong> trek${list.length !== 1 ? "s" : ""} found`;

  if (!list.length) {
    $("#trek-grid").innerHTML = state.view === "saved"
      ? `<div class="empty-state"><div class="big">🔖</div><h3>Nothing saved yet</h3><p>Tap the heart on any trek to build your shortlist.</p></div>`
      : `<div class="empty-state"><div class="big">🏔️</div><h3>No treks match</h3><p>Try clearing a filter or a different search.</p></div>`;
    return;
  }

  $("#trek-grid").innerHTML = list.map(cardHTML).join("");

  document.querySelectorAll(".trek-card").forEach(card => {
    card.addEventListener("click", () => {
      FX.navigate(`trek.html?id=${card.dataset.id}`);
    });
  });
  document.querySelectorAll(".save-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const nowSaved = SavedStore.toggle(btn.dataset.id);
      btn.classList.toggle("saved", nowSaved);
      btn.classList.remove("pop");
      void btn.offsetWidth;            // restart the heartbeat animation
      btn.classList.add("pop");
      if (state.view === "saved" && !nowSaved) render();
    });
  });

  FX.reveal(".trek-card", 60);
  FX.tilt(".trek-card");
}

function cardHTML(t) {
  const saved = SavedStore.has(t.id);
  return `
  <article class="trek-card" data-id="${t.id}" role="link" tabindex="0" aria-label="${t.name} trek details">
    <div class="card-media">
      ${coverMedia(t, t.id)}
      <span class="badge ${badgeClass(t.difficulty)}">${t.difficulty}</span>
      <button class="save-btn ${saved ? "saved" : ""}" data-id="${t.id}" aria-label="Save ${t.name}">${ICONS.heart}</button>
      <div class="card-title-wrap">
        <h3>${t.name}</h3>
        <div class="card-loc">${ICONS.pin}<span>${t.region}, ${t.state}</span></div>
      </div>
    </div>
    <div class="card-stats">
      <div class="stat">${ICONS.mountain}<span>${t.altitudeFt}</span></div>
      <div class="stat">${ICONS.route}<span>${t.distanceKm} km</span></div>
      <div class="stat">${ICONS.clock}<span>${t.days} Days</span></div>
    </div>
    <div class="card-foot">
      <span class="card-season">${t.season}</span>
      <span class="card-price"><small>from</small><span class="rupee">${fmtINR(t.price)}</span></span>
    </div>
  </article>`;
}
