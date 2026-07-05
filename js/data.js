/* ============================================================
   TrekSense — data.js
   Trek knowledge base. Altitudes, oxygen % (of sea-level O2,
   barometric approximation), visible peaks, wildlife, operators.
   ============================================================ */

const BASE_GEAR = {
  "Clothing": [
    "3 quick-dry trek t-shirts", "2 fleece layers", "Padded / down jacket",
    "Thermal inners (top & bottom)", "2 trek pants", "Poncho / rain jacket",
    "Woollen cap + sun cap", "Waterproof gloves", "4–5 pairs sports socks + 1 woollen"
  ],
  "Footwear": [
    "High-ankle waterproof trekking shoes", "Lightweight sandals for campsite"
  ],
  "Gear": [
    "50–60 L rucksack with rain cover", "20 L daypack", "Trekking pole (pair recommended)",
    "Headlamp + spare batteries", "2 × 1 L water bottles / hydration pack",
    "UV-protection sunglasses", "Power bank (no charging on trail)"
  ],
  "Health & Safety": [
    "Personal first-aid kit", "Sunscreen SPF 40+ & lip balm", "Diamox (consult doctor)",
    "ORS / electrolyte sachets", "Toilet kit + toilet paper", "Govt. photo ID (2 copies)"
  ]
};

const TREKS = [
  {
    id: "kedarkantha",
    name: "Kedarkantha",
    region: "Uttarkashi",
    state: "Uttarakhand",
    difficulty: "Moderate",
    scene: "sunset",
    altitudeFt: "12,500 ft",
    altitudeM: 3810,
    distanceKm: 20,
    days: 6,
    season: "Dec - Apr",
    seasons: ["Winter", "Spring"],
    price: 7499,
    rating: 4.8,
    reviews: 2314,
    coords: { lat: 31.024, lon: 78.183, label: "Sankri Basecamp" },
    description:
      "The classic winter summit climb of the Indian Himalayas. Kedarkantha rises above the Govind Wildlife Sanctuary with pine forests, the frozen Juda Ka Talab lake and a <strong>360° summit panorama</strong> of the Gangotri and Yamunotri ranges. Snow is nearly guaranteed from late December to March, making it the most loved beginner-friendly snow trek in India.",
    highlights: ["360° summit view", "Frozen lake camp", "Snow trek", "Pine forests", "Beginner friendly"],
    staticWeather: { temp: -2, feels: -7, wind: 14, humidity: 62, cond: "Light snow", icon: "🌨️",
      daily: [ {d:"Mon",hi:3,lo:-6,i:"❄️"}, {d:"Tue",hi:4,lo:-5,i:"⛅"}, {d:"Wed",hi:2,lo:-8,i:"🌨️"}, {d:"Thu",hi:5,lo:-4,i:"☀️"}, {d:"Fri",hi:4,lo:-5,i:"⛅"} ] },
    segments: [
      { from: "Sankri", to: "Juda Ka Talab", km: 4, grade: "easy", note: "Gradual forest walk through pine and maple. Well-marked trail." },
      { from: "Juda Ka Talab", to: "Kedarkantha Base", km: 4, grade: "moderate", note: "Steady ascent through oak forest, opens into snow meadows." },
      { from: "Base", to: "Summit", km: 3, grade: "hard", note: "Pre-dawn start. Steep 60°-feel snow slope for the final 500 m; microspikes needed in winter." },
      { from: "Summit", to: "Hargaon", km: 6, grade: "moderate", note: "Long knee-testing descent — trekking poles help a lot." }
    ],
    crux: { name: "Final summit ridge (12,000 → 12,500 ft)", why: "Steep snow gradient in the dark with sub-zero windchill. The last 45 minutes is where most trekkers slow down — go slow, use microspikes and follow the guide's line." },
    checkpoints: [
      { name: "Sankri", altFt: "6,400 ft", o2: 79, note: "Roadhead village, last market & network point.", peaks: ["Greater Himalayan foothills"] },
      { name: "Juda Ka Talab", altFt: "9,100 ft", o2: 72, note: "Campsite beside a lake that freezes solid in January.", peaks: ["Kedarkantha top through clearings"] },
      { name: "Kedarkantha Base", altFt: "11,250 ft", o2: 66, note: "Open snowfields; sunset turns the range golden.", peaks: ["Bandarpoonch", "Swargarohini", "Kala Nag (Black Peak)"] },
      { name: "Kedarkantha Summit", altFt: "12,500 ft", o2: 64, note: "Small shrine on top; full 360° panorama.", peaks: ["Swargarohini", "Bandarpoonch", "Kala Nag", "Ranglana", "Gangotri range", "Yamunotri range"] }
    ],
    extraGear: ["Microspikes (usually provided)", "Gaiters for deep snow", "Insulated water bottle (bladders freeze)"],
    wildlife: [
      { name: "Himalayan Monal", emoji: "🦚", zone: "Oak & pine forest", rarity: "occasional" },
      { name: "Himalayan Langur", emoji: "🐒", zone: "Forest below Juda Ka Talab", rarity: "common" },
      { name: "Himalayan Tahr", emoji: "🐐", zone: "Ridges above treeline", rarity: "occasional" },
      { name: "Red Fox", emoji: "🦊", zone: "Snowfields near base camp", rarity: "occasional" },
      { name: "Wild Boar", emoji: "🐗", zone: "Lower forest", rarity: "common" },
      { name: "Snow Leopard", emoji: "🐆", zone: "High ridges (tracks only)", rarity: "rare" }
    ],
    companies: [
      { name: "YHAI", price: 7499, rating: 4.3, includes: "Dorm stay, meals, guide" },
      { name: "Trek The Himalayas", price: 8950, rating: 4.7, includes: "Camps, meals, microspikes, insurance" },
      { name: "Bikat Adventures", price: 9200, rating: 4.6, includes: "Camps, meals, gear, small batches" },
      { name: "Indiahikes", price: 9450, rating: 4.8, includes: "Camps, meals, safety gear, oximeter checks" },
      { name: "The Searching Souls", price: 7999, rating: 4.6, includes: "Camps, meals, guide" },
      { name: "Moxtain", price: 8199, rating: 4.4, includes: "Camps, meals, permits" },
      { name: "Trekmunk", price: 8499, rating: 4.5, includes: "Camps, meals, bonfire nights" },
      { name: "Himalayan Shelter", price: 8750, rating: 4.6, includes: "Camps, meals, local guides" }
    ],
    fitness: {
      level: 2, label: "Easy–Moderate", prepWeeks: 4,
      reqs: [
        { icon: "🏃", text: "<b>Jog 5 km in 35–40 min</b> comfortably before the trek" },
        { icon: "🪜", text: "Climb <b>4 flights of stairs</b> without gasping" },
        { icon: "🎒", text: "Practice walking with a <b>6–8 kg backpack</b>" },
        { icon: "🧘", text: "Basic squats & lunges — <b>3 sets of 15</b>, for the descent" }
      ]
    }
  },

  {
    id: "roopkund",
    name: "Roopkund",
    region: "Chamoli",
    state: "Uttarakhand",
    difficulty: "Hard",
    scene: "valley",
    altitudeFt: "15,696 ft",
    altitudeM: 4784,
    distanceKm: 53,
    days: 8,
    season: "May - Jun, Sep - Oct",
    seasons: ["Summer", "Autumn"],
    price: 10999,
    rating: 4.7,
    reviews: 1847,
    coords: { lat: 30.262, lon: 79.732, label: "Lohajung Basecamp" },
    description:
      "The legendary trail to the <strong>mystery skeleton lake</strong> at 15,696 ft, crossing Ali and Bedni Bugyal — Asia's most beautiful high-altitude meadows. A serious high-altitude trek where weather, altitude and the final scree climb demand respect and real preparation.",
    highlights: ["Skeleton lake", "Ali & Bedni Bugyal", "Mt. Trishul up close", "High altitude", "Alpine meadows"],
    staticWeather: { temp: 4, feels: -1, wind: 22, humidity: 55, cond: "Partly cloudy", icon: "⛅",
      daily: [ {d:"Mon",hi:9,lo:-2,i:"⛅"}, {d:"Tue",hi:8,lo:-3,i:"🌦️"}, {d:"Wed",hi:10,lo:-1,i:"☀️"}, {d:"Thu",hi:7,lo:-4,i:"🌨️"}, {d:"Fri",hi:9,lo:-2,i:"⛅"} ] },
    segments: [
      { from: "Lohajung", to: "Didna", km: 7, grade: "moderate", note: "Sharp descent to Neel Ganga, then a stiff climb to the village." },
      { from: "Didna", to: "Ali Bugyal", km: 6, grade: "hard", note: "Relentless 3,000 ft climb through oak forest — the fitness test of the trek." },
      { from: "Ali Bugyal", to: "Patar Nachauni", km: 7, grade: "easy", note: "Rolling walk across open meadows with Trishul ahead." },
      { from: "Patar Nachauni", to: "Bhagwabasa", km: 5, grade: "hard", note: "Steep switchbacks past Kalu Vinayak temple; altitude starts to bite." },
      { from: "Bhagwabasa", to: "Roopkund", km: 5, grade: "extreme", note: "3 AM start. Snow and loose scree at 15,000+ ft, thin air, sub-zero winds." }
    ],
    crux: { name: "Bhagwabasa → Roopkund (14,100 → 15,696 ft)", why: "The hardest stretch: hard-packed snow till June, loose scree in autumn, and only ~57% of sea-level oxygen. Turnaround discipline matters — summit by 8 AM or turn back." },
    checkpoints: [
      { name: "Lohajung", altFt: "7,600 ft", o2: 76, note: "Basecamp village with the last proper meals.", peaks: ["Nanda Ghunti glimpse"] },
      { name: "Didna", altFt: "8,045 ft", o2: 75, note: "Tiny farming hamlet on a shelf above the gorge.", peaks: ["Neel Ganga valley walls"] },
      { name: "Ali Bugyal", altFt: "11,320 ft", o2: 66, note: "Vast velvet meadow — one of the finest campsites in India.", peaks: ["Trishul", "Nanda Ghunti"] },
      { name: "Patar Nachauni", altFt: "12,818 ft", o2: 63, note: "Windy grassy shelf; acclimatisation walk recommended.", peaks: ["Trishul", "Nanda Ghunti", "Chaukhamba (far)"] },
      { name: "Bhagwabasa", altFt: "14,100 ft", o2: 60, note: "Rocky, cold summit camp. Sleep early, hydrate.", peaks: ["Trishul face", "Nanda Ghunti"] },
      { name: "Roopkund Lake", altFt: "15,696 ft", o2: 57, note: "The skeleton lake, in a glacial bowl below Junargali.", peaks: ["Trishul", "Nanda Ghunti", "Chaukhamba", "Neelkanth", "Kedarnath dome"] }
    ],
    extraGear: ["Microspikes & gaiters (May–Jun)", "Balaclava", "Insulated summit gloves", "Knee caps for the long descent"],
    wildlife: [
      { name: "Himalayan Monal", emoji: "🦚", zone: "Didna–Ali forest", rarity: "occasional" },
      { name: "Himalayan Black Bear", emoji: "🐻", zone: "Oak forest (dawn/dusk)", rarity: "rare" },
      { name: "Himalayan Griffon", emoji: "🦅", zone: "Above the bugyals", rarity: "common" },
      { name: "Musk Deer", emoji: "🦌", zone: "Treeline near Ghora Lotani", rarity: "rare" },
      { name: "Himalayan Weasel", emoji: "🦡", zone: "Meadow burrows", rarity: "occasional" },
      { name: "Sheep & Bharal", emoji: "🐏", zone: "Bugyals (grazing herds)", rarity: "common" }
    ],
    companies: [
      { name: "Himalayan Hikers", price: 10999, rating: 4.4, includes: "Camps, meals, guide, permits" },
      { name: "Trek The Himalayas", price: 12450, rating: 4.7, includes: "Camps, meals, safety gear, insurance" },
      { name: "Indiahikes", price: 13750, rating: 4.8, includes: "Camps, meals, oximeter protocol, offloading extra" },
      { name: "Bikat Adventures", price: 12900, rating: 4.6, includes: "Camps, meals, technical briefings" },
      { name: "Moxtain", price: 11999, rating: 4.4, includes: "Camps, meals, permits" },
      { name: "Trekmunk", price: 12499, rating: 4.5, includes: "Camps, meals, gear" },
      { name: "Adventure Nation", price: 12750, rating: 4.3, includes: "Camps, meals, transport add-on" }
    ],
    fitness: {
      level: 4, label: "Demanding", prepWeeks: 8,
      reqs: [
        { icon: "🏃", text: "<b>Jog 5 km in under 30 min</b>, 4× a week" },
        { icon: "⛰️", text: "Prior <b>high-altitude trek experience</b> strongly recommended" },
        { icon: "🎒", text: "Train with a <b>10 kg pack on stairs</b> — 30 min sessions" },
        { icon: "❤️", text: "Resting heart rate ideally <b>below 70 bpm</b>" },
        { icon: "🩺", text: "Medical certificate required by most operators" }
      ]
    }
  },

  {
    id: "hampta-pass",
    name: "Hampta Pass",
    region: "Kullu",
    state: "Himachal Pradesh",
    difficulty: "Moderate",
    scene: "green",
    altitudeFt: "14,065 ft",
    altitudeM: 4287,
    distanceKm: 26,
    days: 5,
    season: "Jun - Sep",
    seasons: ["Summer", "Monsoon"],
    price: 8999,
    rating: 4.7,
    reviews: 1962,
    coords: { lat: 32.276, lon: 77.223, label: "Jobra Basecamp" },
    description:
      "A dramatic <strong>crossover trek</strong>: start in the lush green Kullu valley, cross the narrow Hampta corridor and descend into the stark brown moonscape of Lahaul — two worlds in five days, capped with an optional drive to the blue Chandratal lake.",
    highlights: ["Valley crossover", "Chandratal add-on", "River crossings", "Glacial valleys", "Monsoon-safe"],
    staticWeather: { temp: 11, feels: 8, wind: 12, humidity: 71, cond: "Scattered showers", icon: "🌦️",
      daily: [ {d:"Mon",hi:15,lo:6,i:"🌦️"}, {d:"Tue",hi:16,lo:7,i:"⛅"}, {d:"Wed",hi:14,lo:5,i:"🌧️"}, {d:"Thu",hi:17,lo:7,i:"☀️"}, {d:"Fri",hi:15,lo:6,i:"⛅"} ] },
    segments: [
      { from: "Jobra", to: "Chika", km: 2, grade: "easy", note: "Gentle warm-up beside the Rani Nallah stream." },
      { from: "Chika", to: "Balu Ka Ghera", km: 8, grade: "moderate", note: "Boulder sections and icy river crossings — start early when water is low." },
      { from: "Balu Ka Ghera", to: "Hampta Pass", km: 5, grade: "hard", note: "Steep zig-zag climb to the pass; snow patches till July." },
      { from: "Hampta Pass", to: "Shea Goru", km: 4, grade: "hard", note: "Sharp, slippery descent on the Lahaul side — the trickiest part." },
      { from: "Shea Goru", to: "Chatru", km: 7, grade: "moderate", note: "Gradual walk down a barren glacial valley." }
    ],
    crux: { name: "Pass day: Balu Ka Ghera → Shea Goru", why: "A 9-hour day combining a steep snow climb with an even steeper scree descent. The descent off the pass is short but very slippery — poles and focus required." },
    checkpoints: [
      { name: "Jobra", altFt: "9,800 ft", o2: 70, note: "Roadhead 45 min from Manali.", peaks: ["Dhauladhar glimpses"] },
      { name: "Balu Ka Ghera", altFt: "11,900 ft", o2: 65, note: "Sandy riverside camp — 'bed of sand'.", peaks: ["Deo Tibba", "Hampta ridgeline"] },
      { name: "Hampta Pass", altFt: "14,065 ft", o2: 60, note: "Narrow pass — green Kullu behind, brown Lahaul ahead.", peaks: ["Deo Tibba", "Indrasan"] },
      { name: "Chatru", altFt: "11,000 ft", o2: 67, note: "Desert-like camp at the meeting of three passes.", peaks: ["Spiti-side ranges", "CB range (far)"] }
    ],
    extraGear: ["River-crossing sandals with straps", "Quick-dry towel", "Extra dry-bags for monsoon"],
    wildlife: [
      { name: "Himalayan Marmot", emoji: "🦫", zone: "Meadows above Chika", rarity: "common" },
      { name: "Snow Pigeon", emoji: "🕊️", zone: "Cliffs near the pass", rarity: "common" },
      { name: "Himalayan Ibex", emoji: "🐐", zone: "Lahaul-side slopes", rarity: "occasional" },
      { name: "Golden Eagle", emoji: "🦅", zone: "Above Balu Ka Ghera", rarity: "occasional" },
      { name: "Himalayan Pika", emoji: "🐹", zone: "Boulder fields", rarity: "common" }
    ],
    companies: [
      { name: "Trek The Himalayas", price: 9250, rating: 4.7, includes: "Camps, meals, Chandratal drive" },
      { name: "Indiahikes", price: 10450, rating: 4.8, includes: "Camps, meals, safety protocol" },
      { name: "Bikat Adventures", price: 9950, rating: 4.6, includes: "Camps, meals, gear" },
      { name: "Himalayan Hikers", price: 9400, rating: 4.3, includes: "Camps, meals, guide" },
      { name: "The Searching Souls", price: 8999, rating: 4.6, includes: "Camps, meals, Chandratal add-on" },
      { name: "Moxtain", price: 9100, rating: 4.4, includes: "Camps, meals, permits" },
      { name: "Renok Adventures", price: 9800, rating: 4.5, includes: "Camps, meals, Manali pickup" }
    ],
    fitness: {
      level: 3, label: "Moderate", prepWeeks: 6,
      reqs: [
        { icon: "🏃", text: "<b>Jog 5 km in 33–35 min</b> before the trek" },
        { icon: "🪨", text: "Practice on <b>uneven terrain</b> — boulders need ankle strength" },
        { icon: "🎒", text: "Comfortable carrying <b>8–9 kg</b> for 6-hour days" },
        { icon: "🦵", text: "Strong knees for the pass-day descent — <b>lunges & step-downs</b>" }
      ]
    }
  },

  {
    id: "valley-of-flowers",
    name: "Valley of Flowers",
    region: "Chamoli",
    state: "Uttarakhand",
    difficulty: "Easy",
    scene: "floral",
    altitudeFt: "14,107 ft",
    altitudeM: 4300,
    distanceKm: 38,
    days: 6,
    season: "Jul - Sep",
    seasons: ["Monsoon"],
    price: 8499,
    rating: 4.6,
    reviews: 2891,
    coords: { lat: 30.728, lon: 79.605, label: "Ghangaria" },
    description:
      "A UNESCO World Heritage site that erupts into <strong>600+ species of alpine flowers</strong> every monsoon. Paired with the glacial lake of Hemkund Sahib at 14,107 ft, this is the gentlest gateway into Himalayan trekking — with real altitude on the Hemkund day.",
    highlights: ["UNESCO site", "600+ flower species", "Hemkund Sahib", "Waterfalls", "Family friendly"],
    staticWeather: { temp: 12, feels: 10, wind: 8, humidity: 88, cond: "Misty drizzle", icon: "🌧️",
      daily: [ {d:"Mon",hi:16,lo:9,i:"🌧️"}, {d:"Tue",hi:15,lo:9,i:"🌦️"}, {d:"Wed",hi:17,lo:10,i:"⛅"}, {d:"Thu",hi:16,lo:9,i:"🌧️"}, {d:"Fri",hi:15,lo:8,i:"🌦️"} ] },
    segments: [
      { from: "Govindghat", to: "Ghangaria", km: 9, grade: "moderate", note: "Long paved mule track along the Pushpawati river. Gradual but lengthy." },
      { from: "Ghangaria", to: "Valley of Flowers", km: 4, grade: "easy", note: "Gentle valley walk among flowerbeds and glacier snouts." },
      { from: "Ghangaria", to: "Hemkund Sahib", km: 6, grade: "hard", note: "1,300 m of steep stone steps to 14,107 ft — the real test of the trip." }
    ],
    crux: { name: "Ghangaria → Hemkund Sahib", why: "A relentless stone staircase gaining 4,000+ ft in 6 km, often in rain. Altitude arrives fast — many visitors feel it above the treeline. Start at dawn and pace steadily." },
    checkpoints: [
      { name: "Govindghat", altFt: "6,000 ft", o2: 80, note: "Riverside trailhead on the Badrinath highway.", peaks: ["Alaknanda gorge walls"] },
      { name: "Ghangaria", altFt: "10,000 ft", o2: 69, note: "Bustling hamlet — base for both valleys.", peaks: ["Hathi Parvat glimpse"] },
      { name: "Valley of Flowers", altFt: "11,500 ft", o2: 66, note: "3 km carpet of blooms below glacier walls.", peaks: ["Rataban", "Nilgiri Parvat"] },
      { name: "Hemkund Sahib", altFt: "14,107 ft", o2: 60, note: "Glacial lake & gurudwara in a stone amphitheatre.", peaks: ["Saptrishi peaks", "Hathi Parvat"] }
    ],
    extraGear: ["Umbrella + full rain cover (monsoon trek)", "Anti-leech salt/spray", "Extra pair of dry shoes for camp"],
    wildlife: [
      { name: "Blue Sheep (Bharal)", emoji: "🐏", zone: "Slopes above Hemkund", rarity: "occasional" },
      { name: "Himalayan Musk Deer", emoji: "🦌", zone: "Birch thickets in the valley", rarity: "rare" },
      { name: "Himalayan Monal", emoji: "🦚", zone: "Forest near Ghangaria", rarity: "occasional" },
      { name: "Butterflies & moths", emoji: "🦋", zone: "Everywhere in bloom season", rarity: "common" },
      { name: "Himalayan Black Bear", emoji: "🐻", zone: "Lower forests", rarity: "rare" }
    ],
    companies: [
      { name: "Garhwal Treks Co.", price: 8499, rating: 4.2, includes: "Lodge stay, meals, guide" },
      { name: "Trek The Himalayas", price: 9950, rating: 4.7, includes: "Lodges, meals, permits" },
      { name: "Indiahikes", price: 10800, rating: 4.8, includes: "Lodges, meals, naturalist guide" },
      { name: "Bikat Adventures", price: 9600, rating: 4.5, includes: "Lodges, meals, permits" },
      { name: "Himalayan Shelter", price: 8999, rating: 4.6, includes: "Lodges, meals, local guides" },
      { name: "Trekmunk", price: 9250, rating: 4.5, includes: "Lodges, meals, permits" },
      { name: "Moxtain", price: 9400, rating: 4.4, includes: "Lodges, meals, transport add-on" }
    ],
    fitness: {
      level: 2, label: "Easy–Moderate", prepWeeks: 3,
      reqs: [
        { icon: "🚶", text: "<b>Walk 5 km in ~50 min</b> comfortably" },
        { icon: "🪜", text: "Stair practice helps a lot for the <b>Hemkund step climb</b>" },
        { icon: "🎒", text: "Only a <b>daypack (3–4 kg)</b> needed — luggage stays in Ghangaria" }
      ]
    }
  },

  {
    id: "brahmatal",
    name: "Brahmatal",
    region: "Chamoli",
    state: "Uttarakhand",
    difficulty: "Moderate",
    scene: "winter",
    altitudeFt: "12,250 ft",
    altitudeM: 3734,
    distanceKm: 24,
    days: 6,
    season: "Dec - Mar",
    seasons: ["Winter"],
    price: 7999,
    rating: 4.6,
    reviews: 1420,
    coords: { lat: 30.128, lon: 79.623, label: "Lohajung Basecamp" },
    description:
      "The winter trek for <strong>ridge-walk lovers</strong>. Brahmatal serves two frozen alpine lakes, snow-laden oak forests and a summit ridge that stares straight at Mt. Trishul and Nanda Ghunti — arguably the best mountain views per effort in Uttarakhand.",
    highlights: ["Two frozen lakes", "Trishul face view", "Summit ridge walk", "Snow forests", "Short drive from Kathgodam"],
    staticWeather: { temp: -1, feels: -6, wind: 16, humidity: 58, cond: "Clear & cold", icon: "☀️",
      daily: [ {d:"Mon",hi:4,lo:-7,i:"☀️"}, {d:"Tue",hi:3,lo:-8,i:"⛅"}, {d:"Wed",hi:2,lo:-9,i:"🌨️"}, {d:"Thu",hi:5,lo:-6,i:"☀️"}, {d:"Fri",hi:4,lo:-7,i:"⛅"} ] },
    segments: [
      { from: "Lohajung", to: "Bekaltal", km: 6, grade: "moderate", note: "Steady climb through oak and rhododendron to the first frozen lake." },
      { from: "Bekaltal", to: "Brahmatal camp", km: 7, grade: "moderate", note: "Ridge sections with big Himalayan views; deep snow in Jan–Feb." },
      { from: "Camp", to: "Brahmatal summit", km: 5, grade: "hard", note: "Exposed, windy summit ridge — cold burns more energy than the gradient." },
      { from: "Summit", to: "Lohajung", km: 6, grade: "moderate", note: "Long descent via Daldum; slippery packed snow." }
    ],
    crux: { name: "Summit ridge in high wind", why: "The gradient is honest, but January windchill on the exposed ridge can drop the feel to −15 °C. Layer right, keep moving, and protect fingers during photo stops." },
    checkpoints: [
      { name: "Lohajung", altFt: "7,600 ft", o2: 76, note: "Shared basecamp with the Roopkund trail.", peaks: ["Nanda Ghunti glimpse"] },
      { name: "Bekaltal", altFt: "9,690 ft", o2: 70, note: "Frozen lake hidden in oak forest.", peaks: ["Forested ridgelines"] },
      { name: "Brahmatal Lake", altFt: "10,800 ft", o2: 68, note: "Sacred frozen lake below the summit ridge.", peaks: ["Trishul", "Nanda Ghunti"] },
      { name: "Brahmatal Summit", altFt: "12,250 ft", o2: 64, note: "Panoramic ridge-top viewpoint.", peaks: ["Trishul", "Nanda Ghunti", "Neelkanth (far)", "Hathi-Ghoda peaks"] }
    ],
    extraGear: ["Microspikes & gaiters", "Thermos flask", "Hand-warmer sachets"],
    wildlife: [
      { name: "Himalayan Monal", emoji: "🦚", zone: "Rhododendron forest", rarity: "occasional" },
      { name: "Koklass Pheasant", emoji: "🐦", zone: "Oak forest near Bekaltal", rarity: "occasional" },
      { name: "Red Fox", emoji: "🦊", zone: "Snowline (fresh tracks common)", rarity: "occasional" },
      { name: "Himalayan Langur", emoji: "🐒", zone: "Lower forest", rarity: "common" },
      { name: "Himalayan Black Bear", emoji: "🐻", zone: "Hibernating in winter — dens", rarity: "rare" }
    ],
    companies: [
      { name: "Himalayan Hikers", price: 7999, rating: 4.4, includes: "Camps, meals, guide" },
      { name: "Trek The Himalayas", price: 9450, rating: 4.7, includes: "Camps, meals, microspikes" },
      { name: "Indiahikes", price: 9950, rating: 4.8, includes: "Camps, meals, safety checks" },
      { name: "Trekup India", price: 8500, rating: 4.5, includes: "Camps, meals, gear" },
      { name: "The Searching Souls", price: 8250, rating: 4.6, includes: "Camps, meals, guide" },
      { name: "Trekmunk", price: 8799, rating: 4.5, includes: "Camps, meals, permits" },
      { name: "Renok Adventures", price: 8999, rating: 4.5, includes: "Camps, meals, gear" }
    ],
    fitness: {
      level: 2, label: "Easy–Moderate", prepWeeks: 4,
      reqs: [
        { icon: "🏃", text: "<b>Jog 5 km in 35–40 min</b> comfortably" },
        { icon: "🥶", text: "Cold tolerance matters — <b>train outdoors in winter</b> if possible" },
        { icon: "🎒", text: "Carry <b>7–8 kg</b> comfortably on climbs" }
      ]
    }
  },

  {
    id: "kashmir-great-lakes",
    name: "Kashmir Great Lakes",
    region: "Ganderbal",
    state: "Jammu & Kashmir",
    difficulty: "Hard",
    scene: "lakes",
    altitudeFt: "13,750 ft",
    altitudeM: 4191,
    distanceKm: 72,
    days: 8,
    season: "Jul - Sep",
    seasons: ["Summer", "Monsoon"],
    price: 13499,
    rating: 4.9,
    reviews: 2107,
    coords: { lat: 34.36, lon: 75.29, label: "Sonamarg (Shitkadi)" },
    description:
      "Widely called <strong>India's most beautiful trek</strong> — seven alpine lakes in seven days, three passes above 13,000 ft, and meadows that out-green Switzerland. Long daily distances and back-to-back pass days make it a stamina trek rather than a technical one.",
    highlights: ["7 alpine lakes", "3 high passes", "Gadsar valley flowers", "Maple & birch forests", "Camping beside lakes"],
    staticWeather: { temp: 9, feels: 6, wind: 18, humidity: 64, cond: "Bright intervals", icon: "⛅",
      daily: [ {d:"Mon",hi:14,lo:4,i:"⛅"}, {d:"Tue",hi:15,lo:5,i:"☀️"}, {d:"Wed",hi:12,lo:3,i:"🌦️"}, {d:"Thu",hi:14,lo:4,i:"⛅"}, {d:"Fri",hi:13,lo:4,i:"☀️"} ] },
    segments: [
      { from: "Shitkadi", to: "Nichnai", km: 11, grade: "moderate", note: "Long first day through maple forest and shepherd meadows." },
      { from: "Nichnai", to: "Vishansar", km: 12, grade: "hard", note: "Nichnai Pass (13,100 ft) plus a 12 km day — stamina test #1." },
      { from: "Vishansar", to: "Gadsar", km: 14, grade: "extreme", note: "Gadsar Pass (13,750 ft), the trek's highest point, then a long descent past flower valleys." },
      { from: "Gadsar", to: "Satsar", km: 9, grade: "moderate", note: "Army check-post day; rolling meadow trail." },
      { from: "Satsar", to: "Gangabal", km: 11, grade: "hard", note: "Zaj Pass boulder ridge, then twin lakes below Harmukh." },
      { from: "Gangabal", to: "Naranag", km: 13, grade: "hard", note: "Brutal 4,500 ft knee-hammering descent to the roadhead." }
    ],
    crux: { name: "Vishansar → Gadsar over Gadsar Pass", why: "The highest and longest day: a steep snow-flecked climb to 13,750 ft followed by 9 km of descent. Weather turns fast on the pass — buffer time is built in for a reason." },
    checkpoints: [
      { name: "Shitkadi (Sonamarg)", altFt: "7,800 ft", o2: 75, note: "Trailhead above the Sindh river.", peaks: ["Thajiwas glacier ridge"] },
      { name: "Nichnai", altFt: "11,500 ft", o2: 66, note: "Wide valley camp between rock walls.", peaks: ["Nichnai Pass ramparts"] },
      { name: "Vishansar Lake", altFt: "12,000 ft", o2: 65, note: "First great lake; trout-filled blue water.", peaks: ["Vishansar peak", "Kishansar peak"] },
      { name: "Gadsar Pass", altFt: "13,750 ft", o2: 61, note: "Highest point — twin-lake view behind, Gadsar ahead.", peaks: ["Kishansar & Vishansar from above", "Gadsar valley spires"] },
      { name: "Satsar", altFt: "12,000 ft", o2: 65, note: "Chain of seven ponds among boulders.", peaks: ["Zaj Pass ridge"] },
      { name: "Gangabal Twin Lakes", altFt: "11,500 ft", o2: 66, note: "Grand finale below Mt. Harmukh.", peaks: ["Mt. Harmukh & its glacier"] }
    ],
    extraGear: ["ID verification documents (army checks)", "Extra socks — daily stream crossings", "Light gloves for boulder sections"],
    wildlife: [
      { name: "Himalayan Marmot", emoji: "🦫", zone: "Gadsar & Satsar meadows", rarity: "common" },
      { name: "Hangul (Kashmir stag)", emoji: "🦌", zone: "Lower forest (very shy)", rarity: "rare" },
      { name: "Himalayan Brown Bear", emoji: "🐻", zone: "Remote side valleys", rarity: "rare" },
      { name: "Golden Eagle", emoji: "🦅", zone: "Above the passes", rarity: "occasional" },
      { name: "Alpine Trout", emoji: "🐟", zone: "Vishansar & Gangabal lakes", rarity: "common" },
      { name: "Bakarwal herding dogs", emoji: "🐕", zone: "With shepherd camps", rarity: "common" }
    ],
    companies: [
      { name: "Kashmir Treks", price: 13499, rating: 4.5, includes: "Camps, meals, permits, ponies" },
      { name: "Trek The Himalayas", price: 14950, rating: 4.7, includes: "Camps, meals, insurance" },
      { name: "Indiahikes", price: 15450, rating: 4.9, includes: "Camps, meals, safety protocol" },
      { name: "Bikat Adventures", price: 14500, rating: 4.6, includes: "Camps, meals, gear" },
      { name: "Moxtain", price: 13750, rating: 4.4, includes: "Camps, meals, permits" },
      { name: "Trekmunk", price: 13999, rating: 4.5, includes: "Camps, meals, ponies" },
      { name: "Renok Adventures", price: 14250, rating: 4.5, includes: "Camps, meals, Srinagar pickup" }
    ],
    fitness: {
      level: 4, label: "Demanding", prepWeeks: 8,
      reqs: [
        { icon: "🏃", text: "<b>Jog 5 km in under 30 min</b> — long days need engine, not sprint" },
        { icon: "📏", text: "Comfortable walking <b>12–14 km/day</b> for 3 days in a row" },
        { icon: "🎒", text: "Train with <b>9–10 kg</b>; offloading available but limited" },
        { icon: "🦵", text: "Descent training — the last day drops <b>4,500 ft</b>" }
      ]
    }
  },

  {
    id: "goechala",
    name: "Goechala",
    region: "West Sikkim",
    state: "Sikkim",
    difficulty: "Hard",
    scene: "alpine",
    altitudeFt: "15,100 ft",
    altitudeM: 4603,
    distanceKm: 90,
    days: 10,
    season: "Apr - May, Oct - Nov",
    seasons: ["Spring", "Autumn"],
    price: 15950,
    rating: 4.8,
    reviews: 986,
    coords: { lat: 27.366, lon: 88.221, label: "Yuksom Basecamp" },
    description:
      "The pilgrimage to <strong>Kanchenjunga's doorstep</strong>. Ten days through Sikkim's cloud forests and rhododendron tunnels to the Goechala viewpoint, where the world's third-highest mountain fills the entire horizon at sunrise. Long, remote and profoundly rewarding.",
    highlights: ["Kanchenjunga sunrise", "Samiti Lake", "Rhododendron forests", "Dzongri ridge", "Remote & wild"],
    staticWeather: { temp: 5, feels: 1, wind: 15, humidity: 74, cond: "High cloud", icon: "🌥️",
      daily: [ {d:"Mon",hi:10,lo:-2,i:"🌥️"}, {d:"Tue",hi:11,lo:-1,i:"☀️"}, {d:"Wed",hi:9,lo:-3,i:"⛅"}, {d:"Thu",hi:8,lo:-4,i:"🌨️"}, {d:"Fri",hi:10,lo:-2,i:"☀️"} ] },
    segments: [
      { from: "Yuksom", to: "Tshoka", km: 16, grade: "hard", note: "Two big forest days (via Sachen) with suspension bridges and 4,000 ft of gain." },
      { from: "Tshoka", to: "Dzongri", km: 9, grade: "hard", note: "Steep haul through rhododendrons to the alpine shelf; acclimatisation day here." },
      { from: "Dzongri", to: "Thansing", km: 10, grade: "moderate", note: "Drop to the Prek Chu river, then a gentle valley rise." },
      { from: "Thansing", to: "Lamuney", km: 4, grade: "easy", note: "Short flat walk — save legs for summit night." },
      { from: "Lamuney", to: "Goechala VP1", km: 5, grade: "extreme", note: "3 AM start past Samiti Lake, moraine scramble at 15,000 ft in the dark." }
    ],
    crux: { name: "Lamuney → View Point 1 (15,100 ft)", why: "Rocky moraine in pre-dawn dark with ~58% oxygen. The reward is the greatest sunrise viewpoint in the Indian Himalaya — Kanchenjunga igniting gold." },
    checkpoints: [
      { name: "Yuksom", altFt: "5,670 ft", o2: 81, note: "Historic first capital of Sikkim.", peaks: ["Forested Rathong valley"] },
      { name: "Tshoka", altFt: "9,700 ft", o2: 70, note: "Monastery hamlet above the clouds.", peaks: ["Pandim glimpse"] },
      { name: "Dzongri Top", altFt: "13,120 ft", o2: 62, note: "Sunrise ridge — prayer flags and a peak parade.", peaks: ["Kanchenjunga", "Kabru N & S", "Rathong", "Koktang", "Pandim"] },
      { name: "Thansing", altFt: "12,900 ft", o2: 63, note: "Broad valley camp under Pandim's wall.", peaks: ["Pandim", "Tenzingkhang"] },
      { name: "Samiti Lake", altFt: "14,100 ft", o2: 60, note: "Sacred emerald lake — mirror-still at dawn.", peaks: ["Pandim reflection"] },
      { name: "Goechala View Point 1", altFt: "15,100 ft", o2: 58, note: "Face-to-face with the Kanchenjunga massif.", peaks: ["Kanchenjunga (8,586 m)", "Goecha peak", "Pandim", "Kabru massif"] }
    ],
    extraGear: ["−10 °C rated sleeping bag (verify with operator)", "Gaiters", "Water purification tablets", "Extra camera batteries (cold drains fast)"],
    wildlife: [
      { name: "Red Panda", emoji: "🐼", zone: "Bamboo forest below Tshoka", rarity: "rare" },
      { name: "Blood Pheasant", emoji: "🐦", zone: "Rhododendrons near Dzongri", rarity: "occasional" },
      { name: "Himalayan Tahr", emoji: "🐐", zone: "Cliffs above Prek Chu", rarity: "occasional" },
      { name: "Yak caravans", emoji: "🐃", zone: "Dzongri–Thansing trail", rarity: "common" },
      { name: "Himalayan Black Bear", emoji: "🐻", zone: "Lower forest", rarity: "rare" },
      { name: "Snow Leopard", emoji: "🐆", zone: "High moraines (camera-trap country)", rarity: "rare" }
    ],
    companies: [
      { name: "Sikkim Alpine Co.", price: 15950, rating: 4.4, includes: "Camps, meals, permits, yaks" },
      { name: "Indiahikes", price: 18500, rating: 4.8, includes: "Camps, meals, full safety protocol" },
      { name: "Trek The Himalayas", price: 17450, rating: 4.7, includes: "Camps, meals, permits" },
      { name: "Bikat Adventures", price: 17900, rating: 4.6, includes: "Camps, meals, gear support" },
      { name: "Trekmunk", price: 16500, rating: 4.5, includes: "Camps, meals, permits, yaks" },
      { name: "White Magic Adventure", price: 17999, rating: 4.8, includes: "Premium camps, certified guides" }
    ],
    fitness: {
      level: 5, label: "Strenuous", prepWeeks: 10,
      reqs: [
        { icon: "🏃", text: "<b>10 km runs</b> comfortably, 3–4× a week" },
        { icon: "⛰️", text: "<b>Multi-day trek experience above 13,000 ft</b> required by most operators" },
        { icon: "🎒", text: "Back-to-back <b>15 km training walks</b> with 10 kg" },
        { icon: "🩺", text: "Medical + fitness certificate mandatory" },
        { icon: "🧠", text: "Mental stamina — 10 days off-grid in cold, wet forest" }
      ]
    }
  },

  {
    id: "har-ki-dun",
    name: "Har Ki Dun",
    region: "Uttarkashi",
    state: "Uttarakhand",
    difficulty: "Easy",
    scene: "forest",
    altitudeFt: "11,675 ft",
    altitudeM: 3559,
    distanceKm: 47,
    days: 7,
    season: "Mar - Jun, Sep - Dec",
    seasons: ["Spring", "Summer", "Autumn", "Winter"],
    price: 8799,
    rating: 4.5,
    reviews: 1655,
    coords: { lat: 31.095, lon: 78.32, label: "Taluka Trailhead" },
    description:
      "The <strong>'Valley of Gods'</strong> — a gentle river-valley walk into Garhwal's oldest villages, wooden temples and swaying wheat fields, ending in a hanging valley beneath Swargarohini, the mythical stairway to heaven. The best cultural immersion trek in the Himalayas.",
    highlights: ["3,000-yr-old villages", "Swargarohini views", "River valley walk", "Gentle gradients", "Rich birdlife"],
    staticWeather: { temp: 8, feels: 6, wind: 9, humidity: 60, cond: "Mostly sunny", icon: "☀️",
      daily: [ {d:"Mon",hi:14,lo:2,i:"☀️"}, {d:"Tue",hi:13,lo:1,i:"⛅"}, {d:"Wed",hi:15,lo:3,i:"☀️"}, {d:"Thu",hi:12,lo:1,i:"🌦️"}, {d:"Fri",hi:14,lo:2,i:"☀️"} ] },
    segments: [
      { from: "Taluka", to: "Osla", km: 12, grade: "moderate", note: "Long but gentle riverside trail through walnut and chestnut forest." },
      { from: "Osla", to: "Har Ki Dun", km: 10, grade: "moderate", note: "Steady climb past terraced fields; last 2 km steepen." },
      { from: "Har Ki Dun", to: "Marinda Tal (optional)", km: 4, grade: "easy", note: "Side trip to a boulder-dammed tarn under Swargarohini." }
    ],
    crux: { name: "Final climb into the hanging valley", why: "The only truly steep section — 45 minutes of switchbacks before Har Ki Dun. In December–January snow makes it slippery; otherwise it's simply a good workout." },
    checkpoints: [
      { name: "Taluka", altFt: "7,000 ft", o2: 78, note: "Roadhead beyond Sankri.", peaks: ["Forested valley walls"] },
      { name: "Osla", altFt: "8,500 ft", o2: 73, note: "Ancient village with the Someshwar temple.", peaks: ["Kala Nag glimpse"] },
      { name: "Har Ki Dun", altFt: "11,675 ft", o2: 65, note: "Cradle-shaped valley of the gods.", peaks: ["Swargarohini I–III", "Hata Peak"] },
      { name: "Marinda Tal", altFt: "12,100 ft", o2: 64, note: "Quiet tarn an hour beyond camp.", peaks: ["Swargarohini wall", "Black Peak (Kala Nag)"] }
    ],
    extraGear: ["Binoculars for birdlife", "Cash — villages have no ATMs", "Small gifts/stationery if visiting village schools"],
    wildlife: [
      { name: "Himalayan Monal", emoji: "🦚", zone: "Forest above Osla", rarity: "common" },
      { name: "Golden Eagle", emoji: "🦅", zone: "Valley thermals", rarity: "occasional" },
      { name: "Himalayan Langur", emoji: "🐒", zone: "Walnut forests", rarity: "common" },
      { name: "Bearded Vulture", emoji: "🦅", zone: "High cliffs", rarity: "occasional" },
      { name: "Himalayan Serow", emoji: "🐐", zone: "Steep forest gullies", rarity: "rare" },
      { name: "Flying Squirrel", emoji: "🐿️", zone: "Dusk, near campsites", rarity: "occasional" }
    ],
    companies: [
      { name: "Himalayan Hikers", price: 8950, rating: 4.5, includes: "Camps, meals, guide, permits" },
      { name: "Trek The Himalayas", price: 9990, rating: 4.7, includes: "Camps, meals, permits" },
      { name: "Trekup India", price: 9200, rating: 4.4, includes: "Camps, meals, gear" },
      { name: "Indiahikes", price: 10500, rating: 4.8, includes: "Camps, meals, green-trails program" },
      { name: "The Searching Souls", price: 8799, rating: 4.6, includes: "Camps, meals, guide" },
      { name: "Moxtain", price: 9100, rating: 4.4, includes: "Camps, meals, permits" },
      { name: "Himalayan Shelter", price: 9350, rating: 4.6, includes: "Camps, meals, village homestay night" }
    ],
    fitness: {
      level: 2, label: "Easy–Moderate", prepWeeks: 3,
      reqs: [
        { icon: "🚶", text: "<b>Walk 6–7 km comfortably</b> — days are long but gentle" },
        { icon: "🏃", text: "<b>Jog 5 km in ~40 min</b> as a baseline" },
        { icon: "🎒", text: "Carry <b>6–7 kg</b>; mule offloading widely available" }
      ]
    }
  },

  {
    id: "nag-tibba",
    name: "Nag Tibba",
    region: "Tehri Garhwal",
    state: "Uttarakhand",
    difficulty: "Easy",
    scene: "forest",
    altitudeFt: "9,915 ft",
    altitudeM: 3022,
    distanceKm: 16,
    days: 2,
    season: "Year-round",
    seasons: ["Winter", "Spring", "Summer", "Monsoon", "Autumn"],
    price: 3499,
    rating: 4.4,
    reviews: 3120,
    coords: { lat: 30.587, lon: 78.139, label: "Pantwari Village" },
    description:
      "The perfect <strong>weekend summit</strong> from Delhi or Dehradun. The 'Serpent's Peak' packs a genuine ridge-top sunrise, dense deodar forest and a shockingly wide Himalayan panorama into just two days — the trek most people do first, and many keep coming back to.",
    highlights: ["Weekend trek", "Sunrise summit", "Delhi-doable", "Deodar forests", "Year-round access"],
    staticWeather: { temp: 14, feels: 12, wind: 10, humidity: 55, cond: "Sunny", icon: "☀️",
      daily: [ {d:"Mon",hi:18,lo:7,i:"☀️"}, {d:"Tue",hi:17,lo:6,i:"⛅"}, {d:"Wed",hi:19,lo:8,i:"☀️"}, {d:"Thu",hi:16,lo:6,i:"🌦️"}, {d:"Fri",hi:18,lo:7,i:"☀️"} ] },
    segments: [
      { from: "Pantwari", to: "Nag Tibba Base", km: 4, grade: "moderate", note: "Steady village-trail climb gaining 3,800 ft — steeper than people expect." },
      { from: "Base", to: "Summit ridge", km: 3, grade: "moderate", note: "Pre-dawn forest climb to the temple and the ridge-top flag." },
      { from: "Summit", to: "Pantwari", km: 7, grade: "easy", note: "Cruisy descent, back in the village by lunch." }
    ],
    crux: { name: "The first 4 km out of Pantwari", why: "Almost all the elevation gain comes in one go on day one. In summer it's hot and shadeless till the forest — start early and carry 2 L of water." },
    checkpoints: [
      { name: "Pantwari", altFt: "4,650 ft", o2: 85, note: "Roadhead village, 85 km from Dehradun.", peaks: ["Lower Garhwal ridgelines"] },
      { name: "Nag Tibba Base", altFt: "8,530 ft", o2: 73, note: "Forest clearing camp beside the Nag Devta shrine.", peaks: ["Srikanth glimpse"] },
      { name: "Nag Tibba Summit", altFt: "9,915 ft", o2: 70, note: "Ridge-top with a prayer-flag pole and a huge horizon.", peaks: ["Bandarpoonch", "Swargarohini", "Srikanth", "Kedarnath peak", "Gangotri range"] }
    ],
    extraGear: ["Just a daypack — this is a light trek", "Headlamp for the pre-dawn summit push", "Warm layer even in summer (windy ridge)"],
    wildlife: [
      { name: "Himalayan Langur", emoji: "🐒", zone: "Deodar forest", rarity: "common" },
      { name: "Barking Deer", emoji: "🦌", zone: "Forest edges at dawn", rarity: "occasional" },
      { name: "Himalayan Griffon", emoji: "🦅", zone: "Ridge thermals", rarity: "common" },
      { name: "Kalij Pheasant", emoji: "🐦", zone: "Undergrowth near base", rarity: "occasional" },
      { name: "Leopard", emoji: "🐆", zone: "Lower forest (pugmarks only)", rarity: "rare" }
    ],
    companies: [
      { name: "The Searching Souls", price: 3499, rating: 4.6, includes: "Camps, meals, guide" },
      { name: "Moxtain", price: 3600, rating: 4.4, includes: "Camps, meals, permits" },
      { name: "Trekmunk", price: 3750, rating: 4.5, includes: "Camps, meals, bonfire night" },
      { name: "Trek The Himalayas", price: 3950, rating: 4.7, includes: "Camps, meals, guide" },
      { name: "Renok Adventures", price: 3850, rating: 4.5, includes: "Camps, meals, transport add-on" },
      { name: "Indiahikes", price: 4250, rating: 4.8, includes: "Camps, meals, safety protocol" }
    ],
    fitness: {
      level: 1, label: "Beginner", prepWeeks: 2,
      reqs: [
        { icon: "🚶", text: "<b>Walk 4–5 km</b> a few times before you go" },
        { icon: "🪜", text: "Some stair climbing helps for day one's <b>3,800 ft gain</b>" },
        { icon: "🎒", text: "Only a <b>4–5 kg daypack</b> needed" }
      ]
    }
  },

  {
    id: "dayara-bugyal",
    name: "Dayara Bugyal",
    region: "Uttarkashi",
    state: "Uttarakhand",
    difficulty: "Easy",
    scene: "meadow",
    altitudeFt: "12,100 ft",
    altitudeM: 3688,
    distanceKm: 21,
    days: 5,
    season: "Dec - Mar, Apr - Jun, Sep - Nov",
    seasons: ["Winter", "Spring", "Summer", "Autumn"],
    price: 6750,
    rating: 4.7,
    reviews: 1534,
    coords: { lat: 30.849, lon: 78.554, label: "Raithal Basecamp" },
    description:
      "India's most accessible <strong>high-altitude meadow</strong> — a vast rolling grassland the size of several football fields at 11,000+ ft. Golden in autumn, a white ski-field in winter, wildflower-carpeted in spring, with the Gangotri giants standing guard the whole way. The gentlest 'big view' trek in the book.",
    highlights: ["Vast alpine meadows", "All-season trek", "Gangotri range views", "Village culture in Raithal", "Great for families"],
    staticWeather: { temp: 6, feels: 3, wind: 11, humidity: 58, cond: "Clear", icon: "☀️",
      daily: [ {d:"Mon",hi:11,lo:-1,i:"☀️"}, {d:"Tue",hi:10,lo:-2,i:"⛅"}, {d:"Wed",hi:9,lo:-3,i:"🌨️"}, {d:"Thu",hi:12,lo:0,i:"☀️"}, {d:"Fri",hi:11,lo:-1,i:"⛅"} ] },
    segments: [
      { from: "Raithal", to: "Gui", km: 5, grade: "moderate", note: "Stone-stepped climb through oak forest — the only sustained ascent." },
      { from: "Gui", to: "Dayara meadows", km: 4, grade: "easy", note: "Forest gives way to open bugyal; gradients ease right off." },
      { from: "Meadows", to: "Dayara Top", km: 3, grade: "moderate", note: "Rolling meadow walk to the high point; deep snow-plodding in winter." },
      { from: "Dayara", to: "Raithal", km: 9, grade: "easy", note: "Gentle descent the whole way home." }
    ],
    crux: { name: "Winter snow-plod to Dayara Top", why: "In Jan–Feb the meadow lies under 2–4 ft of snow. Nothing is steep, but breaking trail at 12,000 ft is honest work — microspikes and gaiters turn it from slog to joy." },
    checkpoints: [
      { name: "Raithal", altFt: "7,400 ft", o2: 77, note: "Beautiful old village of carved wooden homes.", peaks: ["Srikanth glimpse"] },
      { name: "Gui", altFt: "9,700 ft", o2: 70, note: "Forest campsite beside a tiny lake.", peaks: ["Gangotri range through the oaks"] },
      { name: "Dayara Meadows", altFt: "11,000 ft", o2: 67, note: "The great grassland opens — camp on its edge.", peaks: ["Bandarpoonch", "Black Peak (Kala Nag)", "Srikanth"] },
      { name: "Dayara Top", altFt: "12,100 ft", o2: 65, note: "High point of the meadow with a full sweep.", peaks: ["Bandarpoonch", "Black Peak", "Srikanth", "Draupadi ka Danda", "Jaonli", "Gangotri massif"] }
    ],
    extraGear: ["Microspikes & gaiters (winter)", "Sunscreen — meadow glare is fierce", "Picnic mat for the meadow days"],
    wildlife: [
      { name: "Himalayan Monal", emoji: "🦚", zone: "Oak forest above Raithal", rarity: "occasional" },
      { name: "Red Fox", emoji: "🦊", zone: "Meadow edges in winter", rarity: "occasional" },
      { name: "Himalayan Weasel", emoji: "🦡", zone: "Bugyal burrows", rarity: "occasional" },
      { name: "Golden Eagle", emoji: "🦅", zone: "Above the meadows", rarity: "occasional" },
      { name: "Grazing herds & sheepdogs", emoji: "🐏", zone: "Summer bugyals", rarity: "common" }
    ],
    companies: [
      { name: "Himalayan Shelter", price: 6750, rating: 4.6, includes: "Camps, meals, local guides" },
      { name: "The Searching Souls", price: 6999, rating: 4.6, includes: "Camps, meals, guide" },
      { name: "Trekmunk", price: 7250, rating: 4.5, includes: "Camps, meals, permits" },
      { name: "Trek The Himalayas", price: 7950, rating: 4.7, includes: "Camps, meals, microspikes" },
      { name: "Indiahikes", price: 8450, rating: 4.8, includes: "Camps, meals, safety checks" },
      { name: "Moxtain", price: 7100, rating: 4.4, includes: "Camps, meals, gear" }
    ],
    fitness: {
      level: 1, label: "Beginner", prepWeeks: 3,
      reqs: [
        { icon: "🚶", text: "<b>Brisk-walk 5 km</b> comfortably" },
        { icon: "🪜", text: "The Raithal–Gui staircase rewards <b>stair training</b>" },
        { icon: "🎒", text: "Carry <b>5–6 kg</b>; offloading available" }
      ]
    }
  },

  {
    id: "kuari-pass",
    name: "Kuari Pass",
    region: "Chamoli",
    state: "Uttarakhand",
    difficulty: "Moderate",
    scene: "winter",
    altitudeFt: "12,516 ft",
    altitudeM: 3815,
    distanceKm: 33,
    days: 6,
    season: "Dec - Apr, Sep - Nov",
    seasons: ["Winter", "Spring", "Autumn"],
    price: 8250,
    rating: 4.7,
    reviews: 1789,
    coords: { lat: 30.556, lon: 79.565, label: "Joshimath / Dhak" },
    description:
      "The <strong>Lord Curzon Trail</strong> — a viceroy's chosen path for good reason. No other moderate trek walks you this close to <strong>Nanda Devi</strong>, India's highest complete mountain, while Dronagiri and Kamet crowd the skyline. Winter turns the oak forests into a snow-globe.",
    highlights: ["Nanda Devi views", "Lord Curzon trail", "Winter snow forests", "Gorson Bugyal", "Auli side-visit"],
    staticWeather: { temp: 2, feels: -3, wind: 15, humidity: 60, cond: "Partly cloudy", icon: "⛅",
      daily: [ {d:"Mon",hi:6,lo:-5,i:"⛅"}, {d:"Tue",hi:5,lo:-6,i:"🌨️"}, {d:"Wed",hi:7,lo:-4,i:"☀️"}, {d:"Thu",hi:6,lo:-5,i:"⛅"}, {d:"Fri",hi:8,lo:-3,i:"☀️"} ] },
    segments: [
      { from: "Dhak", to: "Gulling", km: 6, grade: "moderate", note: "Warm-up climb through Tugasi village and terraced fields." },
      { from: "Gulling", to: "Khullara", km: 5, grade: "moderate", note: "Beautiful oak-and-rhododendron forest; snow from December." },
      { from: "Khullara", to: "Kuari Pass", km: 6, grade: "hard", note: "Open slopes to the pass — steep pull for the final hour, big cornices in late winter." },
      { from: "Pass", to: "Auli via Gorson", km: 12, grade: "moderate", note: "Long ridge-and-meadow traverse with Nanda Devi for company." }
    ],
    crux: { name: "Khullara → Kuari Pass in snow", why: "The final climb crosses two wind-loaded slopes that ice up by afternoon. Teams start by 5 AM to be up and back before the snow softens — fitness buys you safety margin here." },
    checkpoints: [
      { name: "Joshimath", altFt: "6,150 ft", o2: 79, note: "Historic mountain town and gateway to Badrinath.", peaks: ["Hathi-Ghoda glimpse"] },
      { name: "Gulling", altFt: "9,600 ft", o2: 71, note: "Forest camp above the Dhauli Ganga valley.", peaks: ["Dronagiri", "Hathi Parvat"] },
      { name: "Khullara", altFt: "11,010 ft", o2: 67, note: "Treeline camp — the peaks feel an arm's length away.", peaks: ["Dronagiri", "Nilkantha", "Hathi-Ghoda"] },
      { name: "Kuari Pass", altFt: "12,516 ft", o2: 64, note: "The viceroy's viewpoint.", peaks: ["Nanda Devi", "Dronagiri", "Kamet", "Chaukhamba", "Neelkanth", "Trishul"] }
    ],
    extraGear: ["Microspikes & gaiters (Dec–Apr)", "Sunglasses cat-3+ for snow glare", "Thermos flask"],
    wildlife: [
      { name: "Himalayan Monal", emoji: "🦚", zone: "Rhododendron forest", rarity: "occasional" },
      { name: "Himalayan Tahr", emoji: "🐐", zone: "Cliffs below the pass", rarity: "occasional" },
      { name: "Yellow-throated Marten", emoji: "🦡", zone: "Forest near Gulling", rarity: "occasional" },
      { name: "Bearded Vulture", emoji: "🦅", zone: "Ridge thermals", rarity: "occasional" },
      { name: "Musk Deer", emoji: "🦌", zone: "Dense forest patches", rarity: "rare" }
    ],
    companies: [
      { name: "Himalayan Hikers", price: 8250, rating: 4.4, includes: "Camps, meals, guide" },
      { name: "The Searching Souls", price: 8499, rating: 4.6, includes: "Camps, meals, permits" },
      { name: "Trekmunk", price: 8950, rating: 4.5, includes: "Camps, meals, gear" },
      { name: "Trek The Himalayas", price: 9450, rating: 4.7, includes: "Camps, meals, microspikes" },
      { name: "Indiahikes", price: 9950, rating: 4.8, includes: "Camps, meals, safety protocol" },
      { name: "Moxtain", price: 8700, rating: 4.4, includes: "Camps, meals, transport add-on" }
    ],
    fitness: {
      level: 3, label: "Moderate", prepWeeks: 5,
      reqs: [
        { icon: "🏃", text: "<b>Jog 5 km in ~35 min</b> before the trek" },
        { icon: "🥶", text: "Winter batches: <b>cold-weather stamina</b> matters as much as legs" },
        { icon: "🎒", text: "Carry <b>7–8 kg</b> comfortably uphill" }
      ]
    }
  },

  {
    id: "rupin-pass",
    name: "Rupin Pass",
    region: "Kinnaur",
    state: "Himachal Pradesh",
    difficulty: "Hard",
    scene: "valley",
    altitudeFt: "15,279 ft",
    altitudeM: 4657,
    distanceKm: 52,
    days: 7,
    season: "May - Jun, Sep - Oct",
    seasons: ["Summer", "Autumn"],
    price: 12950,
    rating: 4.8,
    reviews: 1243,
    coords: { lat: 31.113, lon: 78.115, label: "Dhaula Trailhead" },
    description:
      "The trek that <strong>changes scenery every single day</strong>: hanging villages, a temple straight out of a fable at Jhaka, a three-tiered waterfall you climb alongside, and the famous snow gully to the pass. Crosses from Uttarakhand into Himachal's Sangla valley — the connoisseur's crossover.",
    highlights: ["Three-stage waterfall", "Jhaka hanging village", "Snow gully climb", "State-crossing route", "Sangla valley finish"],
    staticWeather: { temp: 7, feels: 3, wind: 19, humidity: 62, cond: "Bright spells", icon: "⛅",
      daily: [ {d:"Mon",hi:12,lo:1,i:"⛅"}, {d:"Tue",hi:11,lo:0,i:"🌦️"}, {d:"Wed",hi:13,lo:2,i:"☀️"}, {d:"Thu",hi:10,lo:-1,i:"🌨️"}, {d:"Fri",hi:12,lo:1,i:"⛅"} ] },
    segments: [
      { from: "Dhaula", to: "Sewa", km: 11, grade: "moderate", note: "Riverside walk past orchards and the two-faced Sewa temple." },
      { from: "Sewa", to: "Jhaka", km: 9, grade: "moderate", note: "In-and-out of the Rupin gorge; ends at the hanging village." },
      { from: "Jhaka", to: "Dhanderas Thatch", km: 9, grade: "hard", note: "Through snow bridges and glacial debris into the waterfall amphitheatre." },
      { from: "Dhanderas", to: "Rati Pheri", km: 4, grade: "hard", note: "Climb beside the upper waterfall — steep, wet, spectacular." },
      { from: "Rati Pheri", to: "Rupin Pass", km: 5, grade: "extreme", note: "The snow gully: a 250 m chute at 45° feel. Fixed line in early season." },
      { from: "Pass", to: "Sangla side", km: 14, grade: "hard", note: "Huge descent to Ronti Gad and on to Sangla — brutal on the knees." }
    ],
    crux: { name: "The gully: Rati Pheri → Rupin Pass", why: "A narrow snow chute where everyone kicks steps in a single file. Exposure is real, and at 15,000 ft each step costs double. Operators fix a rope till mid-June — clip in and it's exhilarating rather than scary." },
    checkpoints: [
      { name: "Dhaula", altFt: "5,100 ft", o2: 82, note: "Trailhead on the Rupin river, Uttarakhand side.", peaks: ["Gorge walls"] },
      { name: "Jhaka", altFt: "8,700 ft", o2: 73, note: "The famous 'hanging village' on a cliff shelf.", peaks: ["Rupin valley headwall"] },
      { name: "Dhanderas Thatch", altFt: "11,680 ft", o2: 66, note: "Camp in the waterfall amphitheatre.", peaks: ["Three-stage Rupin waterfall", "Dhauladhar walls"] },
      { name: "Rati Pheri", altFt: "13,100 ft", o2: 62, note: "Snowfield camp before the gully.", peaks: ["Rupin gully headwall"] },
      { name: "Rupin Pass", altFt: "15,279 ft", o2: 58, note: "Prayer flags in a notch of the Dhauladhar.", peaks: ["Kinner Kailash range", "Sangla valley peaks", "Dhauladhar crest"] }
    ],
    extraGear: ["Microspikes (mandatory May–Jun)", "Gaiters", "Rain shell — gorge weather is moody", "Knee caps for the Sangla descent"],
    wildlife: [
      { name: "Himalayan Brown Bear", emoji: "🐻", zone: "Upper Rupin valley (rare)", rarity: "rare" },
      { name: "Himalayan Blue Sheep", emoji: "🐏", zone: "Slopes above Rati Pheri", rarity: "occasional" },
      { name: "Himalayan Monal", emoji: "🦚", zone: "Forests below Jhaka", rarity: "occasional" },
      { name: "Snow Partridge", emoji: "🐦", zone: "Snowline scree", rarity: "occasional" },
      { name: "Himalayan Pika", emoji: "🐹", zone: "Boulder fields", rarity: "common" }
    ],
    companies: [
      { name: "Himalayan Hikers", price: 12950, rating: 4.4, includes: "Camps, meals, fixed-rope gully" },
      { name: "Trekmunk", price: 13500, rating: 4.5, includes: "Camps, meals, permits" },
      { name: "Trek The Himalayas", price: 13950, rating: 4.7, includes: "Camps, meals, microspikes, insurance" },
      { name: "Indiahikes", price: 14850, rating: 4.8, includes: "Camps, meals, full safety protocol" },
      { name: "Bikat Adventures", price: 14200, rating: 4.6, includes: "Camps, meals, technical briefings" },
      { name: "The Searching Souls", price: 13250, rating: 4.6, includes: "Camps, meals, guide" }
    ],
    fitness: {
      level: 4, label: "Demanding", prepWeeks: 8,
      reqs: [
        { icon: "🏃", text: "<b>Jog 5 km in under 30 min</b>, 4× a week" },
        { icon: "⛰️", text: "One prior <b>12,000 ft+ trek</b> strongly recommended" },
        { icon: "🎒", text: "Train with <b>9–10 kg</b> on stair sessions" },
        { icon: "🦵", text: "The last day drops <b>6,000 ft</b> — train descents" }
      ]
    }
  },

  {
    id: "bhrigu-lake",
    name: "Bhrigu Lake",
    region: "Kullu",
    state: "Himachal Pradesh",
    difficulty: "Moderate",
    scene: "lakes",
    altitudeFt: "14,100 ft",
    altitudeM: 4300,
    distanceKm: 16,
    days: 4,
    season: "May - Oct",
    seasons: ["Summer", "Monsoon", "Autumn"],
    price: 6999,
    rating: 4.5,
    reviews: 1376,
    coords: { lat: 32.352, lon: 77.234, label: "Gulaba Trailhead" },
    description:
      "<strong>Alpine meadows from hour one.</strong> Bhrigu starts above the treeline and never looks back — four days, one sacred high-altitude lake said to be the meditation pool of sage Bhrigu, and grass-slope views across the entire Pir Panjal. The fastest honest 14,000-footer in Himachal.",
    highlights: ["Sacred alpine lake", "Meadows from day one", "Short & high", "Hanuman Tibba views", "Close to Manali"],
    staticWeather: { temp: 10, feels: 7, wind: 14, humidity: 68, cond: "Cloud patches", icon: "⛅",
      daily: [ {d:"Mon",hi:14,lo:4,i:"⛅"}, {d:"Tue",hi:15,lo:5,i:"☀️"}, {d:"Wed",hi:13,lo:3,i:"🌦️"}, {d:"Thu",hi:14,lo:4,i:"⛅"}, {d:"Fri",hi:15,lo:5,i:"☀️"} ] },
    segments: [
      { from: "Gulaba", to: "Rola Kholi", km: 5, grade: "moderate", note: "Grassy shoulder climb — steady, open, breathtaking (both senses)." },
      { from: "Rola Kholi", to: "Bhrigu Lake", km: 6, grade: "hard", note: "Ridge after ridge to the glacial bowl; snowfield crossings till July." },
      { from: "Lake", to: "Gulaba", km: 5, grade: "moderate", note: "Retrace with the Kullu valley spread below." }
    ],
    crux: { name: "The false-summit ridges before the lake", why: "Quick altitude gain (10,000 → 14,100 ft in barely two days) with three morale-testing false ridgelines. It's the acclimatisation, not the terrain, that turns people around — hydrate and go slow." },
    checkpoints: [
      { name: "Gulaba", altFt: "10,370 ft", o2: 68, note: "Trailhead on the Rohtang road.", peaks: ["Dhauladhar across the valley"] },
      { name: "Rola Kholi", altFt: "12,140 ft", o2: 64, note: "Shepherd meadow camp beneath Hanuman Tibba.", peaks: ["Hanuman Tibba", "Seven Sisters"] },
      { name: "Bhrigu Lake", altFt: "14,100 ft", o2: 60, note: "Oval glacial lake — ice-rimmed even in June.", peaks: ["Hanuman Tibba", "Deo Tibba", "Indrasan", "Pir Panjal sweep"] }
    ],
    extraGear: ["Microspikes (May–Jun snowfields)", "Sun hat — zero shade all trek", "2 L water capacity minimum"],
    wildlife: [
      { name: "Himalayan Marmot", emoji: "🦫", zone: "Meadows near Rola Kholi", rarity: "common" },
      { name: "Himalayan Griffon", emoji: "🦅", zone: "Thermals over the ridges", rarity: "common" },
      { name: "Snow Pigeon", emoji: "🕊️", zone: "Crags near the lake", rarity: "common" },
      { name: "Himalayan Ibex", emoji: "🐐", zone: "High scree (early morning)", rarity: "rare" }
    ],
    companies: [
      { name: "The Searching Souls", price: 6999, rating: 4.6, includes: "Camps, meals, guide" },
      { name: "Moxtain", price: 7200, rating: 4.4, includes: "Camps, meals, permits" },
      { name: "Trekmunk", price: 7450, rating: 4.5, includes: "Camps, meals, gear" },
      { name: "Trek The Himalayas", price: 7950, rating: 4.7, includes: "Camps, meals, microspikes" },
      { name: "Indiahikes", price: 8950, rating: 4.8, includes: "Camps, meals, oximeter checks" },
      { name: "Renok Adventures", price: 7600, rating: 4.5, includes: "Camps, meals, Manali pickup" }
    ],
    fitness: {
      level: 3, label: "Moderate", prepWeeks: 4,
      reqs: [
        { icon: "🏃", text: "<b>Jog 5 km in ~35 min</b> — the gain is fast" },
        { icon: "🫁", text: "Rapid altitude profile: <b>hydration discipline</b> is non-negotiable" },
        { icon: "🎒", text: "Carry <b>6–7 kg</b> on open, windy slopes" }
      ]
    }
  },

  {
    id: "friendship-peak",
    name: "Friendship Peak",
    region: "Kullu (Solang)",
    state: "Himachal Pradesh",
    difficulty: "Expedition",
    scene: "glacier",
    altitudeFt: "17,353 ft",
    altitudeM: 5289,
    distanceKm: 30,
    days: 7,
    season: "May - Jun, Sep - Oct",
    seasons: ["Summer", "Autumn"],
    price: 21500,
    rating: 4.8,
    reviews: 642,
    coords: { lat: 32.317, lon: 77.156, label: "Solang Valley Base" },
    description:
      "Your <strong>first real summit</strong>. Friendship Peak is the classic trekker-to-mountaineer graduation climb: rope-up glacier travel, crampon work on a 45° snow face, and a 5,289 m summit ringed by the Pir Panjal giants — all within a week of Manali. Basic mountaineering skills are taught en route.",
    highlights: ["First 5,000er", "Rope & crampon climb", "Glacier travel", "Skills taught on trip", "Pir Panjal panorama"],
    staticWeather: { temp: 0, feels: -6, wind: 24, humidity: 60, cond: "Windy & clear", icon: "🌬️",
      daily: [ {d:"Mon",hi:4,lo:-9,i:"☀️"}, {d:"Tue",hi:3,lo:-10,i:"🌨️"}, {d:"Wed",hi:5,lo:-8,i:"⛅"}, {d:"Thu",hi:2,lo:-11,i:"❄️"}, {d:"Fri",hi:4,lo:-9,i:"☀️"} ] },
    segments: [
      { from: "Solang", to: "Dhundi", km: 8, grade: "easy", note: "Gentle valley walk beside the Beas headwaters." },
      { from: "Dhundi", to: "Bakarthach", km: 5, grade: "moderate", note: "Meadow climb to base camp; skills training begins." },
      { from: "Bakarthach", to: "Advance Base (Lady Leg)", km: 4, grade: "hard", note: "Moraine and snow slopes to the glacier's edge; load ferry day." },
      { from: "ABC", to: "Summit", km: 5, grade: "extreme", note: "1 AM start. Roped glacier travel, 45° snow face with crampons & ice axe, 8–10 hr round trip." },
      { from: "Summit", to: "Solang", km: 8, grade: "moderate", note: "Long celebratory descent back down the valley." }
    ],
    crux: { name: "Summit face at 16,500+ ft", why: "The final 800 ft is a sustained 40–45° snow slope on a rope line, in the dark, at half sea-level oxygen. Footwork learned in training days is everything; weather windows decide summit chances (~70% success rate)." },
    checkpoints: [
      { name: "Solang Valley", altFt: "8,400 ft", o2: 74, note: "Ski-resort valley 30 min from Manali.", peaks: ["Friendship Peak first sight"] },
      { name: "Dhundi", altFt: "9,500 ft", o2: 71, note: "Riverside meadow camp.", peaks: ["Hanuman Tibba", "Seven Sisters"] },
      { name: "Bakarthach Base Camp", altFt: "10,800 ft", o2: 68, note: "Training ground: rope work, self-arrest, crampons.", peaks: ["Friendship Peak face", "Shitidhar"] },
      { name: "Advance Base (Lady Leg)", altFt: "14,600 ft", o2: 59, note: "High camp on the glacier margin.", peaks: ["Hanuman Tibba wall", "Beas Kund bowl below"] },
      { name: "Friendship Peak Summit", altFt: "17,353 ft", o2: 53, note: "A true mountaineer's summit.", peaks: ["Hanuman Tibba", "Deo Tibba", "Indrasan", "Pir Panjal range", "Dhauladhar range"] }
    ],
    extraGear: ["Double-layer snow boots (rental)", "Crampons, ice axe, harness, helmet (provided)", "UV cat-4 glacier glasses", "Summit mittens", "−15 °C sleeping bag"],
    wildlife: [
      { name: "Himalayan Ibex", emoji: "🐐", zone: "Moraines above Bakarthach", rarity: "occasional" },
      { name: "Himalayan Marmot", emoji: "🦫", zone: "Dhundi meadows", rarity: "common" },
      { name: "Snow Pigeon", emoji: "🕊️", zone: "Glacier cliffs", rarity: "common" },
      { name: "Golden Eagle", emoji: "🦅", zone: "High thermals", rarity: "occasional" },
      { name: "Snow Leopard", emoji: "🐆", zone: "Winter descents (tracks)", rarity: "rare" }
    ],
    companies: [
      { name: "Himalayan Daredevils", price: 21500, rating: 4.5, includes: "Full expedition kit, HAPs, meals" },
      { name: "Trek The Himalayas", price: 22950, rating: 4.7, includes: "Kit, guides 1:3, insurance" },
      { name: "Bikat Adventures", price: 23500, rating: 4.7, includes: "Kit, skills course, small teams" },
      { name: "Boots & Crampons", price: 24950, rating: 4.8, includes: "IMF guides, kit, 1:2 ratio" },
      { name: "White Magic Adventure", price: 26500, rating: 4.8, includes: "Premium kit, certified guides" },
      { name: "Moxtain", price: 21999, rating: 4.4, includes: "Kit, meals, permits" }
    ],
    fitness: {
      level: 5, label: "Strenuous", prepWeeks: 10,
      reqs: [
        { icon: "🏃", text: "<b>10 km in under 60 min</b>, plus interval training" },
        { icon: "⛰️", text: "At least one <b>14,000 ft+ trek</b> completed" },
        { icon: "🎒", text: "Load ferries: comfortable with <b>12 kg at altitude</b>" },
        { icon: "🩺", text: "Medical certificate mandatory; HAP support available" },
        { icon: "🧗", text: "No prior climbing needed — <b>skills taught at base camp</b>" }
      ]
    }
  },

  {
    id: "black-peak",
    name: "Black Peak (Kala Nag)",
    region: "Uttarkashi",
    state: "Uttarakhand",
    difficulty: "Expedition",
    scene: "alpine",
    altitudeFt: "20,955 ft",
    altitudeM: 6387,
    distanceKm: 60,
    days: 12,
    season: "May - Jun, Sep",
    seasons: ["Summer", "Autumn"],
    price: 42500,
    rating: 4.9,
    reviews: 214,
    coords: { lat: 31.093, lon: 78.35, label: "Sankri (via Ruinsara)" },
    description:
      "The serpent's head of the Bandarpoonch massif — a genuine <strong>6,000 m expedition</strong>. Twelve days from Sankri through the Ruinsara valley to a summit above 20,900 ft, with crevassed glacier travel, fixed lines on the headwall and the deepest views in Garhwal. For trekkers ready to become mountaineers, this is the next chapter.",
    highlights: ["6,387 m summit", "Ruinsara valley approach", "Crevassed glacier climb", "Fixed-line headwall", "True expedition logistics"],
    staticWeather: { temp: -6, feels: -14, wind: 32, humidity: 52, cond: "High wind", icon: "🌬️",
      daily: [ {d:"Mon",hi:-1,lo:-16,i:"☀️"}, {d:"Tue",hi:-2,lo:-18,i:"🌨️"}, {d:"Wed",hi:0,lo:-15,i:"⛅"}, {d:"Thu",hi:-3,lo:-19,i:"❄️"}, {d:"Fri",hi:-1,lo:-16,i:"☀️"} ] },
    segments: [
      { from: "Sankri", to: "Seema/Osla", km: 14, grade: "moderate", note: "Two river-valley days shared with the Har Ki Dun trail." },
      { from: "Seema", to: "Ruinsara Tal", km: 12, grade: "hard", note: "Wilder country — gorges, log bridges, and the sacred lake beneath Swargarohini." },
      { from: "Ruinsara", to: "Kyarkoti Base", km: 8, grade: "hard", note: "Base camp at 13,780 ft in a glacial meadow. Acclimatisation rotations here." },
      { from: "Kyarkoti", to: "Camp 1", km: 5, grade: "extreme", note: "Moraine then roped glacier — crevasse zones, ladder/fixed-line practice." },
      { from: "Camp 1", to: "Summit", km: 4, grade: "extreme", note: "Midnight start. Fixed ropes on the 50° headwall, corniced summit ridge at ~47% oxygen." }
    ],
    crux: { name: "The headwall & summit ridge (19,000 → 20,955 ft)", why: "Jumar work on fixed lines at nearly half sea-level oxygen, then an exposed corniced ridge to the top. Weather holds decide everything — expeditions build in two summit windows. Success runs ~60%; the mountain always gets the final vote." },
    checkpoints: [
      { name: "Sankri", altFt: "6,400 ft", o2: 79, note: "Expedition staging village.", peaks: ["Greater Himalayan foothills"] },
      { name: "Ruinsara Tal", altFt: "11,800 ft", o2: 65, note: "Sacred lake in a rhododendron bowl.", peaks: ["Swargarohini wall", "Bandarpoonch"] },
      { name: "Kyarkoti Base Camp", altFt: "13,780 ft", o2: 61, note: "Glacial meadow HQ; puja before the climb.", peaks: ["Black Peak", "Bandarpoonch", "White Peak"] },
      { name: "Camp 1", altFt: "17,700 ft", o2: 52, note: "Glacier camp among the crevasse fields.", peaks: ["Swargarohini I–III", "Garhwal skyline"] },
      { name: "Black Peak Summit", altFt: "20,955 ft", o2: 47, note: "The head of the black serpent.", peaks: ["Bandarpoonch", "Swargarohini", "Gangotri giants", "Yamunotri range", "endless Garhwal"] }
    ],
    extraGear: ["Full expedition kit (double boots, crampons, harness, jumar — operator provided)", "−20 °C sleeping bag", "Down suit or 800-fill parka", "4,000+ kcal/day appetite", "Personal AMS meds reviewed by doctor"],
    wildlife: [
      { name: "Bharal (Blue Sheep)", emoji: "🐏", zone: "Ruinsara slopes", rarity: "occasional" },
      { name: "Himalayan Monal", emoji: "🦚", zone: "Forest till Seema", rarity: "occasional" },
      { name: "Snow Leopard", emoji: "🐆", zone: "Kyarkoti (tracks & scat)", rarity: "rare" },
      { name: "Golden Eagle", emoji: "🦅", zone: "Base camp thermals", rarity: "occasional" },
      { name: "Alpine Chough", emoji: "🐦‍⬛", zone: "Even at Camp 1", rarity: "common" }
    ],
    companies: [
      { name: "Himalayan Daredevils", price: 42500, rating: 4.5, includes: "Full expedition, HAPs, ropes, meals" },
      { name: "Trek The Himalayas", price: 46950, rating: 4.7, includes: "Expedition kit, 1:2 HAP ratio, insurance" },
      { name: "Boots & Crampons", price: 47500, rating: 4.8, includes: "IMF-certified leaders, full kit" },
      { name: "Bikat Adventures", price: 49500, rating: 4.7, includes: "Kit, skills program, small teams" },
      { name: "White Magic Adventure", price: 52000, rating: 4.8, includes: "Premium expedition service" }
    ],
    fitness: {
      level: 5, label: "Strenuous", prepWeeks: 16,
      reqs: [
        { icon: "🏃", text: "<b>10 km in 55 min</b> + hill repeats, 5× a week for 4 months" },
        { icon: "⛰️", text: "<b>Basic mountaineering course (BMC)</b> or a prior 5,000 m summit" },
        { icon: "🎒", text: "Load ferries with <b>15 kg</b> — expedition climbing is porter work" },
        { icon: "🩺", text: "Full medical + ECG; IMF permit formalities" },
        { icon: "🧠", text: "12 days of cold, wind and waiting — <b>patience is a summit skill</b>" }
      ]
    }
  }
];

/* Safety tips shown on every trek page */
const SAFETY_TIPS = [
  { icon: "🫁", title: "Acclimatise properly", text: "Climb high, sleep low. Never gain more than 1,500 ft of sleeping altitude a day above 10,000 ft." },
  { icon: "💧", title: "Hydrate 4–5 L a day", text: "Dehydration mimics and worsens AMS. Sip constantly; add electrolytes once a day." },
  { icon: "🤕", title: "Know AMS symptoms", text: "Headache + nausea + dizziness that worsens on ascent = descend immediately. Descent is the only cure." },
  { icon: "📵", title: "Expect no network", text: "Tell family your itinerary. Most basecamps have BSNL at best; carry an offline map." },
  { icon: "🌦️", title: "Weather turns in minutes", text: "Always pack the rain layer, even on a clear morning. Above the treeline, wind is the real cold." },
  { icon: "🥾", title: "Break in your shoes", text: "New boots on day one = blisters by day two. Do at least 30 km in them before the trek." }
];
