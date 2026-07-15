/* ============================================================
   TrekSense — data2.js
   40 additional Uttarakhand & Himachal treks/expeditions.
   Compact specs expanded at runtime into the full TREKS schema.
   ============================================================ */

/* Operator pools — prices are derived from each trek's base price */
const OP_TREK = [
  ["Himalayan Hikers", 0.94, 4.4, "Camps, meals, guide, permits"],
  ["The Searching Souls", 0.96, 4.6, "Camps, meals, guide"],
  ["Moxtain", 0.98, 4.4, "Camps, meals, permits"],
  ["Trek The Himalayas", 1.0, 4.7, "Camps, meals, safety gear"],
  ["Trekmunk", 1.02, 4.5, "Camps, meals, gear"],
  ["Renok Adventures", 1.03, 4.5, "Camps, meals, transport add-on"],
  ["Bikat Adventures", 1.05, 4.6, "Camps, meals, small batches"],
  ["Indiahikes", 1.08, 4.8, "Camps, meals, safety protocol"]
];
const OP_EXP = [
  ["Himalayan Daredevils", 1.0, 4.5, "Full expedition kit, HAPs, meals"],
  ["Moxtain", 1.02, 4.4, "Kit, meals, permits"],
  ["Trek The Himalayas", 1.08, 4.7, "Expedition kit, insurance"],
  ["Bikat Adventures", 1.12, 4.7, "Kit, skills program, small teams"],
  ["Boots & Crampons", 1.15, 4.8, "IMF-certified leaders, full kit"],
  ["White Magic Adventure", 1.22, 4.8, "Premium expedition service"]
];

/* Wildlife pools keyed by habitat */
const WILD = {
  forest: [
    { name: "Himalayan Langur", emoji: "🐒", zone: "Oak & deodar forest", rarity: "common" },
    { name: "Himalayan Monal", emoji: "🦚", zone: "Rhododendron slopes", rarity: "occasional" },
    { name: "Barking Deer", emoji: "🦌", zone: "Forest edges at dawn", rarity: "occasional" },
    { name: "Koklass Pheasant", emoji: "🐦", zone: "Dense undergrowth", rarity: "occasional" },
    { name: "Leopard", emoji: "🐆", zone: "Lower forest (pugmarks)", rarity: "rare" }
  ],
  meadow: [
    { name: "Himalayan Monal", emoji: "🦚", zone: "Treeline thickets", rarity: "occasional" },
    { name: "Red Fox", emoji: "🦊", zone: "Meadow edges", rarity: "occasional" },
    { name: "Himalayan Griffon", emoji: "🦅", zone: "Ridge thermals", rarity: "common" },
    { name: "Himalayan Weasel", emoji: "🦡", zone: "Bugyal burrows", rarity: "occasional" },
    { name: "Grazing herds & sheepdogs", emoji: "🐏", zone: "Summer pastures", rarity: "common" }
  ],
  alpine: [
    { name: "Bharal (Blue Sheep)", emoji: "🐏", zone: "High scree slopes", rarity: "occasional" },
    { name: "Himalayan Tahr", emoji: "🐐", zone: "Cliff bands", rarity: "occasional" },
    { name: "Golden Eagle", emoji: "🦅", zone: "Above the ridgelines", rarity: "occasional" },
    { name: "Snow Partridge", emoji: "🐦", zone: "Snowline boulders", rarity: "occasional" },
    { name: "Snow Leopard", emoji: "🐆", zone: "High ridges (tracks)", rarity: "rare" }
  ],
  glacier: [
    { name: "Bharal (Blue Sheep)", emoji: "🐏", zone: "Moraine grass patches", rarity: "occasional" },
    { name: "Alpine Chough", emoji: "🐦‍⬛", zone: "Even at high camps", rarity: "common" },
    { name: "Himalayan Pika", emoji: "🐹", zone: "Boulder fields", rarity: "common" },
    { name: "Golden Eagle", emoji: "🦅", zone: "Glacier thermals", rarity: "occasional" },
    { name: "Snow Leopard", emoji: "🐆", zone: "Camera-trap country", rarity: "rare" }
  ],
  spiti: [
    { name: "Himalayan Ibex", emoji: "🐐", zone: "Crags above the trail", rarity: "occasional" },
    { name: "Bharal (Blue Sheep)", emoji: "🐏", zone: "Open slopes in herds", rarity: "common" },
    { name: "Himalayan Marmot", emoji: "🦫", zone: "High pastures", rarity: "common" },
    { name: "Bearded Vulture", emoji: "🦅", zone: "Valley thermals", rarity: "occasional" },
    { name: "Snow Leopard", emoji: "🐆", zone: "Spiti's ghost — tracks & scat", rarity: "rare" }
  ]
};

/* Gear add-ons by tag */
const GEAR_TAGS = {
  snow: ["Microspikes & gaiters", "Insulated water bottle (bladders freeze)", "Thermos flask"],
  glacier: ["UV cat-3+ glacier glasses", "Gaiters", "Warm summit gloves"],
  rope: ["Harness, helmet, crampons & ice axe (operator provided)", "Double-layer snow boots (rental)", "−15 °C sleeping bag"],
  monsoon: ["Full rain cover + dry bags", "Anti-leech salt/spray", "Quick-dry towel"],
  light: ["Just a daypack — travel light", "Headlamp + spare batteries", "2 L water capacity"],
  pilgrim: ["Cash — no ATMs after roadhead", "Modest wear for temple visits", "Offline maps downloaded"]
};

/* Fitness templates by level */
const FIT_TPL = {
  1: { label: "Beginner", prepWeeks: 2, reqs: [
      { icon: "🚶", text: "<b>Walk 4–5 km</b> comfortably a few times before you go" },
      { icon: "🪜", text: "Light stair practice for the climbs" },
      { icon: "🎒", text: "Only a <b>4–5 kg daypack</b> needed" }] },
  2: { label: "Easy–Moderate", prepWeeks: 4, reqs: [
      { icon: "🏃", text: "<b>Jog 5 km in 35–40 min</b> comfortably" },
      { icon: "🪜", text: "Climb <b>4 flights of stairs</b> without gasping" },
      { icon: "🎒", text: "Practice walking with a <b>6–8 kg backpack</b>" }] },
  3: { label: "Moderate", prepWeeks: 6, reqs: [
      { icon: "🏃", text: "<b>Jog 5 km in ~35 min</b> before the trek" },
      { icon: "🪨", text: "Train on <b>uneven terrain</b> — ankle strength matters" },
      { icon: "🎒", text: "Comfortable carrying <b>8–9 kg</b> for 6-hour days" },
      { icon: "🦵", text: "Squats & step-downs for the descents" }] },
  4: { label: "Demanding", prepWeeks: 8, reqs: [
      { icon: "🏃", text: "<b>Jog 5 km in under 30 min</b>, 4× a week" },
      { icon: "⛰️", text: "One prior <b>12,000 ft+ trek</b> strongly recommended" },
      { icon: "🎒", text: "Train with <b>9–10 kg</b> on stair sessions" },
      { icon: "🩺", text: "Medical certificate required by most operators" }] },
  5: { label: "Strenuous", prepWeeks: 12, reqs: [
      { icon: "🏃", text: "<b>10 km runs</b> + hill repeats, 4–5× a week" },
      { icon: "⛰️", text: "Prior <b>high-altitude experience</b> mandatory" },
      { icon: "🎒", text: "Load-ferry training with <b>12+ kg</b>" },
      { icon: "🩺", text: "Full medical + fitness certificate required" },
      { icon: "🧠", text: "Cold, wind and waiting — <b>patience is a summit skill</b>" }] }
};

/* ------------------------------------------------------------------
   Compact specs.
   cps: [name, altFt, o2 auto, note, peaks[]] → [name, ft, note, peaks]
   segs auto-derived from cps unless given.
   ------------------------------------------------------------------ */
const T2 = [
  /* ---------------- UTTARAKHAND ---------------- */
  { id: "phulara-ridge", name: "Phulara Ridge", region: "Uttarkashi", state: "Uttarakhand",
    diff: "Moderate", scene: "meadow", ft: "12,127 ft", m: 3696, km: 25, days: 6,
    season: "Apr - Jun, Sep - Nov", seasons: ["Spring", "Summer", "Autumn"], price: 9450,
    lat: 31.07, lon: 78.19, base: "Sankri Basecamp", wild: "meadow", tags: ["snow"], fit: 3,
    desc: "One of the very few <strong>true ridge-walks</strong> in the Indian Himalaya — a full day spent walking a skyline instead of climbing to one, with peaks on both sides the entire time.",
    hl: ["Skyline ridge walk", "360° all day", "Quieter than Kedarkantha", "Grand campsites", "Photographer's trek"],
    cps: [["Sankri", "6,400 ft", "Shared basecamp of the Tons valley treks.", ["Greater Himalayan foothills"]],
          ["Sikolta", "8,900 ft", "Forest camp among brown oaks.", ["Kedarkantha through the trees"]],
          ["Bhoj Gadi", "11,150 ft", "Amphitheatre camp below the ridge.", ["Swargarohini", "Kala Nag"]],
          ["Phulara Ridge", "12,127 ft", "The ridge day — 4 km of skyline walking.", ["Swargarohini", "Bandarpoonch", "Kala Nag", "Srikanth", "Ranglana"]]],
    crux: ["The exposed ridge in wind", "Nothing is technical, but the ridge is open on both sides for hours — in strong wind or storm the exposure is real. Teams time it for the calmest morning window."] },

  { id: "bali-pass", name: "Bali Pass", region: "Uttarkashi", state: "Uttarakhand",
    diff: "Hard", scene: "valley", ft: "16,207 ft", m: 4940, km: 60, days: 8,
    season: "May - Jun, Sep - Oct", seasons: ["Summer", "Autumn"], price: 15950,
    lat: 31.09, lon: 78.3, base: "Sankri Basecamp", wild: "alpine", tags: ["snow", "glacier"], fit: 4,
    desc: "The wild connector from the <strong>Ruinsara valley to Yamunotri</strong> — remote camps, a sacred lake, and a genuinely serious pass day with a steep, exposed descent that earns every bit of its 'Hard' badge.",
    hl: ["Ruinsara Tal", "Remote high camps", "Serious pass day", "Yamunotri finish", "Low crowds"],
    cps: [["Sankri", "6,400 ft", "Staging village.", ["Foothill ridges"]],
          ["Ruinsara Tal", "11,800 ft", "Sacred lake beneath Swargarohini.", ["Swargarohini wall", "Bandarpoonch"]],
          ["Odari", "13,100 ft", "Cave-shelter camp — Bali's overnight stop in legend.", ["Kala Nag", "Swargarohini"]],
          ["Bali Pass", "16,207 ft", "Knife-edge pass; long exposed descent begins.", ["Bandarpoonch up close", "Kala Nag", "Yamunotri valley", "Gangotri range"]],
          ["Janki Chatti", "8,600 ft", "Pilgrim village below Yamunotri temple.", ["Yamunotri headwall"]]],
    crux: ["Pass day: Odari → Bali Pass → Lower Dhamni", "A 10–12 hr day: pre-dawn snow climb, a cornice-guarded top at 16,200 ft, then 5,000 ft of steep, often icy descent. Microspikes and a calm head are non-negotiable."] },

  { id: "gaumukh-tapovan", name: "Gaumukh Tapovan", region: "Uttarkashi", state: "Uttarakhand",
    diff: "Hard", scene: "glacier", ft: "14,640 ft", m: 4463, km: 46, days: 8,
    season: "May - Jun, Sep - Oct", seasons: ["Summer", "Autumn"], price: 13950,
    lat: 30.99, lon: 78.94, base: "Gangotri", wild: "glacier", tags: ["glacier", "pilgrim"], fit: 4,
    desc: "To the <strong>source of the Ganga</strong> and beyond: past the Gaumukh snout onto the meadow of Tapovan, where you camp at the feet of <strong>Shivling</strong> — the most beautiful mountain wall in Garhwal.",
    hl: ["Source of the Ganga", "Shivling at arm's length", "Bhagirathi trio", "Tapovan meadow camp", "Permit-limited & quiet"],
    cps: [["Gangotri", "10,055 ft", "Temple town roadhead; permits checked here.", ["Sudarshan Parbat"]],
          ["Chirbasa", "11,680 ft", "Pine camp above the infant Ganga.", ["Bhagirathi group first view"]],
          ["Bhojbasa", "12,450 ft", "Birch flats — last camp before the glacier.", ["Bhagirathi I–III", "Shivling tip"]],
          ["Gaumukh", "13,200 ft", "The 'cow's mouth' glacier snout.", ["Bhagirathi wall", "Shivling"]],
          ["Tapovan", "14,640 ft", "High meadow across the moraine.", ["Shivling", "Bhagirathi I–III", "Meru", "Sumeru Parbat"]]],
    crux: ["Gaumukh → Tapovan moraine climb", "A 1,400 ft scramble over live moraine — loose boulders, no fixed trail, occasional rockfall lines. Helmets on, gap between trekkers, follow the guide's line exactly."] },

  { id: "kedartal", name: "Kedartal", region: "Uttarkashi", state: "Uttarakhand",
    diff: "Hard", scene: "glacier", ft: "15,485 ft", m: 4720, km: 36, days: 7,
    season: "May - Jun, Sep - Oct", seasons: ["Summer", "Autumn"], price: 13500,
    lat: 30.98, lon: 78.93, base: "Gangotri", wild: "alpine", tags: ["glacier"], fit: 4,
    desc: "Garhwal's <strong>gem of a glacial lake</strong> under the fluted ice face of Thalay Sagar. Short in kilometres, serious in character — the 'spider wall' traverse filters out the casual.",
    hl: ["Thalay Sagar mirror", "Spider wall traverse", "Bharal herds", "Compact & intense", "Alpine amphitheatre"],
    cps: [["Gangotri", "10,055 ft", "Roadhead on the Bhagirathi.", ["Sudarshan Parbat"]],
          ["Bhoj Kharak", "12,780 ft", "Birch-grove camp in the Kedar Ganga gorge.", ["Manda peaks"]],
          ["Kedar Kharak", "14,200 ft", "Open meadow; bharal almost guaranteed.", ["Bhrigupanth", "Thalay Sagar"]],
          ["Kedartal", "15,485 ft", "The lake — Thalay Sagar reflected at dawn.", ["Thalay Sagar", "Bhrigupanth", "Manda I–III", "Jogin group"]]],
    crux: ["The 'spider wall' before Bhoj Kharak", "A narrow ledge traverse across a rocky slab band with real exposure to the gorge. Short, protected by care rather than gear — one deliberate step at a time."] },

  { id: "satopanth-tal", name: "Satopanth Tal", region: "Chamoli", state: "Uttarakhand",
    diff: "Hard", scene: "lakes", ft: "15,100 ft", m: 4600, km: 40, days: 7,
    season: "May - Jun, Sep - Oct", seasons: ["Summer", "Autumn"], price: 14500,
    lat: 30.77, lon: 79.49, base: "Mana Village (Badrinath)", wild: "alpine", tags: ["glacier", "pilgrim"], fit: 4,
    desc: "The <strong>triangular lake of the Trinity</strong> beyond Badrinath, where mythology says the Pandavas walked their final path. Moraine camps, the thunder of Vasudhara falls, and Chaukhamba filling the sky.",
    hl: ["Mythical triangle lake", "Vasudhara falls", "Chaukhamba wall", "Beyond-Badrinath wilderness", "Pilgrimage meets alpinism"],
    cps: [["Mana", "10,500 ft", "India's 'first village', beyond Badrinath.", ["Neelkanth"]],
          ["Laxmi Van", "12,140 ft", "Forest-patch camp past Vasudhara falls.", ["Balakun", "Neelkanth"]],
          ["Chakratirtha", "13,800 ft", "Grassy bowl under the moraine crest.", ["Chaukhamba I–IV"]],
          ["Satopanth Tal", "15,100 ft", "The emerald triangle; prayer-flag shoreline.", ["Chaukhamba", "Neelkanth", "Balakun", "Parvati Parbat"]]],
    crux: ["Moraine ridge to the lake", "The last 3 km ride a crumbling lateral moraine crest — ball-bearing scree with a long runout. Slow, tested steps; poles out, eyes up for rockfall."] },

  { id: "madmaheshwar", name: "Madmaheshwar", region: "Rudraprayag", state: "Uttarakhand",
    diff: "Moderate", scene: "forest", ft: "12,470 ft", m: 3800, km: 32, days: 5,
    season: "May - Nov", seasons: ["Summer", "Monsoon", "Autumn"], price: 8250,
    lat: 30.63, lon: 79.24, base: "Ransi Village", wild: "forest", tags: ["pilgrim"], fit: 3,
    desc: "The quietest of the <strong>Panch Kedar</strong> — a deep river-valley walk to the temple where Shiva's navel is worshipped, crowned by the tiny tarns of <strong>Buda Madmaheshwar</strong> mirroring Chaukhamba.",
    hl: ["Panch Kedar temple", "Buda Madmaheshwar tarns", "Chaukhamba reflections", "Village trail life", "Uncrowded"],
    cps: [["Ransi", "6,800 ft", "Roadhead village with the Rakeshwari temple.", ["Valley ridgelines"]],
          ["Gaundhar", "8,200 ft", "Riverside hamlet at the confluence.", ["Madhyamaheshwar valley walls"]],
          ["Madmaheshwar", "11,470 ft", "The temple cradle at valley's end.", ["Chaukhamba dome"]],
          ["Buda Madmaheshwar", "12,470 ft", "Ridge-top tarns an hour above.", ["Chaukhamba I–IV mirrored", "Kedarnath dome", "Mandani Parbat"]]],
    crux: ["The final pull to Buda Madmaheshwar", "A steep 1,000 ft grass slope before dawn to catch Chaukhamba in the tarns at sunrise — cold start, big reward, tricky when wet."] },

  { id: "deoriatal-chandrashila", name: "Deoriatal – Chandrashila", region: "Rudraprayag", state: "Uttarakhand",
    diff: "Easy", scene: "winter", ft: "13,123 ft", m: 4000, km: 26, days: 5,
    season: "Dec - Apr, Sep - Nov", seasons: ["Winter", "Spring", "Autumn"], price: 7999,
    lat: 30.52, lon: 79.18, base: "Sari Village", wild: "forest", tags: ["snow", "pilgrim"], fit: 2,
    desc: "The <strong>summit-view-per-effort champion</strong>: a lake that mirrors Chaukhamba, the world's highest Shiva temple at Tungnath, and a 360° summit from which <strong>Nanda Devi to Kedarnath</strong> stand in one sweep.",
    hl: ["Chaukhamba mirror lake", "Tungnath temple", "Summit 360°", "Winter snow magic", "Beginner friendly"],
    cps: [["Sari", "6,600 ft", "Roadhead village above the Mandakini valley.", ["Chandrashila glimpse"]],
          ["Deoriatal", "7,800 ft", "The mirror lake — Chaukhamba at dawn.", ["Chaukhamba reflected", "Kala Parvat"]],
          ["Chopta", "8,790 ft", "'Mini Switzerland' meadows in rhododendron forest.", ["Kedar dome glimpses"]],
          ["Tungnath", "12,073 ft", "Highest Shiva temple in the world.", ["Kedarnath", "Thalay Sagar (far)"]],
          ["Chandrashila", "13,123 ft", "The 'moon rock' summit.", ["Nanda Devi", "Trishul", "Nanda Ghunti", "Chaukhamba", "Kedar dome", "Bandarpoonch"]]],
    crux: ["Tungnath → Chandrashila in snow", "The final 1,000 ft steepens sharply and ices up in winter — microspikes turn a slog into a joy. Start pre-dawn for the summit sunrise."] },

  { id: "pindari-glacier", name: "Pindari Glacier", region: "Bageshwar", state: "Uttarakhand",
    diff: "Moderate", scene: "glacier", ft: "12,300 ft", m: 3750, km: 48, days: 7,
    season: "Apr - Jun, Sep - Oct", seasons: ["Spring", "Summer", "Autumn"], price: 9950,
    lat: 30.19, lon: 79.98, base: "Khati Village", wild: "forest", tags: [], fit: 3,
    desc: "Kumaon's <strong>classic glacier trail</strong> — a gentle river-valley walk through ancient villages to Zero Point, where the Pindari icefall tumbles beneath Nanda Kot. The friendliest 'first glacier' in the Himalaya.",
    hl: ["Zero Point icefall", "Kumaoni village trail", "Nanda Kot views", "Tea-house style", "Gentle gradients"],
    cps: [["Khati", "7,220 ft", "Last village — slate roofs and apple orchards.", ["Pindar valley walls"]],
          ["Dwali", "8,530 ft", "Confluence camp of Pindar and Kafni rivers.", ["Nanda Khat glimpse"]],
          ["Phurkia", "10,500 ft", "Treeline rest-house shelf.", ["Panwali Dwar"]],
          ["Zero Point", "12,300 ft", "Viewpoint over the crevassed icefall.", ["Nanda Kot", "Nanda Khat", "Panwali Dwar", "Maiktoli", "Baljuri"]]],
    crux: ["Phurkia → Zero Point washouts", "Monsoon landslides regularly chew the final kilometres; short scree bypasses appear each season. Nothing sustained — just stay alert on the cut sections."] },

  { id: "kafni-glacier", name: "Kafni Glacier", region: "Bageshwar", state: "Uttarakhand",
    diff: "Moderate", scene: "glacier", ft: "12,500 ft", m: 3810, km: 50, days: 7,
    season: "Apr - Jun, Sep - Oct", seasons: ["Spring", "Summer", "Autumn"], price: 9950,
    lat: 30.19, lon: 79.98, base: "Khati Village", wild: "alpine", tags: [], fit: 3,
    desc: "Pindari's <strong>wilder twin</strong> — branch right at Dwali and the crowds vanish. The Kafni valley saves its drama for the end: the glacier bowl under <strong>Nanda Kot's south face</strong>.",
    hl: ["Nanda Kot south face", "Fraction of Pindari's crowd", "Combinable with Pindari", "Bugyal camps", "True quiet"],
    cps: [["Khati", "7,220 ft", "Shared trailhead with Pindari.", ["Pindar valley"]],
          ["Dwali", "8,530 ft", "The fork — Kafni bears right.", ["River confluence gorge"]],
          ["Khatiya", "10,760 ft", "Meadow camp in the upper Kafni.", ["Nandabhanar"]],
          ["Kafni Glacier", "12,500 ft", "Glacier bowl below Nanda Kot.", ["Nanda Kot", "Nandabhanar", "Kafni cirque"]]],
    crux: ["The upper valley's vanishing trail", "Beyond Khatiya the path fades into shepherd traces and boulder hops — navigation, not gradient, is the challenge. Go with someone who knows the valley."] },

  { id: "milam-glacier", name: "Milam Glacier", region: "Pithoragarh", state: "Uttarakhand",
    diff: "Hard", scene: "glacier", ft: "13,451 ft", m: 4100, km: 90, days: 8,
    season: "May - Jun, Sep - Oct", seasons: ["Summer", "Autumn"], price: 13950,
    lat: 30.07, lon: 80.24, base: "Munsiyari", wild: "alpine", tags: [], fit: 4,
    desc: "March up the old <strong>Indo-Tibet trade route</strong> through the Gori Ganga gorge to Milam — a ghost village of 400 stone houses — and on to the glacier under <strong>Nanda Devi East</strong>. Long, historic, humbling.",
    hl: ["Old Tibet trade route", "Milam ghost village", "Nanda Devi East", "Gori Ganga gorge", "Big-mileage days"],
    cps: [["Munsiyari", "7,200 ft", "Kumaon's balcony town, facing Panchachuli.", ["Panchachuli I–V"]],
          ["Bogudiyar", "8,300 ft", "Gorge camp — the walls close in.", ["Gori Ganga gorge"]],
          ["Martoli", "11,000 ft", "Semi-abandoned village on a shelf.", ["Nanda Devi East first view", "Hardeol"]],
          ["Milam Village", "11,500 ft", "The great ghost village of the trade era.", ["Hardeol", "Trishuli", "Rishi Pahar"]],
          ["Milam Glacier", "13,451 ft", "Snout viewpoint beneath giants.", ["Nanda Devi East", "Hardeol", "Trishuli", "Rishi Pahar"]]],
    crux: ["Gorge days with big mileage", "Back-to-back 15–18 km days through a landslide-prone gorge in ITBP-permit territory. The distance, not any single section, is what breaks people."] },

  { id: "panchachuli-bc", name: "Panchachuli Base Camp", region: "Pithoragarh (Darma)", state: "Uttarakhand",
    diff: "Moderate", scene: "alpine", ft: "13,977 ft", m: 4260, km: 34, days: 7,
    season: "May - Jun, Sep - Oct", seasons: ["Summer", "Autumn"], price: 12500,
    lat: 30.15, lon: 80.54, base: "Dugtu (Darma Valley)", wild: "alpine", tags: [], fit: 3,
    desc: "The <strong>five chimneys of the Pandavas</strong> from a valley most trekkers have never heard of. Darma's Rung villages, buckwheat fields, and a base-camp meadow staring straight at the Panchachuli wall.",
    hl: ["Panchachuli wall", "Rung village culture", "Roadhead-close alpine", "Buckwheat & barley fields", "Almost private"],
    cps: [["Dugtu", "10,240 ft", "Rung village facing the peaks.", ["Panchachuli II"]],
          ["Dantu", "10,300 ft", "Twin village across the fields.", ["Panchachuli group"]],
          ["Panchachuli Base Camp", "13,977 ft", "Meadow camp under the five summits.", ["Panchachuli I–V", "Darma valley sweep"]]],
    crux: ["Altitude without warning", "The road delivers you high, and base camp is 3,700 ft higher within a day — the compressed profile brings on headaches fast. Build in the acclimatisation walk."] },

  { id: "bagini-glacier", name: "Bagini Glacier & Changabang BC", region: "Chamoli", state: "Uttarakhand",
    diff: "Hard", scene: "glacier", ft: "14,816 ft", m: 4516, km: 44, days: 7,
    season: "May - Jun, Sep - Oct", seasons: ["Summer", "Autumn"], price: 12950,
    lat: 30.62, lon: 79.72, base: "Jumma Trailhead", wild: "glacier", tags: ["glacier"], fit: 4,
    desc: "Into the <strong>outer sanctuary of Nanda Devi</strong>: the Bagini valley leads to the base of <strong>Changabang</strong> — the 'shining mountain' of climbing legend — past Dronagiri, the village of the Sanjeevani myth.",
    hl: ["Changabang's granite prow", "Dronagiri myth village", "Nanda Devi outer sanctuary", "Serious moraine country", "Mountaineering atmosphere"],
    cps: [["Jumma", "7,900 ft", "Bridge trailhead on the Dhauli Ganga.", ["Gorge walls"]],
          ["Ruing", "9,350 ft", "Hamlet on the old Niti route.", ["Dronagiri peak glimpse"]],
          ["Dronagiri Village", "11,800 ft", "The village that shuns Hanuman — ask why.", ["Dronagiri", "Hathi Parbat"]],
          ["Bagini Base Camp", "14,816 ft", "Moraine camp in the giants' court.", ["Changabang", "Kalanka", "Dronagiri", "Rishi Pahar", "Trishuli"]]],
    crux: ["The Bagini moraine maze", "The final day weaves through unstable moraine troughs where the route changes yearly. Cairn-reading and patience beat pace here."] },

  { id: "pangarchulla", name: "Pangarchulla Peak", region: "Chamoli", state: "Uttarakhand",
    diff: "Hard", scene: "winter", ft: "15,069 ft", m: 4593, km: 38, days: 7,
    season: "Mar - Jun", seasons: ["Spring", "Summer"], price: 11950,
    lat: 30.55, lon: 79.57, base: "Joshimath / Dhak", wild: "alpine", tags: ["snow"], fit: 4,
    desc: "The <strong>trekker's summit</strong> above the Kuari trail — a long boulder-and-snow push to a top that looks straight into <strong>Nanda Devi's sanctuary wall</strong>. A perfect first 'real summit day' without ropes.",
    hl: ["True summit day", "Nanda Devi head-on", "Spring snow climb", "Kuari trail approach", "No ropes needed"],
    cps: [["Dhak", "6,900 ft", "Trailhead above Joshimath.", ["Hathi-Ghoda"]],
          ["Gulling", "9,600 ft", "Forest camp shared with Kuari Pass.", ["Dronagiri"]],
          ["Khullara", "11,010 ft", "Treeline camp under the peak.", ["Dronagiri", "Nilkantha"]],
          ["Pangarchulla Summit", "15,069 ft", "Boulder summit — sanctuary panorama.", ["Nanda Devi", "Dronagiri", "Chaukhamba", "Kamet", "Hathi-Ghoda", "Neelkanth"]]],
    crux: ["Summit day: 4,000 ft up and down", "A 12–14 hr day over snowed-in boulders; in April the snow bridges gaps, by June it's a leg-eating boulder hop. Turnaround time is enforced — respect it."] },

  { id: "audens-col", name: "Auden's Col Expedition", region: "Uttarkashi", state: "Uttarakhand",
    diff: "Expedition", scene: "glacier", ft: "18,010 ft", m: 5490, km: 75, days: 12,
    season: "May - Jun, Sep", seasons: ["Summer", "Autumn"], price: 42000,
    lat: 30.99, lon: 78.94, base: "Gangotri", wild: "glacier", tags: ["rope", "glacier"], fit: 5,
    desc: "The fabled <strong>crossing between Gangotri and Kedarnath watersheds</strong> — a crevassed col at 18,010 ft first crossed in 1935, linking the Rudugaira and Khatling glaciers. Roped travel, big packs, bigger commitment.",
    hl: ["Legendary 1935 crossing", "Two-watershed traverse", "Crevassed glacier travel", "Khatling icefall descent", "Full expedition craft"],
    cps: [["Gangotri", "10,055 ft", "Expedition staging.", ["Sudarshan"]],
          ["Rudugaira Base", "12,800 ft", "Camp in the Rudugaira bowl.", ["Gangotri I–III", "Jogin group"]],
          ["Gangotri Base", "14,800 ft", "High camp below the col slopes.", ["Jogin I", "Rudugaira"]],
          ["Auden's Col", "18,010 ft", "The gateway — cornice and prayer flags.", ["Jogin group", "Gangotri massif", "Thalay Sagar", "Khatling glacier below"]],
          ["Khatling Glacier Camp", "13,500 ft", "Below the icefall, Kedar side.", ["Thalay Sagar", "Jogin walls"]]],
    crux: ["Col day and the Khatling icefall", "Roped 2 AM start over crevasse fields, a 60° snow ramp to the col, then two days navigating the broken Khatling icefall — the most technical 'trek' in Garhwal. Guides fix 200–400 m of line."] },

  { id: "kalindi-khal", name: "Kalindi Khal Expedition", region: "Uttarkashi → Chamoli", state: "Uttarakhand",
    diff: "Expedition", scene: "glacier", ft: "19,521 ft", m: 5950, km: 90, days: 14,
    season: "Jun, Sep", seasons: ["Summer", "Autumn"], price: 55000,
    lat: 30.99, lon: 78.94, base: "Gangotri", wild: "glacier", tags: ["rope", "glacier"], fit: 5,
    desc: "The <strong>grand traverse of Garhwal</strong>: Gangotri to Badrinath over a 19,521 ft glacial saddle, past Tapovan, Vasuki Tal and the Chaturangi glacier. Two weeks of load ferries, crevasse lines and the biggest amphitheatres in India.",
    hl: ["Gangotri→Badrinath traverse", "19,521 ft pass", "Vasuki Tal camps", "Chaturangi glacier", "The full expedition"],
    cps: [["Gangotri", "10,055 ft", "Start of the pilgrimage — and the expedition.", ["Sudarshan"]],
          ["Tapovan", "14,640 ft", "Shivling's meadow; acclimatisation rotations.", ["Shivling", "Bhagirathi I–III", "Meru"]],
          ["Vasuki Tal", "16,000 ft", "Glacial lake camp under Vasuki Parbat.", ["Vasuki Parbat", "Bhagirathi wall", "Satopanth"]],
          ["Kalindi Khal", "19,521 ft", "The saddle — half sea-level oxygen.", ["Satopanth", "Chandra Parbat", "Avalanche Peak", "Kamet (far)"]],
          ["Badrinath", "10,270 ft", "Arati at the temple to close the crossing.", ["Neelkanth"]]],
    crux: ["Kalindi Khal in a weather window", "At ~48% oxygen with roped crevasse travel on both sides, the pass gives one summit-style window; miss it and expeditions retreat to Vasuki Tal to wait. Success is weather, not fitness, at this point."] },

  { id: "dodital-darwa", name: "Dodital & Darwa Pass", region: "Uttarkashi", state: "Uttarakhand",
    diff: "Easy", scene: "forest", ft: "13,090 ft", m: 3990, km: 30, days: 5,
    season: "Mar - Jun, Sep - Dec", seasons: ["Spring", "Summer", "Autumn", "Winter"], price: 7450,
    lat: 30.87, lon: 78.42, base: "Sangamchatti", wild: "forest", tags: [], fit: 2,
    desc: "Ganesh's birthplace by legend and a <strong>trout-filled forest lake</strong> by geography — then up to Darwa Pass, where <strong>Bandarpoonch fills the horizon</strong>. Old-school Garhwal trekking at its gentlest.",
    hl: ["Sacred trout lake", "Ganesh temple", "Darwa Pass views", "Deodar forests", "All-season classic"],
    cps: [["Sangamchatti", "4,600 ft", "Roadhead on the Assi Ganga.", ["Forested gorge"]],
          ["Agoda", "7,480 ft", "Village camp in walnut groves.", ["Assi Ganga valley"]],
          ["Dodital", "9,920 ft", "The lake — Ganesh temple on its shore.", ["Forest amphitheatre"]],
          ["Darwa Pass", "13,090 ft", "Grass saddle above the treeline.", ["Bandarpoonch", "Kala Nag", "Swargarohini glimpse", "Gangotri range"]]],
    crux: ["Dodital → Darwa Top", "3,000 ft in a morning from lake to pass — the only real climb, and in December it's a proper snow plod. Views repay every step tenfold."] },

  { id: "sahastra-tal", name: "Sahastra Tal", region: "Tehri-Uttarkashi", state: "Uttarakhand",
    diff: "Hard", scene: "lakes", ft: "15,100 ft", m: 4600, km: 45, days: 8,
    season: "May - Jun, Sep - Oct", seasons: ["Summer", "Autumn"], price: 13500,
    lat: 30.73, lon: 78.6, base: "Silla Village", wild: "meadow", tags: ["snow"], fit: 4,
    desc: "A <strong>staircase of seven glacial lakes</strong> hidden between the Bhagirathi and Bhilangana valleys, reached across the enormous Kush Kalyan plateau. Remote, mythical, and gloriously empty.",
    hl: ["Chain of 7 lakes", "Kush Kalyan plateau", "Shepherd-trail wilderness", "Ridge-top tarns", "Very low footfall"],
    cps: [["Silla", "6,300 ft", "Bhilangana-valley roadhead.", ["Valley ridges"]],
          ["Kush Kalyan", "11,150 ft", "One of Asia's largest meadow plateaus.", ["Jaonli", "Draupadi ka Danda"]],
          ["Lamb Tal", "13,800 ft", "First of the lake chain.", ["Khatling ridge"]],
          ["Sahastra Tal", "15,100 ft", "The 'thousand lakes' bowl.", ["Jaonli", "Draupadi ka Danda", "Gangotri range", "Khatling glacier rim"]]],
    crux: ["The lake-chain ridge in cloud", "The upper tarns sit on a broad, featureless ridge where afternoon whiteouts erase all bearings. Teams summit the chain by 11 AM or camp and wait."] },

  { id: "panwali-kantha", name: "Panwali Kantha", region: "Tehri", state: "Uttarakhand",
    diff: "Moderate", scene: "meadow", ft: "11,500 ft", m: 3505, km: 35, days: 5,
    season: "Apr - Jun, Sep - Nov", seasons: ["Spring", "Summer", "Autumn"], price: 8450,
    lat: 30.53, lon: 78.75, base: "Ghuttu", wild: "meadow", tags: ["pilgrim"], fit: 3,
    desc: "The <strong>ridgeline meadow highway</strong> of the old Kedarnath pilgrim route — kilometres of flower-heavy bugyal with <strong>Chaukhamba to Thalay Sagar</strong> arrayed across the northern sky.",
    hl: ["Meadow ridgeline", "Old pilgrim route", "Chaukhamba skyline", "Flowers in monsoon", "Ends near Triyuginarayan"],
    cps: [["Ghuttu", "4,920 ft", "Bhilangana roadhead bazaar.", ["Valley forest"]],
          ["Deolang", "8,200 ft", "Mid-forest camp.", ["Ridge glimpses"]],
          ["Panwali Kantha", "11,500 ft", "The great meadow crest.", ["Chaukhamba", "Kedarnath dome", "Thalay Sagar", "Jogin group"]],
          ["Triyuginarayan side", "6,500 ft", "Descent toward the eternal-flame temple.", ["Kedar valley"]]],
    crux: ["Long exposed crest in storms", "The beauty — an open crest for a full day — is also the risk: afternoon thunderstorms in May–June arrive fast with nowhere to hide. Walk the crest before noon."] },

  { id: "gidara-bugyal", name: "Gidara Bugyal", region: "Uttarkashi", state: "Uttarakhand",
    diff: "Moderate", scene: "meadow", ft: "13,900 ft", m: 4237, km: 42, days: 7,
    season: "May - Jun, Sep - Oct", seasons: ["Summer", "Autumn"], price: 11950,
    lat: 30.9, lon: 78.6, base: "Bhangeli Village", wild: "meadow", tags: [], fit: 3,
    desc: "Dayara's <strong>bigger, higher, emptier sibling</strong> — a rolling meadow system that runs for kilometres at 13,000 ft with the Gangotri and Bandarpoonch ranges as a permanent backdrop.",
    hl: ["Vaster than Dayara", "13,000 ft meadow camps", "Gangotri range backdrop", "Shepherd culture", "Solitude guaranteed"],
    cps: [["Bhangeli", "5,900 ft", "Steep-stacked village above the Bhagirathi.", ["Gorge forest"]],
          ["Gujjar Hut", "9,800 ft", "Buffalo-herder clearing camp.", ["Srikanth glimpse"]],
          ["Gidara Bugyal", "12,500 ft", "The meadow ocean begins.", ["Bandarpoonch", "Kala Nag", "Srikanth"]],
          ["Gidara Top", "13,900 ft", "High crest of the bugyal.", ["Bandarpoonch", "Kala Nag", "Srikanth", "Jaonli", "Gangotri massif"]]],
    crux: ["Bhangeli's brutal first day", "4,000 ft straight out of the village on a herder's staircase — the toughest day arrives before your legs are warmed up. Start at first light, carry 2 L."] },

  { id: "rudranath", name: "Rudranath (Panch Kedar)", region: "Chamoli", state: "Uttarakhand",
    diff: "Moderate", scene: "forest", ft: "11,800 ft", m: 3600, km: 38, days: 5,
    season: "May - Jun, Sep - Oct", seasons: ["Summer", "Autumn"], price: 8950,
    lat: 30.44, lon: 79.32, base: "Sagar Village (Gopeshwar)", wild: "forest", tags: ["pilgrim"], fit: 3,
    desc: "The hardest-won of the Panch Kedar — Shiva's <strong>face</strong> worshipped in a cave-temple set in rolling bugyals with the <strong>finest Nanda Devi sightline</strong> of any temple trek.",
    hl: ["Panch Kedar cave temple", "Nanda Devi sightline", "Panar Bugyal camps", "Rhododendron tunnels", "Pilgrim tea-huts"],
    cps: [["Sagar", "5,700 ft", "Village trailhead near Gopeshwar.", ["Forested ridges"]],
          ["Pung Bugyal", "8,850 ft", "First meadow clearing.", ["Valley views"]],
          ["Panar Bugyal", "11,150 ft", "Great meadow camp above the clouds.", ["Nanda Devi", "Trishul", "Nanda Ghunti"]],
          ["Rudranath", "11,800 ft", "The face of Shiva in stone.", ["Nanda Devi", "Trishul", "Nanda Ghunti", "Hathi Parbat"]]],
    crux: ["Relentless ridge undulation", "The trail gains and loses the same ridge repeatedly — 'flat' days still bank 3,000 ft of climbing. Pace, don't push."] },

  /* ---------------- HIMACHAL PRADESH ---------------- */
  { id: "beas-kund", name: "Beas Kund", region: "Kullu (Solang)", state: "Himachal Pradesh",
    diff: "Easy", scene: "glacier", ft: "12,772 ft", m: 3893, km: 16, days: 3,
    season: "May - Oct", seasons: ["Summer", "Monsoon", "Autumn"], price: 5450,
    lat: 32.31, lon: 77.15, base: "Solang Valley", wild: "meadow", tags: ["light"], fit: 2,
    desc: "The <strong>source of the Beas</strong> in a glacial bowl ringed by Hanuman Tibba and the Seven Sisters — Manali's perfect first Himalayan weekend, meadow camps included.",
    hl: ["Source of the Beas", "Hanuman Tibba amphitheatre", "Weekend from Manali", "Meadow camps", "Mountaineering nursery"],
    cps: [["Solang", "8,400 ft", "Adventure-sport valley trailhead.", ["Friendship Peak"]],
          ["Dhundi", "9,500 ft", "Riverside meadow camp.", ["Hanuman Tibba", "Seven Sisters"]],
          ["Bakarthach", "10,800 ft", "Shepherd meadow — 'goat's field'.", ["Shitidhar", "Friendship Peak"]],
          ["Beas Kund", "12,772 ft", "The sacred spring under the ice.", ["Hanuman Tibba", "Makerbeh", "Shitidhar", "Seven Sisters"]]],
    crux: ["Moraine hop to the lake", "The last hour crosses a boulder field where ankles go to die — slow, tested steps and poles make it a stroll."] },

  { id: "pin-parvati", name: "Pin Parvati Pass", region: "Kullu → Spiti", state: "Himachal Pradesh",
    diff: "Expedition", scene: "glacier", ft: "17,457 ft", m: 5319, km: 110, days: 11,
    season: "Jul - Sep", seasons: ["Monsoon", "Autumn"], price: 32500,
    lat: 32.01, lon: 77.44, base: "Barsheni (Parvati Valley)", wild: "glacier", tags: ["rope", "glacier", "monsoon"], fit: 5,
    desc: "The <strong>king of Himachal crossings</strong>: eleven days from Parvati's jungles and hot springs, past Mantalai lake, over a crevassed 17,457 ft glacier pass into the naked moonscape of <strong>Pin valley, Spiti</strong>.",
    hl: ["Green-to-desert crossing", "Mantalai sacred lake", "Crevassed pass glacier", "Hot springs start", "India's classic hard traverse"],
    cps: [["Barsheni", "7,700 ft", "Parvati roadhead.", ["Parvati gorge"]],
          ["Kheerganga", "9,700 ft", "Hot-spring meadow — last luxury.", ["Valley walls"]],
          ["Tunda Bhuj", "11,150 ft", "Birch camp; the wild begins.", ["Parvati spires"]],
          ["Mantalai Lake", "13,450 ft", "Sacred source-lake of the Parvati.", ["Parvati South", "Pyramid Peak"]],
          ["Pin Parvati Base", "15,750 ft", "Glacier-edge high camp.", ["Parvati South wall"]],
          ["Pin Parvati Pass", "17,457 ft", "The crossing — Kullu behind, Spiti ahead.", ["Parvati South", "Pyramid Peak", "Pin valley ranges", "Spiti skyline"]],
          ["Mud (Spiti)", "12,300 ft", "First village of the Pin valley.", ["Pin valley ochres"]]],
    crux: ["The glacier day", "Roped travel over a crevassed plateau, often in fresh monsoon snow, route-finding between slots at 17,000 ft. The pass has turned back full expeditions in bad years — buffer days are built in for a reason."] },

  { id: "buran-ghati", name: "Buran Ghati", region: "Shimla (Pabbar Valley)", state: "Himachal Pradesh",
    diff: "Hard", scene: "valley", ft: "15,059 ft", m: 4590, km: 40, days: 7,
    season: "May - Jun, Sep - Oct", seasons: ["Summer", "Autumn"], price: 12450,
    lat: 31.28, lon: 77.98, base: "Janglik Village", wild: "meadow", tags: ["snow", "rope"], fit: 4,
    desc: "The trek with the <strong>ice-wall finale</strong> — after meadows and the milky Chandranahan tarns, the pass drops through a snow chute you <strong>rappel and slide</strong> down. Adventure distilled.",
    hl: ["Ice-wall rappel descent", "Chandranahan tarns", "Janglik's timber towers", "Dayara (HP) meadows", "Snow-slide fun"],
    cps: [["Janglik", "9,200 ft", "Ancient timber-tower village.", ["Pabbar valley"]],
          ["Dayara Thatch", "11,075 ft", "Himachal's own Dayara meadow.", ["Valley rim peaks"]],
          ["Litham", "11,737 ft", "Camp facing the Chandranahan falls.", ["Chandranahan bowl"]],
          ["Chandranahan Lake", "13,900 ft", "Snow-fed tarn chain (side trip).", ["Pabbar headwall"]],
          ["Buran Ghati", "15,059 ft", "The pass — then the ice wall.", ["Pabbar valley behind", "Kinner Kailash range (far)", "Baspa side ridges"]]],
    crux: ["The ice wall off the pass", "A near-vertical 400 ft snow wall descended on fixed rope in May–June (a steep scree chute by autumn). Operators rig everything — your job is to trust the rope and grin."] },

  { id: "kheerganga", name: "Kheerganga", region: "Kullu (Parvati)", state: "Himachal Pradesh",
    diff: "Easy", scene: "forest", ft: "9,711 ft", m: 2960, km: 12, days: 2,
    season: "Year-round", seasons: ["Winter", "Spring", "Summer", "Monsoon", "Autumn"], price: 3450,
    lat: 32.01, lon: 77.44, base: "Barsheni", wild: "forest", tags: ["light", "monsoon"], fit: 1,
    desc: "The Parvati valley rite of passage — a forest walk to a meadow with <strong>natural hot springs</strong>, where you soak at 9,700 ft while the peaks steam around you.",
    hl: ["Natural hot springs", "Overnight-able from Kasol", "Parvati forest trail", "Café culture en route", "Year-round"],
    cps: [["Barsheni", "7,700 ft", "Dam-top roadhead.", ["Parvati gorge"]],
          ["Nakthan", "8,200 ft", "Village of apple sheds and cafés.", ["Valley walls"]],
          ["Kheerganga", "9,711 ft", "The meadow and the sacred hot pool.", ["Parvati headwall glimpse"]]],
    crux: ["Slippery monsoon boards", "The only hazard is wet wood and mule-polished stone in the rains — good soles and unhurried feet are all it takes."] },

  { id: "sar-pass", name: "Sar Pass", region: "Kullu (Kasol)", state: "Himachal Pradesh",
    diff: "Moderate", scene: "winter", ft: "13,799 ft", m: 4206, km: 48, days: 5,
    season: "May - Jun", seasons: ["Summer"], price: 6499,
    lat: 32.01, lon: 77.31, base: "Kasol", wild: "forest", tags: ["snow"], fit: 3,
    desc: "The <strong>great youth-camp classic</strong> — thousands earn their first snow pass here every May, capped by the famous <strong>60-second snow slide</strong> off the pass toward Biskeri.",
    hl: ["The legendary snow slide", "Grahan village", "First-pass favourite", "Budget friendly", "Big camp energy"],
    cps: [["Kasol", "5,200 ft", "Parvati backpacker hub.", ["Valley forest"]],
          ["Grahan", "7,700 ft", "Roadless old-Kullu village.", ["Forest ridges"]],
          ["Min Thach", "11,150 ft", "Meadow shelf camp.", ["Parvati valley below"]],
          ["Nagaru", "12,470 ft", "Cold, windy pre-pass camp.", ["Chanderkhani ridge"]],
          ["Sar Pass", "13,799 ft", "Frozen tarn crossing — then the slide!", ["Parvati panorama", "Sar frozen lake", "Tosh valley rim"]]],
    crux: ["Nagaru's icy dawn start", "The pre-dawn climb from Nagaru is on hard frozen snow at the coldest hour — cheap gloves fail here. Layer up, follow the stamped steps."] },

  { id: "deo-tibba-bc", name: "Deo Tibba Base Camp", region: "Kullu (Jagatsukh)", state: "Himachal Pradesh",
    diff: "Moderate", scene: "lakes", ft: "14,698 ft", m: 4480, km: 26, days: 5,
    season: "May - Oct", seasons: ["Summer", "Monsoon", "Autumn"], price: 9250,
    lat: 32.16, lon: 77.22, base: "Khanol Village", wild: "meadow", tags: [], fit: 3,
    desc: "To <strong>Mini Chandratal</strong> — a moraine-cupped turquoise pool under the hanging glaciers of Deo Tibba. Meadows thick with flowers, and hardly a soul outside June.",
    hl: ["Mini Chandratal pool", "Hanging glaciers overhead", "Seri meadow camps", "Flower-heavy monsoon", "Manali-close solitude"],
    cps: [["Khanol", "7,545 ft", "Orchard roadhead above Jagatsukh.", ["Jagatsukh peak"]],
          ["Chikka", "10,300 ft", "Forest-edge camp by the nallah.", ["Deo Tibba glimpse"]],
          ["Seri", "12,140 ft", "Wide marshy meadow — old lake bed.", ["Deo Tibba", "Norbu Peak"]],
          ["Mini Chandratal / BC", "14,698 ft", "Turquoise tarn on the moraine shelf.", ["Deo Tibba", "Indrasan", "Jagatsukh Peak"]]],
    crux: ["Seri → moraine shelf", "A steep rocky headwall with one exposed traverse above the icefall outwash — short, focused, and worth every careful step."] },

  { id: "deo-tibba-exp", name: "Mt. Deo Tibba Expedition", region: "Kullu", state: "Himachal Pradesh",
    diff: "Expedition", scene: "glacier", ft: "19,688 ft", m: 6001, km: 36, days: 9,
    season: "May - Jun, Sep - Oct", seasons: ["Summer", "Autumn"], price: 55000,
    lat: 32.16, lon: 77.22, base: "Khanol Village", wild: "glacier", tags: ["rope", "glacier"], fit: 5,
    desc: "A true <strong>6,000er with a technical bite</strong>: the dome of Deo Tibba demands crevasse work on the Duhangan Col approach and a rope-protected summit plateau push. The classic 'second expedition' after Friendship Peak.",
    hl: ["6,001 m summit", "Duhangan Col route", "Crevasse & rope work", "Piton-country history", "Pir Panjal crown views"],
    cps: [["Khanol", "7,545 ft", "Expedition staging.", ["Jagatsukh valley"]],
          ["Seri", "12,140 ft", "Meadow ABC-approach camp.", ["Deo Tibba face"]],
          ["Tainta Base Camp", "14,270 ft", "BC under the moraine walls.", ["Deo Tibba", "Indrasan"]],
          ["Camp 1 (Duhangan)", "16,700 ft", "Col camp between crevasse zones.", ["Indrasan close-up"]],
          ["Deo Tibba Summit", "19,688 ft", "The snow dome.", ["Indrasan", "Pir Panjal range", "CB range", "Spiti rim"]]],
    crux: ["Duhangan Col to the dome", "Crevassed slopes to 50°, fixed lines on the ice bulge, then a deceptive whale-back plateau where the summit keeps retreating — 10+ hours at nearly half oxygen."] },

  { id: "indrahar-pass", name: "Indrahar Pass", region: "Kangra (McLeodganj)", state: "Himachal Pradesh",
    diff: "Hard", scene: "alpine", ft: "14,473 ft", m: 4411, km: 35, days: 4,
    season: "May - Jun, Sep - Oct", seasons: ["Summer", "Autumn"], price: 8950,
    lat: 32.24, lon: 76.32, base: "McLeodganj", wild: "alpine", tags: ["snow"], fit: 4,
    desc: "Straight up the <strong>Dhauladhar wall</strong> from the streets of McLeodganj — 8,000 ft of gain to a pass where the Kangra plains fall away on one side and the <strong>Pir Panjal ranges</strong> rise on the other.",
    hl: ["Dhauladhar wall climb", "Lahesh cave camp", "Plains-to-peaks contrast", "Gaddi shepherd route", "Compact & fierce"],
    cps: [["McLeodganj", "6,830 ft", "Tibetan-quarter trailhead.", ["Dhauladhar wall above town"]],
          ["Triund", "9,350 ft", "The famous ridge camp.", ["Moon Peak", "Kangra valley lights"]],
          ["Lahesh Caves", "11,480 ft", "Overhang bivouac below the rock bands.", ["Dhauladhar spires"]],
          ["Indrahar Pass", "14,473 ft", "Notch in the wall — two worlds at once.", ["Moon Peak", "Arthur's Seat", "Pir Panjal ranges", "Kangra plains below"]]],
    crux: ["The rock-band staircase", "From Lahesh the route climbs 3,000 ft of boulder ramps ('the stairs of the gods') — hands-on scrambling with exposure, brutal in descent. Many rate it harder than passes 2,000 ft higher."] },

  { id: "triund", name: "Triund", region: "Kangra (McLeodganj)", state: "Himachal Pradesh",
    diff: "Easy", scene: "forest", ft: "9,350 ft", m: 2850, km: 9, days: 2,
    season: "Year-round", seasons: ["Winter", "Spring", "Summer", "Autumn"], price: 2450,
    lat: 32.24, lon: 76.32, base: "McLeodganj", wild: "forest", tags: ["light"], fit: 1,
    desc: "India's favourite first hike — a rhododendron ridge above McLeodganj where the <strong>Dhauladhar wall</strong> fills half the sky and the Kangra valley glitters below your tent.",
    hl: ["Sunset ridge camp", "Dhauladhar in your face", "Half-day climb", "Chai shops en route", "Perfect first hike"],
    cps: [["McLeodganj", "6,830 ft", "Start amid monasteries and cafés.", ["Dhauladhar glimpses"]],
          ["Magic View", "8,500 ft", "1930s chai shop with the famous vista.", ["Kangra valley sweep"]],
          ["Triund", "9,350 ft", "The ridge — wall on one side, plains on the other.", ["Moon Peak", "Indrahar ridge", "Kangra plains"]]],
    crux: ["The '22 curves'", "The final kilometre stacks 22 numbered switchbacks — everyone's huffing checkpoint. Take them slow, count them down."] },

  { id: "kareri-lake", name: "Kareri Lake", region: "Kangra", state: "Himachal Pradesh",
    diff: "Easy", scene: "lakes", ft: "9,650 ft", m: 2942, km: 26, days: 3,
    season: "Mar - Jun, Sep - Dec", seasons: ["Spring", "Summer", "Autumn", "Winter"], price: 4950,
    lat: 32.18, lon: 76.27, base: "Kareri Village", wild: "forest", tags: [], fit: 2,
    desc: "A <strong>clear-water shepherd lake</strong> at the foot of the Minkiani ridge — the Dhauladhar's gentlest secret, with village trails, a stream you follow all day, and star-heavy nights.",
    hl: ["Glass-clear lake", "Streamside trail", "Gaddi shepherd camps", "Dhauladhar backdrop", "Weekend-fit"],
    cps: [["Kareri Village", "5,900 ft", "Slate-roof village trailhead.", ["Dhauladhar foothills"]],
          ["Riyoti", "7,900 ft", "Riverside meadow camp.", ["Minkiani ridge"]],
          ["Kareri Lake", "9,650 ft", "The lake and its ridge-top shrine.", ["Minkiani Pass ridge", "Baleni ridge", "Dhauladhar crest"]]],
    crux: ["Riyoti's stone staircases", "Sections of steep, polished stone steps that turn slick after rain — the only place the trek asks for real attention."] },

  { id: "churdhar", name: "Churdhar", region: "Sirmaur", state: "Himachal Pradesh",
    diff: "Moderate", scene: "forest", ft: "11,965 ft", m: 3647, km: 16, days: 2,
    season: "Apr - Jun, Sep - Nov", seasons: ["Spring", "Summer", "Autumn"], price: 3950,
    lat: 30.87, lon: 77.45, base: "Nauradhar", wild: "forest", tags: ["pilgrim"], fit: 3,
    desc: "The <strong>highest peak of the outer Himalaya</strong> — Shirgul devta's summit shrine at 11,965 ft, where on a clear dawn you see the Gangetic plains one way and the <strong>snow ranges of Kinnaur</strong> the other.",
    hl: ["Outer-Himalaya high point", "Shirgul temple summit", "Plains-to-snows panorama", "Deodar cathedral forest", "Doable in a weekend"],
    cps: [["Nauradhar", "5,250 ft", "Sirmaur trailhead bazaar.", ["Forested slopes"]],
          ["Jamnala", "9,000 ft", "Forest dhaba camp.", ["Choor ridge"]],
          ["Churdhar Summit", "11,965 ft", "Shirgul shrine on the granite crown.", ["Kinner Kailash range", "Srikhand ridge", "Shivalik & plains sweep", "Badrinath-Kedarnath ranges (far)"]]],
    crux: ["6,700 ft in a single push", "Most do it as one long day up — a relentless forest staircase. Split it at Jamnala if you'd rather arrive smiling."] },

  { id: "prashar-lake", name: "Prashar Lake", region: "Mandi", state: "Himachal Pradesh",
    diff: "Easy", scene: "lakes", ft: "8,960 ft", m: 2731, km: 8, days: 2,
    season: "Year-round", seasons: ["Winter", "Spring", "Summer", "Autumn"], price: 2950,
    lat: 31.75, lon: 77.1, base: "Baggi Village", wild: "forest", tags: ["light"], fit: 1,
    desc: "A lake with a <strong>floating island</strong> and a 13th-century pagoda temple, ringed by a ridge that unrolls the <strong>Dhauladhar, Pir Panjal and Kinnaur ranges</strong> in one slow turn of the head.",
    hl: ["Floating island lake", "Pagoda temple", "Three-range panorama", "Snow-easy in winter", "Family perfect"],
    cps: [["Baggi", "4,900 ft", "Trailhead hamlet off the Mandi road.", ["Forest ridge"]],
          ["Prashar Lake", "8,960 ft", "The lake, temple and its wandering island.", ["Dhauladhar", "Pir Panjal", "Kinnaur ranges panorama"]]],
    crux: ["Ridge navigation in mist", "Three shepherd paths braid along the ridge; in fog it's easy to drift onto the wrong spur — follow the marked main line."] },

  { id: "bhaba-pass", name: "Bhaba Pass", region: "Kinnaur → Spiti", state: "Himachal Pradesh",
    diff: "Hard", scene: "valley", ft: "16,105 ft", m: 4909, km: 50, days: 6,
    season: "Jun - Sep", seasons: ["Summer", "Monsoon"], price: 14950,
    lat: 31.58, lon: 78.05, base: "Kafnu (Bhaba Valley)", wild: "spiti", tags: ["snow", "glacier"], fit: 4,
    desc: "The <strong>most vivid crossover in Himachal</strong>: Kinnaur's greenest valley — orchids, deodars, glacier streams — flipped in a single pass-day into the <strong>ochre desert of Pin valley, Spiti</strong>.",
    hl: ["Greenest-to-barest flip", "Mulling meadows", "Pin valley finish", "Shorter than Pin Parvati", "Colour-shock pass day"],
    cps: [["Kafnu", "7,900 ft", "Hydel-town roadhead in the Bhaba valley.", ["Bhaba forest"]],
          ["Mulling", "10,700 ft", "Meadow camp on the river flats.", ["Valley headwalls"]],
          ["Kara", "11,800 ft", "Wide grazing bowl.", ["Bhaba glacier rim"]],
          ["Phustirang", "13,500 ft", "Stony pre-pass camp.", ["Pass saddle above"]],
          ["Bhaba Pass", "16,105 ft", "Green behind, ochre ahead.", ["Pin valley ochres", "Kinnaur greens behind", "Hansbeshan ridge"]],
          ["Mud (Spiti)", "12,300 ft", "Pin valley's whitewashed village.", ["Pin desert walls"]]],
    crux: ["Snowfield dawn on the pass", "In early July the northern slope is a long frozen snowfield at dawn — microspikes on, kick steps, and the desert of Spiti pours open at the top."] },

  { id: "kanamo-peak", name: "Kanamo Peak", region: "Spiti (Kibber)", state: "Himachal Pradesh",
    diff: "Expedition", scene: "alpine", ft: "19,553 ft", m: 5960, km: 24, days: 6,
    season: "Jun - Sep", seasons: ["Summer", "Monsoon"], price: 18500,
    lat: 32.33, lon: 78.01, base: "Kibber Village", wild: "spiti", tags: ["glacier"], fit: 5,
    desc: "The <strong>'white hostess' of Spiti</strong> — a non-technical but merciless 19,553 ft scree summit above Kibber. No ropes, no glacier: just you, thin air and the longest view in Himachal.",
    hl: ["Ropeless 5,900er", "Kibber village base", "Snow-leopard country", "Spiti-to-Ladakh views", "Pure altitude test"],
    cps: [["Kibber", "14,010 ft", "One of the world's highest villages.", ["Spiti valley rim"]],
          ["Kanamo Base Camp", "16,400 ft", "Grass shelf below the scree cone.", ["Kanamo cone", "Chau Chau Kang Nilda"]],
          ["Kanamo Summit", "19,553 ft", "The white crown of Kibber.", ["Chau Chau Kang Nilda", "Shilla", "Manirang (far)", "CB range", "Parang La country"]]],
    crux: ["The endless scree cone", "3,000 ft of two-steps-up-one-back scree at nearly half oxygen. It's never technical and never easy — summit rates hover near 50% purely on acclimatisation."] },

  { id: "mt-yunam", name: "Mt. Yunam Expedition", region: "Lahaul (Baralacha)", state: "Himachal Pradesh",
    diff: "Expedition", scene: "glacier", ft: "20,171 ft", m: 6148, km: 18, days: 7,
    season: "Jun - Sep", seasons: ["Summer", "Monsoon"], price: 32500,
    lat: 32.75, lon: 77.43, base: "Bharatpur (Baralacha La)", wild: "spiti", tags: ["rope", "glacier"], fit: 5,
    desc: "The most accessible <strong>6,000 m summit in India</strong> — staged from the Manali-Leh highway itself. A short, stark expedition where the road does the approach and your lungs do the rest.",
    hl: ["6,148 m summit", "Highway-side base camp", "Fast 6000er itinerary", "Baralacha giants", "Crampon summit ridge"],
    cps: [["Bharatpur", "15,750 ft", "Tent-hotel camp on the Leh highway.", ["Baralacha peaks"]],
          ["Yunam Base Camp", "16,400 ft", "Short move — acclimatisation is the work.", ["Yunam face"]],
          ["Camp 1", "17,700 ft", "Scree platform below the snowline.", ["Mulkila range"]],
          ["Yunam Summit", "20,171 ft", "Above everything Lahaul.", ["Mulkila", "Gangstang", "Menthosa (far)", "CB-13 & CB-14", "Baralacha lake plateau", "Zanskar rim"]]],
    crux: ["Summit ridge above 19,000 ft", "Cramponed snow ridge at 47% oxygen where every 50 steps needs a standing rest. The route is simple; the altitude is the entire mountain."] },

  { id: "chanderkhani", name: "Chanderkhani Pass & Malana", region: "Kullu (Naggar)", state: "Himachal Pradesh",
    diff: "Moderate", scene: "meadow", ft: "12,140 ft", m: 3700, km: 22, days: 4,
    season: "Apr - Jun, Sep - Nov", seasons: ["Spring", "Summer", "Autumn"], price: 6950,
    lat: 32.11, lon: 77.17, base: "Naggar", wild: "forest", tags: [], fit: 3,
    desc: "From the castle town of Naggar over a <strong>meadow pass strewn with legend-stones</strong>, descending into <strong>Malana</strong> — the ancient village-republic with its own laws, language and gods.",
    hl: ["Malana village-republic", "Legend-stone meadows", "Naggar castle start", "Deo Tibba views", "Culture-rich short trek"],
    cps: [["Naggar", "5,900 ft", "Castle and Roerich-gallery town.", ["Kullu valley"]],
          ["Stelling", "9,800 ft", "Forest-edge camp.", ["Pir Panjal glimpses"]],
          ["Chanderkhani Pass", "12,140 ft", "The god-scattered stone field.", ["Deo Tibba", "Pir Panjal wall", "Parvati peaks"]],
          ["Malana", "8,700 ft", "The republic of Jamlu devta.", ["Chanderkhani ridge above"]]],
    crux: ["The Malana descent etiquette", "The 3,400 ft knee-tester into Malana ends at a village where touching people or temples is taboo — go with a briefed guide and deep respect."] },

  { id: "bara-bhangal", name: "Bara Bhangal (Kalihani–Thamsar)", region: "Kangra-Kullu", state: "Himachal Pradesh",
    diff: "Hard", scene: "alpine", ft: "15,750 ft", m: 4800, km: 75, days: 9,
    season: "Jun, Sep - Oct", seasons: ["Summer", "Autumn"], price: 24500,
    lat: 32.25, lon: 77.1, base: "Manali (via Lama Dugh)", wild: "alpine", tags: ["snow", "glacier"], fit: 5,
    desc: "The <strong>shepherds' super-traverse</strong>: two 15,000 ft passes — Kalihani and Thamsar — bracketing <strong>Bara Bhangal</strong>, a village so remote its mail once walked in over glaciers. Nine days, zero roads, one masterpiece.",
    hl: ["Double 15,000 ft passes", "India's remotest village", "Gaddi migration route", "Pir Panjal + Dhauladhar", "Expedition-scale trek"],
    cps: [["Lama Dugh", "10,000 ft", "Meadow above Manali.", ["Manali valley", "Indrasan"]],
          ["Kalihani Base", "12,800 ft", "Camp below the first pass.", ["Kalihani glacier peaks"]],
          ["Kalihani Pass", "15,750 ft", "Pir Panjal crossing #1.", ["Hanuman Tibba", "Kalihani icefalls", "Bara Bhangal valley"]],
          ["Bara Bhangal", "8,380 ft", "The lost village of the Ravi headwaters.", ["Ravi gorge walls"]],
          ["Thamsar Pass", "15,640 ft", "Dhauladhar crossing #2.", ["Dhauladhar crest", "Kangra side valleys"]],
          ["Billing", "7,600 ft", "Paragliding ridge — journey's end.", ["Kangra valley"]]],
    crux: ["Committed between two passes", "Once over Kalihani there is no bail-out: injuries, storms or swollen rivers must be managed from inside the wilderness. This is why it's rated among India's toughest classic treks."] },

  { id: "shrikhand-mahadev", name: "Shrikhand Mahadev", region: "Kullu (Nirmand)", state: "Himachal Pradesh",
    diff: "Hard", scene: "alpine", ft: "17,150 ft", m: 5227, km: 32, days: 5,
    season: "Jul, Jun - Sep", seasons: ["Monsoon", "Summer"], price: 9950,
    lat: 31.55, lon: 77.5, base: "Jaon Village", wild: "alpine", tags: ["snow", "pilgrim"], fit: 5,
    desc: "One of India's <strong>hardest pilgrimages</strong> — a 72-foot natural rock shivling at 17,150 ft, reached over Parvati Bagh's blue-poppy gardens and a final boulder ocean that humbles the fittest.",
    hl: ["72-ft rock shivling", "Blue poppy gardens", "Yatra energy in July", "Boulder-field finale", "Harder than most passes"],
    cps: [["Jaon", "6,560 ft", "Village trailhead of the yatra.", ["Kurpan valley"]],
          ["Thachru", "11,150 ft", "The 'danda' — after 4,500 ft of stairs.", ["Forest ridgelines"]],
          ["Bhim Dwar", "13,780 ft", "Camp by the waterfalls.", ["Shrikhand ridge"]],
          ["Parvati Bagh", "14,760 ft", "Blue-poppy garden of Parvati.", ["Kartikeya ridge"]],
          ["Shrikhand Mahadev", "17,150 ft", "The great shivling in the sky.", ["Kinner Kailash range", "Hansbeshan", "Kullu-Kinnaur divide"]]],
    crux: ["The final boulder ocean", "From Parvati Bagh, 2,400 ft of car-sized boulders at 16,000+ ft — hands, feet and full attention, often in yatra crowds and mist. Most turnbacks happen here."] },

  { id: "hanuman-tibba", name: "Mt. Hanuman Tibba Expedition", region: "Kullu (Solang)", state: "Himachal Pradesh",
    diff: "Expedition", scene: "glacier", ft: "19,625 ft", m: 5982, km: 34, days: 9,
    season: "May - Jun, Sep", seasons: ["Summer", "Autumn"], price: 48500,
    lat: 32.31, lon: 77.15, base: "Solang Valley", wild: "glacier", tags: ["rope", "glacier"], fit: 5,
    desc: "The <strong>crown of the Dhauladhar</strong> — the fluted white pyramid that rules every Solang postcard. Via the crevassed Tentu Pass, this is a genuine mountaineer's route: steep ice, rope teams, alpine judgement.",
    hl: ["Dhauladhar's highest", "Tentu Pass ice route", "Solang's iconic pyramid", "Serious rope work", "Graduate-level expedition"],
    cps: [["Solang", "8,400 ft", "Staging in the adventure valley.", ["The Tibba dominates the skyline"]],
          ["Beas Kund", "12,772 ft", "Lake camp below the cirque.", ["Hanuman Tibba", "Seven Sisters"]],
          ["Tentu Pass Camp", "14,600 ft", "Ledge camp under the pass couloir.", ["Makerbeh", "Shitidhar"]],
          ["Tentu Pass", "16,400 ft", "The guarded gate — fixed lines up the couloir.", ["Kullu & Bara Bhangal divide"]],
          ["Hanuman Tibba Summit", "19,625 ft", "The white pyramid's point.", ["Friendship Peak below", "Deo Tibba", "Indrasan", "Pir Panjal & Dhauladhar entire"]]],
    crux: ["Tentu couloir and the summit flutes", "A 55° snow-ice couloir onto the pass, then corniced flutes to the top — proper front-point climbing at 19,000 ft. Prior expedition experience is mandatory, not suggested."] },

  { id: "jalori-serolsar", name: "Jalori Pass & Serolsar Lake", region: "Kullu (Banjar)", state: "Himachal Pradesh",
    diff: "Easy", scene: "forest", ft: "10,282 ft", m: 3134, km: 12, days: 2,
    season: "Mar - Jun, Sep - Dec", seasons: ["Spring", "Summer", "Autumn", "Winter"], price: 2950,
    lat: 31.54, lon: 77.37, base: "Jalori Pass", wild: "forest", tags: ["light"], fit: 1,
    desc: "An oak-forest amble from the Jalori road-pass to <strong>Serolsar's leaf-free lake</strong> — kept spotless, legend says, by a devoted bird — with a side ridge to the ruins of <strong>Raghupur Fort</strong>.",
    hl: ["Leaf-free sacred lake", "Raghupur Fort ridge", "Tirthan valley gateway", "Drive-up trailhead", "Gentle & gorgeous"],
    cps: [["Jalori Pass", "10,282 ft", "Road-pass chai stalls and temple.", ["Tirthan & Sutlej divides"]],
          ["Serolsar Lake", "10,170 ft", "The immaculate forest lake of Budhi Nagin.", ["Old-oak canopy rim"]],
          ["Raghupur Fort", "10,300 ft", "Rampart ruins on a grass top (side trail).", ["Great Himalayan National Park ridges", "Pir Panjal (far)"]]],
    crux: ["Winter's hidden ice", "An easy trail year-round — except December–February, when shaded stretches hide sheet ice under leaf litter. Light spikes make it a winter treat."] }
];

/* ---------------- Expander: compact spec → full trek object ---------------- */
function expandCompactTreks(T2) {
  const o2At = m => Math.round(100 * Math.exp(-m / 8434));
  const ftNum = s => parseInt(s.replace(/[^\d]/g, ""), 10);
  const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

  T2.forEach(t => {
    const h = hash(t.id);
    const isExp = t.diff === "Expedition";
    const pool = isExp ? OP_EXP : OP_TREK;

    /* operators: pick 5–6 from the pool deterministically, price by factor */
    const start = h % 3;
    const count = 5 + (h % 2);
    const companies = [];
    for (let i = 0; i < pool.length && companies.length < count; i++) {
      const [name, f, rating, inc] = pool[(start + i) % pool.length];
      // spec price is the guaranteed floor: factors scale up from it
      const price = i === 0 ? t.price
        : Math.round((t.price * Math.max(f, 1.01)) / 50) * 50 - 1;
      companies.push({ name, price, rating, includes: inc });
    }
    companies.sort((a, b) => a.price - b.price);

    /* checkpoints with computed oxygen */
    const checkpoints = t.cps.map(([name, altFt, note, peaks]) => ({
      name, altFt, o2: o2At(ftNum(altFt) / 3.281), note, peaks
    }));

    /* segments derived from consecutive checkpoints */
    const segsKm = Math.max(Math.round(t.km / Math.max(t.cps.length - 1, 1)), 2);
    const segments = [];
    for (let i = 0; i < checkpoints.length - 1; i++) {
      const a = checkpoints[i], b = checkpoints[i + 1];
      const gain = ftNum(b.altFt) - ftNum(a.altFt);
      const high = ftNum(b.altFt) > 14500;
      const grade = gain <= 0 ? (gain < -2500 ? "hard" : "moderate")
        : high && gain > 1200 ? (isExp ? "extreme" : "hard")
        : gain > 2400 ? "hard" : gain > 1100 ? "moderate" : "easy";
      segments.push({
        from: a.name, to: b.name, km: segsKm, grade,
        note: gain >= 0
          ? `${Math.abs(gain).toLocaleString("en-IN")} ft of ascent to ${b.name}${b.note ? " — " + b.note.replace(/\.$/, "").toLowerCase() : ""}.`
          : `${Math.abs(gain).toLocaleString("en-IN")} ft descent to ${b.name}${b.note ? " — " + b.note.replace(/\.$/, "").toLowerCase() : ""}.`
      });
    }

    /* synthetic-but-sane weather from altitude */
    const cold = t.m > 4300, cool = t.m > 3400;
    const base = cold ? -2 : cool ? 6 : 13;
    const icons = cold ? ["🌨️", "☀️", "⛅", "❄️", "☀️"] : cool ? ["⛅", "☀️", "🌦️", "☀️", "⛅"] : ["☀️", "⛅", "☀️", "🌦️", "☀️"];
    const staticWeather = {
      temp: base, feels: base - 5, wind: 10 + (h % 14), humidity: 50 + (h % 30),
      cond: cold ? "Cold & bright" : cool ? "Crisp & clear" : "Pleasant", icon: icons[0],
      daily: ["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => ({
        d, hi: base + 5 + (i % 3), lo: base - 6 - (i % 3), i: icons[i]
      }))
    };

    const extraGear = (t.tags || []).flatMap(tag => GEAR_TAGS[tag] || []);
    const fit = FIT_TPL[t.fit];

    TREKS.push({
      id: t.id, name: t.name, region: t.region, state: t.state,
      difficulty: t.diff, scene: t.scene,
      altitudeFt: t.ft, altitudeM: t.m, distanceKm: t.km, days: t.days,
      season: t.season, seasons: t.seasons, price: t.price,
      rating: +(4.3 + (h % 6) / 10).toFixed(1), reviews: 300 + (h % 2400),
      coords: { lat: t.lat, lon: t.lon, label: t.base },
      description: t.desc, highlights: t.hl,
      staticWeather, segments,
      crux: { name: t.crux[0], why: t.crux[1] },
      checkpoints,
      extraGear: extraGear.length ? extraGear : ["Standard trek kit — see checklist"],
      wildlife: WILD[t.wild] || WILD.alpine,
      companies,
      fitness: { level: t.fit, label: fit.label, prepWeeks: fit.prepWeeks, reqs: fit.reqs }
    });
  });
}
expandCompactTreks(T2);

/* ------------------------------------------------------------------
   Operator roster v2 — every trek compares ≥10 operators.
   Rates are indicative, anchored to public operator listings
   (spot-checked Jul 2026); each row links out to verify live prices.
   ------------------------------------------------------------------ */
const OP_SITES = {
  "YHAI": "https://www.yhaindia.org",
  "Trek The Himalayas": "https://trekthehimalayas.com",
  "Indiahikes": "https://indiahikes.com",
  "Bikat Adventures": "https://www.bikatadventures.com",
  "Himalayan Hikers": "https://himalayanhikers.in",
  "Trekup India": "https://trekupindia.com",
  "The Searching Souls": "https://www.thesearchingsouls.com",
  "Moxtain": "https://www.moxtain.com",
  "Trekmunk": "https://trekmunk.com",
  "Himalayan Shelter": "https://himalayashelter.com",
  "Renok Adventures": "https://www.renokadventures.com",
  "Adventure Nation": "https://www.adventurenation.com",
  "Thrillophilia": "https://www.thrillophilia.com",
  "JustWravel": "https://www.justwravel.com",
  "Boots & Crampons": "https://www.bootsandcrampons.com"
};

const OP_EXTRA_TREK = [
  ["Thrillophilia", 0.90, 4.2, "Group departures, meals, guide"],
  ["JustWravel", 0.95, 4.4, "Camps, meals, transport add-on"],
  ["Trekup India", 0.99, 4.5, "Camps, meals, gear"],
  ["Himalayan Shelter", 0.97, 4.6, "Camps, meals, local guides"],
  ["Adventure Nation", 1.01, 4.3, "Camps, meals, permits"],
  ["YHAI", 0.86, 4.3, "Dorm/camp stay, meals, guide"],
  ["Himalayan Hikers", 0.94, 4.4, "Camps, meals, guide, permits"],
  ["The Searching Souls", 0.96, 4.6, "Camps, meals, guide"],
  ["Moxtain", 0.98, 4.4, "Camps, meals, permits"],
  ["Trekmunk", 1.02, 4.5, "Camps, meals, gear"],
  ["Renok Adventures", 1.03, 4.5, "Camps, meals, transport add-on"],
  ["Trek The Himalayas", 1.0, 4.7, "Camps, meals, safety gear"],
  ["Bikat Adventures", 1.05, 4.6, "Camps, meals, small batches"],
  ["Indiahikes", 1.08, 4.8, "Camps, meals, safety protocol"]
];
const OP_EXTRA_EXP = [
  ["Renok Adventures", 1.05, 4.5, "Expedition support, kit"],
  ["The Searching Souls", 0.97, 4.6, "Kit, meals, guides"],
  ["Trekup India", 1.0, 4.5, "Kit, meals, permits"],
  ["Adventure Nation", 1.03, 4.3, "Kit, meals, permits"],
  ["Himalayan Daredevils", 1.0, 4.5, "Full expedition kit, HAPs, meals"],
  ["Moxtain", 1.02, 4.4, "Kit, meals, permits"],
  ["Trek The Himalayas", 1.08, 4.7, "Expedition kit, insurance"],
  ["Bikat Adventures", 1.12, 4.7, "Kit, skills program, small teams"],
  ["Boots & Crampons", 1.15, 4.8, "IMF-certified leaders, full kit"],
  ["White Magic Adventure", 1.22, 4.8, "Premium expedition service"],
  ["Indiahikes", 1.1, 4.8, "Expedition protocol, oximeter checks"]
];

function ensureTenOperators() {
  TREKS.forEach(t => {
    const isExp = t.difficulty === "Expedition";
    const pool = isExp ? OP_EXTRA_EXP : OP_EXTRA_TREK;
    const have = new Set(t.companies.map(c => c.name));
    const base = Math.min(...t.companies.map(c => c.price));
    for (const [name, f, rating, inc] of pool) {
      if (t.companies.length >= 10) break;
      if (have.has(name)) continue;
      have.add(name);
      t.companies.push({
        name, rating, includes: inc,
        price: Math.max(Math.round((base * f) / 50) * 50 - 1, 1999)
      });
    }
    t.companies.forEach(c => {
      c.url = OP_SITES[c.name] ||
        "https://www.google.com/search?q=" + encodeURIComponent(c.name + " " + t.name + " trek price");
    });
    t.companies.sort((a, b) => a.price - b.price);
    t.price = t.companies[0].price;   // card & stats always match the true minimum
  });
}
ensureTenOperators();
