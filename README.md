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

## 📱 Responsive design

- **Phone** (< 640 px): single-column cards, iOS-style bottom navigation
- **Tablet** (≥ 640 px): two-column grid, top navigation
- **Laptop** (≥ 1024 px): three-column grid, full stats strip

## 🚀 Run it

No build step, no dependencies. Either:

```bash
# open directly
open index.html

# or serve locally (recommended for live weather)
python3 -m http.server 8000
# → http://localhost:8000
```

## 🗂️ Structure

```
TrekSense/
├── index.html      # Explore + Saved views
├── trek.html       # Trek detail page (?id=kedarkantha …)
├── css/styles.css  # Design system, light/dark themes, responsive layout
├── images/         # Curated trek photographs (Wikimedia Commons)
└── js/
    ├── images.js   # Photo manifest with per-image attribution
    ├── data.js     # Trek knowledge base — 15 flagship treks, fully hand-written
    ├── data2.js    # 40 more UK/HP treks (compact specs + expander + operator roster)
    ├── data3.js    # 65 more: Nepal, Kashmir, Sikkim, Darjeeling + deeper HP/UK
    ├── routesdata.js # Journey planner knowledge (cities, hubs, road approaches)
    ├── peaks.js    # 78-peak photo library for the Peaks Visible section
    ├── shared.js   # Theme, saved-store, icons, SVG scene art + gallery variants
    ├── effects.js  # Motion layer (reveals, tilt, parallax, page transitions)
    ├── app.js      # Explore page logic
    └── trek.js     # Detail page logic + live weather + lightbox
```

Card covers, heroes and galleries use real photographs from `images/`; if a photo is missing, the generated SVG mountain scene behind it shows automatically.

## 📷 Photo credits

All photographs are from **Wikimedia Commons** under free licenses (CC BY / CC BY-SA / public domain). Per-image photographer and license credits are stored in [js/images.js](js/images.js) and displayed on each gallery frame and in the lightbox caption.

> ⚠️ Oxygen percentages are barometric estimates and prices are indicative. Always confirm with operators and follow your trek leader's judgement.
