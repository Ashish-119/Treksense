/* ============================================================
   TrekSense — trek.js  (detail page)
   ============================================================ */

const $ = sel => document.querySelector(sel);

const trekId = new URLSearchParams(location.search).get("id");
const trek = TREKS.find(t => t.id === trekId) || TREKS[0];

document.addEventListener("DOMContentLoaded", () => {
  $("#site-header").innerHTML = headerHTML("explore");
  $("#bottom-nav").innerHTML = bottomNavHTML("explore");
  updateThemeIcons();

  document.title = `${trek.name} — TrekSense`;

  renderHero();
  renderStats();
  renderOverview();
  renderGallery();
  renderRoute();
  renderWeatherStatic();   // instant paint
  fetchLiveWeather();      // then upgrade to live data
  renderSegments();
  renderOxygen();
  renderCheckpoints();
  renderPeaksVisible();
  renderGear();
  renderWildlife();
  renderPricing();
  renderFitness();
  renderSafety();
  initScrollSpy();

  /* motion layer */
  FX.parallax("#hero");
  FX.countUp(".s-value");
  FX.reveal("section.block .panel, .weather-now, .forecast, .g-item, .wild-card, .price-row, .safety-item", 50);
  FX.tilt(".wild-card", 9);
});

/* ---------- Hero & stats ---------- */
function renderHero() {
  $("#hero").insertAdjacentHTML("afterbegin", coverMedia(trek, "hero"));
  $("#hero-title").innerHTML = `
    <span class="badge ${badgeClass(trek.difficulty)}">${trek.difficulty}</span>
    <h1>${trek.name}</h1>
    <div class="card-loc">${ICONS.pin}<span>${trek.region}, ${trek.state}</span></div>`;

  const saveBtn = $("#hero-save");
  const paint = () => {
    saveBtn.classList.toggle("saved", SavedStore.has(trek.id));
    saveBtn.innerHTML = ICONS.heart;
  };
  paint();
  saveBtn.addEventListener("click", () => {
    SavedStore.toggle(trek.id);
    paint();
    saveBtn.classList.remove("pop");
    void saveBtn.offsetWidth;
    saveBtn.classList.add("pop");
  });
}

/* ---------- Gallery + lightbox ---------- */
let lbIndex = 0, lbItems = [];

function renderGallery() {
  /* real photographs first; seasonal illustrations top the strip up to 10+ */
  lbItems = trekPhotos(trek.id).map(p => ({ type: "photo", src: p.src, cap: p.credit }));
  if (lbItems.length < 10) {
    const pad = galleryFor(trek).slice(0, 10 - lbItems.length)
      .map(g => ({ type: "svg", mod: g.mod, cap: g.cap + " (illustration)" }));
    lbItems = lbItems.concat(pad);
  }

  const frame = (g, i) =>
    g.type === "photo"
      ? `${sceneSVG(trek.scene, "gal" + i)}<img class="cover" src="${g.src}" alt="${trek.name} photo ${i + 1}" loading="lazy" onerror="this.remove()">`
      : sceneSVG(trek.scene, "gal" + i, g.mod);

  $("#gallery-strip").innerHTML = lbItems.map((g, i) => `
    <figure class="g-item" data-i="${i}" role="button" tabindex="0" aria-label="View image ${i + 1}">
      ${frame(g, i)}
      <figcaption>${g.cap}</figcaption>
    </figure>`).join("");

  document.body.insertAdjacentHTML("beforeend", `
    <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer">
      <button class="lb-btn lb-close" aria-label="Close">✕</button>
      <button class="lb-btn lb-prev" aria-label="Previous">‹</button>
      <button class="lb-btn lb-next" aria-label="Next">›</button>
      <div>
        <div class="lb-stage" id="lb-stage"></div>
        <div class="lb-cap" id="lb-cap"></div>
      </div>
    </div>`);

  const lb = $("#lightbox");
  const show = i => {
    lbIndex = (i + lbItems.length) % lbItems.length;
    const g = lbItems[lbIndex];
    $("#lb-stage").innerHTML = g.type === "photo"
      ? `<img src="${g.src}" alt="${trek.name}">`
      : sceneSVG(trek.scene, "lb", g.mod);
    $("#lb-cap").textContent = `${trek.name} — ${g.cap}`;
  };

  $("#gallery-strip").addEventListener("click", e => {
    const fig = e.target.closest(".g-item");
    if (!fig) return;
    show(+fig.dataset.i);
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  });

  const close = () => { lb.classList.remove("open"); document.body.style.overflow = ""; };
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", () => show(lbIndex - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => show(lbIndex + 1));
  lb.addEventListener("click", e => { if (e.target === lb) close(); });
  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(lbIndex - 1);
    if (e.key === "ArrowRight") show(lbIndex + 1);
  });
}

function renderStats() {
  $("#stats-card").innerHTML = `
    <div class="s-item"><div class="s-label">${ICONS.mountain} Altitude</div><div class="s-value">${trek.altitudeFt}</div></div>
    <div class="s-item"><div class="s-label">${ICONS.route} Distance</div><div class="s-value">${trek.distanceKm} km</div></div>
    <div class="s-item"><div class="s-label">${ICONS.clock} Duration</div><div class="s-value">${trek.days} Days</div></div>
    <div class="s-item"><div class="s-label">${ICONS.calendar} Season</div><div class="s-value" style="font-size:0.92rem">${trek.season}</div></div>
    <div class="s-item"><div class="s-label">${ICONS.star} Rating</div><div class="s-value">${trek.rating} <small>(${trek.reviews.toLocaleString("en-IN")})</small></div></div>
    <div class="s-item"><div class="s-label">${ICONS.rupee} From</div><div class="s-value">${fmtINR(Math.min(...trek.companies.map(c => c.price)))}</div></div>`;
}

/* ---------- Overview ---------- */
function renderOverview() {
  $("#about-text").innerHTML = trek.description;
  $("#highlight-row").innerHTML = trek.highlights.map(h => `<span class="tag">${h}</span>`).join("");
}

/* ---------- Route Map: elevation profile + map embed + Earth links ---------- */
function renderRoute() {
  const cps = trek.checkpoints;
  const alts = cps.map(c => parseInt(c.altFt.replace(/[^\d]/g, ""), 10));
  const lo = Math.min(...alts), hi = Math.max(...alts);
  const W = 760, H = 260, padL = 14, padR = 14, padT = 30, padB = 56;
  const x = i => padL + (i * (W - padL - padR)) / Math.max(cps.length - 1, 1);
  const y = a => padT + (1 - (a - lo) / Math.max(hi - lo, 1)) * (H - padT - padB);

  const pts = alts.map((a, i) => [x(i), y(a)]);
  const line = pts.map(p => p.join(",")).join(" ");
  const area = `${padL},${H - padB} ${line} ${W - padR},${H - padB}`;

  $("#elev-chart").innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" class="elev-svg" role="img" aria-label="Elevation profile from ${cps[0].name} to ${cps[cps.length - 1].name}">
    <defs>
      <linearGradient id="elevFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--viz-bar)" stop-opacity="0.35"/>
        <stop offset="1" stop-color="var(--viz-bar)" stop-opacity="0.03"/>
      </linearGradient>
    </defs>
    <polyline points="${area}" fill="url(#elevFill)" stroke="none"/>
    <polyline points="${line}" fill="none" stroke="var(--viz-bar)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.map(([px, py], i) => `
      <circle cx="${px}" cy="${py}" r="4.5" fill="var(--viz-bar)" stroke="var(--card)" stroke-width="2"/>
      <text x="${px}" y="${py - 12}" text-anchor="${i === 0 ? "start" : i === cps.length - 1 ? "end" : "middle"}" class="elev-alt">${cps[i].altFt}</text>
      <text x="${px}" y="${H - padB + 18}" text-anchor="${i === 0 ? "start" : i === cps.length - 1 ? "end" : "middle"}" class="elev-name">
        ${cps[i].name.length > 14 ? cps[i].name.slice(0, 13) + "…" : cps[i].name}
      </text>`).join("")}
    <text x="${padL}" y="${H - 8}" class="elev-meta">${trek.distanceKm} km round · ${trek.days} days · high point ${cps[alts.indexOf(hi)].name}</text>
  </svg>`;

  const { lat, lon, label } = trek.coords;
  $("#route-iframe").src =
    `https://maps.google.com/maps?q=${lat},${lon}(${encodeURIComponent(label)})&t=p&z=12&output=embed`;
  $("#map-actions").innerHTML = `
    <a class="map-btn" target="_blank" rel="noopener"
       href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trek.name + " trek " + label)}">
       📍 Open in Google Maps</a>
    <a class="map-btn" target="_blank" rel="noopener"
       href="https://earth.google.com/web/@${lat},${lon},3500a,65000d,35y,0h,60t,0r">
       🌍 Fly the terrain in Google Earth</a>
    <a class="map-btn" href="route.html?trek=${trek.id}">
       🧭 Find your route from home</a>`;
}

/* ---------- Weather ---------- */
function weatherNowHTML(w, live) {
  return `
    <div class="w-loc">${ICONS.pin} ${trek.coords.label}</div>
    <div class="w-icon">${w.icon}</div>
    <div class="w-temp">${w.temp}°C</div>
    <div class="w-cond">${w.cond}</div>
    <div class="w-meta">
      <div><span>Feels like</span><b>${w.feels}°C</b></div>
      <div><span>Wind</span><b>${w.wind} km/h</b></div>
      <div><span>Humidity</span><b>${w.humidity}%</b></div>
    </div>
    ${live
      ? '<div class="w-live"><span class="dot"></span> LIVE · Open-Meteo</div>'
      : '<div class="w-live" style="background:rgba(255,255,255,0.1)">Typical conditions (offline)</div>'}`;
}

function forecastHTML(days) {
  return days.map(d => `
    <div class="f-day">
      <div class="d">${d.d}</div>
      <div class="i">${d.i}</div>
      <div class="hi">${d.hi}°</div>
      <div class="lo">${d.lo}°</div>
    </div>`).join("");
}

function renderWeatherStatic() {
  $("#weather-sub").textContent = `Conditions near ${trek.coords.label}.`;
  $("#weather-now").innerHTML = weatherNowHTML(trek.staticWeather, false);
  $("#forecast").innerHTML = forecastHTML(trek.staticWeather.daily);
}

async function fetchLiveWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${trek.coords.lat}&longitude=${trek.coords.lon}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=5&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("weather fetch failed");
    const j = await res.json();

    const [icon, cond] = wmo(j.current.weather_code);
    const now = {
      temp: Math.round(j.current.temperature_2m),
      feels: Math.round(j.current.apparent_temperature),
      wind: Math.round(j.current.wind_speed_10m),
      humidity: Math.round(j.current.relative_humidity_2m),
      cond, icon
    };
    const days = j.daily.time.map((t, i) => ({
      d: new Date(t).toLocaleDateString("en-IN", { weekday: "short" }),
      hi: Math.round(j.daily.temperature_2m_max[i]),
      lo: Math.round(j.daily.temperature_2m_min[i]),
      i: wmo(j.daily.weather_code[i])[0]
    }));

    $("#weather-now").innerHTML = weatherNowHTML(now, true);
    $("#forecast").innerHTML = forecastHTML(days);
    $("#weather-sub").textContent = `Live conditions near ${trek.coords.label} — updates every visit.`;
  } catch {
    /* offline / blocked: static fallback already rendered */
  }
}

/* ---------- Difficulty segments ---------- */
function renderSegments() {
  $("#seg-list").innerHTML = trek.segments.map(s => `
    <div class="seg">
      <span class="seg-dot ${s.grade}"></span>
      <div style="flex:1">
        <h4>${s.from} → ${s.to} <span>· ${s.km} km</span></h4>
        <p>${s.note}</p>
      </div>
      <span class="grade-tag ${s.grade}">${s.grade}</span>
    </div>`).join("");

  $("#crux").innerHTML = `
    <div class="c-icon">⚠️</div>
    <div>
      <h4>The crux: ${trek.crux.name}</h4>
      <p>${trek.crux.why}</p>
    </div>`;
}

/* ---------- Oxygen chart ---------- */
function renderOxygen() {
  $("#o2-rows").innerHTML = trek.checkpoints.map(c => `
    <div class="o2-row">
      <div class="o2-name">${c.name}<small>${c.altFt}</small></div>
      <div class="o2-track">
        <div class="o2-bar" data-w="${c.o2}">
          <span class="o2-tip">${c.name} · ${c.altFt} · ~${c.o2}% of sea-level O₂</span>
          <span class="o2-val">${c.o2}%${c.o2 < 62 ? '<span class="warn">⚠️ thin air</span>' : ""}</span>
        </div>
      </div>
    </div>`).join("");

  /* animate bars when scrolled into view */
  const bars = document.querySelectorAll(".o2-bar");
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.w + "%";
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  bars.forEach(b => io.observe(b));
}

/* ---------- Checkpoints & peaks ---------- */
function renderCheckpoints() {
  $("#timeline").innerHTML = trek.checkpoints.map(c => `
    <div class="tl-item">
      <h4>${c.name} <span class="alt">${c.altFt}</span></h4>
      <p class="note">${c.note}</p>
      <div class="peak-row">
        ${c.peaks.map(p => `<span class="peak">🏔️ ${p}</span>`).join("")}
      </div>
    </div>`).join("");
}

/* ---------- Gear checklist (persisted per trek) ---------- */
function gearKey() { return `ts-gear-${trek.id}`; }
function gearState() {
  try { return new Set(JSON.parse(localStorage.getItem(gearKey()) || "[]")); }
  catch { return new Set(); }
}

function renderGear() {
  const groups = JSON.parse(JSON.stringify(BASE_GEAR));
  groups["Trek-Specific"] = trek.extraGear;
  const done = gearState();
  const catIcons = { "Clothing": "🧥", "Footwear": "🥾", "Gear": "🎒", "Health & Safety": "⛑️", "Trek-Specific": "✨" };

  $("#gear-grid").innerHTML = Object.entries(groups).map(([cat, items]) => `
    <div class="gear-cat">
      <h4>${catIcons[cat] || "•"} ${cat}</h4>
      ${items.map(item => {
        const id = `${cat}::${item}`;
        return `
        <div class="gear-item ${done.has(id) ? "done" : ""}" data-gid="${id.replace(/"/g, "&quot;")}" role="checkbox" aria-checked="${done.has(id)}" tabindex="0">
          <span class="box">${ICONS.check}</span>
          <span class="lbl">${item}</span>
        </div>`;
      }).join("")}
    </div>`).join("");

  const total = document.querySelectorAll(".gear-item").length;
  const updateProgress = () => {
    const n = gearState().size;
    $("#gp-count").textContent = `${n} / ${total} packed`;
    $("#gp-fill").style.width = (total ? (n / total) * 100 : 0) + "%";
  };
  updateProgress();

  $("#gear-grid").addEventListener("click", e => {
    const item = e.target.closest(".gear-item");
    if (!item) return;
    const s = gearState();
    const id = item.dataset.gid;
    s.has(id) ? s.delete(id) : s.add(id);
    localStorage.setItem(gearKey(), JSON.stringify([...s]));
    item.classList.toggle("done", s.has(id));
    item.setAttribute("aria-checked", s.has(id));
    updateProgress();
  });
}

/* ---------- Wildlife ---------- */
function renderWildlife() {
  const rarityLabel = { common: "Often seen", occasional: "Sometimes", rare: "Rare sighting" };
  $("#wild-grid").innerHTML = trek.wildlife.map(w => `
    <div class="wild-card">
      <div class="w-emoji">${w.emoji}</div>
      <h4>${w.name}</h4>
      <p>${w.zone}</p>
      <span class="rare ${w.rarity}">${rarityLabel[w.rarity]}</span>
    </div>`).join("");
}

/* ---------- Peaks Visible (photo cards from the shared peak library) ---------- */
function renderPeaksVisible() {
  const lib = typeof PEAK_LIB !== "undefined" ? PEAK_LIB : {};
  const found = [], seen = new Set();
  trek.checkpoints.flatMap(c => c.peaks || []).forEach(pstr => {
    const padded = " " + pstr.toLowerCase() + " ";
    for (const [slug, pk] of Object.entries(lib)) {
      if (seen.has(slug)) continue;
      if (pk.aliases.some(a => padded.includes(" " + a + " ") || padded.includes(" " + a + ","))) {
        seen.add(slug);
        found.push(pk);
        break;                                   // one library match per listed peak
      }
    }
  });

  const section = document.querySelector("#peaks");
  if (!found.length) {                           // nothing in the library for this trail
    section.classList.add("hide");
    document.querySelector('.section-nav a[href="#peaks"]').classList.add("hide");
    return;
  }
  $("#peaks-grid").innerHTML = found.slice(0, 6).map(pk => `
    <figure class="peak-card">
      <div class="pk-media">
        <img src="${pk.src}" alt="${pk.name}" loading="lazy" onerror="this.closest('.peak-card').remove()">
      </div>
      <figcaption>
        <h4>${pk.name}</h4>
        <p>${pk.ft} · ${pk.credit.split("·")[0].trim()}</p>
      </figcaption>
    </figure>`).join("");
}

/* ---------- Pricing ---------- */
function renderPricing() {
  const sorted = [...trek.companies].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0].price;
  $("#price-list").innerHTML = sorted.map(c => `
    <div class="price-row ${c.price === cheapest ? "best" : ""}">
      ${c.price === cheapest ? '<span class="best-tag">Best price</span>' : ""}
      <div class="pr-logo">${c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</div>
      <div class="pr-info">
        <h4>${c.name}</h4>
        <p>${c.includes}</p>
      </div>
      <div class="pr-rating">${ICONS.star} ${c.rating}</div>
      <div class="pr-price">
        <div class="amount">${fmtINR(c.price)}</div>
        <small>per person</small>
      </div>
      ${c.url ? `<a class="pr-link" href="${c.url}" target="_blank" rel="noopener">Verify ↗</a>` : ""}
    </div>`).join("");
}

/* ---------- Plan CTA ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const cta = document.querySelector("#plan-cta");
  if (cta) cta.href = `plan.html?trek=${trek.id}`;
});

/* ---------- Fitness ---------- */
function renderFitness() {
  const f = trek.fitness;
  $("#fitness-sub").textContent = `Start preparing about ${f.prepWeeks} weeks before your batch date.`;
  $("#fit-level").innerHTML = `
    <div class="fit-meter" role="img" aria-label="Fitness level ${f.level} of 5">
      ${[1, 2, 3, 4, 5].map(i => `<i class="${i <= f.level ? "on" : ""}"></i>`).join("")}
    </div>
    <div class="fit-label">${f.label}<small>Level ${f.level} of 5 · ~${f.prepWeeks} weeks of prep</small></div>`;
  $("#fit-req").innerHTML = f.reqs.map(r => `<li><span class="fi">${r.icon}</span><span>${r.text}</span></li>`).join("");
}

/* ---------- Safety ---------- */
function renderSafety() {
  $("#safety-grid").innerHTML = SAFETY_TIPS.map(s => `
    <div class="safety-item">
      <span class="si">${s.icon}</span>
      <div><b>${s.title}</b>${s.text}</div>
    </div>`).join("");
}

/* ---------- Scroll-spy for section nav ---------- */
function initScrollSpy() {
  const links = [...document.querySelectorAll(".section-nav a")];
  const sections = links.map(a => document.querySelector(a.getAttribute("href")));

  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
        const active = document.querySelector(".section-nav a.active");
        if (active) active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      }
    });
  }, { rootMargin: "-30% 0px -60% 0px" });

  sections.forEach(s => s && spy.observe(s));
}
