# 🏔️ TrekSense

**Plan smarter, trek safer.** A modern, fully responsive website giving trekkers deep insight into **120 Himalayan treks & expeditions** (Uttarakhand, Himachal, Kashmir, Sikkim, Darjeeling & Nepal) — live weather, oxygen levels, difficulty maps, visible peaks, wildlife, gear checklists, ~1,000 curated photographs and operator price comparison.

## ✨ Features

| Feature | Detail |
|---|---|
| 🔍 Explore & search | Search treks/regions, filter by difficulty & season (incl. **Expedition** tier), sort by price/altitude/duration |
| 📸 Real photo galleries | Up to 10 curated photographs per trek (4K covers where available) from Wikimedia Commons, topped up with seasonal illustrations to 10+ frames, full-screen lightbox |
| ✨ Motion layer | Scroll-reveal staggering, 3D card tilt, hero parallax, count-up stats, cross-page fade + View Transitions API — all disabled under `prefers-reduced-motion` |
| 🌤️ Latest weather | **Live** current conditions + 5-day forecast per basecamp via the free Open-Meteo API (graceful offline fallback) |
| 📈 Where it's hard | Segment-by-segment difficulty grading with a highlighted "crux" section |
| 🫁 Oxygen levels | Animated chart of available O₂ at every checkpoint, thin-air warnings below 62% |
| 🏔️ Checkpoints & peaks | Timeline of campsites with the exact peaks visible from each one |
| 🎒 Equipment checklist | Interactive packing list with progress bar — saved per trek on your device |
| 🦌 Wildlife | Species you may meet, where to look, and how rare a sighting is |
| 💰 Cheapest operator | Price comparison across trekking companies with a "Best price" highlight |
| 💪 Fitness required | 5-level meter, prep timeline and concrete training targets |
| ❤️ Saved treks | Heart any trek; shortlist lives in the Saved tab (localStorage) |
| 🌙 Dark mode | Toggle in the header; respects system preference |
| 🛟 Safety & AMS | Altitude-sickness rules on every trek page |
| 🚧 Peak Finder *(in development)* | AR camera peak identifier — point your phone at the skyline, see named Himalayan peaks with elevation, distance and bearing, sourced from an offline-first on-device store. Backend live; camera/AR UI not yet built. See [`docs/BUILD-LOG.md`](docs/BUILD-LOG.md) |

## 📱 Responsive design

- **Phone** (< 640 px): single-column cards, iOS-style bottom navigation
- **Tablet** (≥ 640 px): two-column grid, top navigation
- **Laptop** (≥ 1024 px): three-column grid, full stats strip

## 🚀 Run it

The site itself is a plain static bundle — no build step. The one server-side piece
is the Peak Finder backend (`api/peaks.js`), a Vercel serverless function.

```bash
# static pages only
python3 -m http.server 8000

# static pages + a local emulation of /api/peaks (no Vercel account needed)
python3 scripts/dev-server.py 8000
# → http://localhost:8000/api/peaks?bbox=30.5,79.0,31.0,79.5
```

Deploy: connect the repo to **Vercel** (zero-config — `vercel.json` sets the function
timeout). GitHub Pages still serves every static page; only `/api/peaks` needs Vercel.

## 🗂️ Structure

```
TrekSense/
├── index.html      # Explore + Saved views
├── trek.html       # Trek detail page (?id=kedarkantha …)
├── vercel.json      # Peak Finder backend function config
├── api/
│   ├── peaks.js              # GET /api/peaks?bbox= — OpenStreetMap (Overpass) proxy
│   └── _fallback-peaks.json  # ~130-peak offline set, served when the provider fails
├── scripts/dev-server.py     # Local static server + /api/peaks emulator
├── docs/                     # Peak Finder blueprint, UI preview, build log, Stage 0 spike
├── css/styles.css  # Design system, light/dark themes, responsive layout
├── images/         # Curated trek photographs (Wikimedia Commons)
└── js/
    ├── images.js   # Photo manifest with per-image attribution
    ├── data.js     # Trek knowledge base — 15 flagship treks, fully hand-written
    ├── data2.js    # 40 more UK/HP treks (compact specs + expander + operator roster)
    ├── data3.js    # 65 more: Nepal, Kashmir, Sikkim, Darjeeling + deeper HP/UK
    ├── routesdata.js # Journey planner knowledge (cities, hubs, road approaches)
    ├── peaks.js    # 78-peak photo library for the Peaks Visible section
    ├── tiles.js    # Peak Finder — frozen 0.5° tile grid, shared with api/peaks.js
    ├── shared.js   # Theme, saved-store, icons, SVG scene art + gallery variants
    ├── effects.js  # Motion layer (reveals, tilt, parallax, page transitions)
    ├── app.js      # Explore page logic
    └── trek.js     # Detail page logic + live weather + lightbox
```

Card covers, heroes and galleries use real photographs from `images/`; if a photo is missing, the generated SVG mountain scene behind it shows automatically.

### Peak Finder backend

`api/peaks.js` proxies OpenStreetMap's Overpass API (`natural=peak`, no API key),
filters non-mountain noise, and returns a frozen JSON schema documented in
[`docs/PEAKS-API.md`](docs/PEAKS-API.md). It takes a bounding box snapped to the
0.5° tile grid in `js/tiles.js` so repeat requests for an already-prepared area are
edge-cached and cost nothing. On provider failure it degrades to the bundled
`api/_fallback-peaks.json` set (`degraded: true`) rather than erroring. Full plan,
progress and the interactive UI mockup: [`docs/BUILD-LOG.md`](docs/BUILD-LOG.md).

## 📷 Photo credits

All photographs are from **Wikimedia Commons** under free licenses (CC BY / CC BY-SA / public domain). Per-image photographer and license credits are stored in [js/images.js](js/images.js) and displayed on each gallery frame and in the lightbox caption.

> ⚠️ Oxygen percentages are barometric estimates and prices are indicative. Always confirm with operators and follow your trek leader's judgement.
