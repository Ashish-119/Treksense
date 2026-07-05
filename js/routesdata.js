/* ============================================================
   TrekSense — routesdata.js
   Journey knowledge: origin cities, gateway hubs, and each
   trek's road approach (real distances, times & waypoints).
   ============================================================ */

const CITIES = [
  { id: "delhi", name: "Delhi", lat: 28.61, lon: 77.21 },
  { id: "mumbai", name: "Mumbai", lat: 19.08, lon: 72.88 },
  { id: "bengaluru", name: "Bengaluru", lat: 12.97, lon: 77.59 },
  { id: "chennai", name: "Chennai", lat: 13.08, lon: 80.27 },
  { id: "kolkata", name: "Kolkata", lat: 22.57, lon: 88.36 },
  { id: "hyderabad", name: "Hyderabad", lat: 17.38, lon: 78.48 },
  { id: "pune", name: "Pune", lat: 18.52, lon: 73.86 },
  { id: "ahmedabad", name: "Ahmedabad", lat: 23.03, lon: 72.58 },
  { id: "jaipur", name: "Jaipur", lat: 26.91, lon: 75.79 },
  { id: "lucknow", name: "Lucknow", lat: 26.85, lon: 80.95 },
  { id: "indore", name: "Indore", lat: 22.72, lon: 75.86 },
  { id: "chandigarh", name: "Chandigarh", lat: 30.73, lon: 76.78 },
  { id: "dehradun", name: "Dehradun", lat: 30.32, lon: 78.03 },
  { id: "guwahati", name: "Guwahati", lat: 26.14, lon: 91.74 }
];

const HUBS = {
  dehradun:    { name: "Dehradun", lat: 30.32, lon: 78.03, air: "Dehradun–Jolly Grant (DED)", rail: "Dehradun (DDN)", approachVia: ["Haridwar", "Roorkee"] },
  rishikesh:   { name: "Rishikesh", lat: 30.09, lon: 78.27, air: "Dehradun–Jolly Grant (DED)", rail: "Rishikesh / Haridwar", approachVia: ["Haridwar"] },
  kathgodam:   { name: "Kathgodam", lat: 29.27, lon: 79.55, air: "Pantnagar (PGH)", rail: "Kathgodam (KGM)", approachVia: ["Rampur (UP)", "Haldwani"] },
  manali:      { name: "Manali", lat: 32.24, lon: 77.19, air: "Bhuntar–Kullu (KUU)", rail: "Chandigarh (CDG), then road", approachVia: ["Chandigarh", "Bilaspur", "Mandi", "Kullu"] },
  bhuntar:     { name: "Bhuntar (Kullu)", lat: 31.88, lon: 77.15, air: "Bhuntar–Kullu (KUU)", rail: "Chandigarh (CDG), then road", approachVia: ["Chandigarh", "Mandi", "Aut tunnel"] },
  shimla:      { name: "Shimla", lat: 31.10, lon: 77.17, air: "Shimla (SLV)", rail: "Kalka (KLK) + toy train", approachVia: ["Chandigarh", "Solan"] },
  chandigarh:  { name: "Chandigarh", lat: 30.73, lon: 76.78, air: "Chandigarh (IXC)", rail: "Chandigarh (CDG)", approachVia: ["Ambala"] },
  dharamshala: { name: "Dharamshala", lat: 32.22, lon: 76.32, air: "Gaggal–Kangra (DHM)", rail: "Pathankot (PTK), then road", approachVia: ["Chandigarh", "Una", "Kangra"] },
  srinagar:    { name: "Srinagar", lat: 34.08, lon: 74.80, air: "Srinagar (SXR)", rail: "Jammu Tawi (JAT), then road", approachVia: ["Jammu", "Banihal"] },
  bagdogra:    { name: "Siliguri / Bagdogra", lat: 26.70, lon: 88.32, air: "Bagdogra (IXB)", rail: "New Jalpaiguri (NJP)", approachVia: ["Siliguri"] }
};

/* hub, road-km to basecamp, road-hours, places you pass */
const TREK_ROUTES = {
  "kedarkantha":            { hub: "dehradun", km: 190, hrs: 8.5, via: ["Mussoorie", "Naugaon", "Purola", "Mori", "Netwar"] },
  "har-ki-dun":             { hub: "dehradun", km: 190, hrs: 8.5, via: ["Mussoorie", "Naugaon", "Purola", "Mori", "Netwar"] },
  "phulara-ridge":          { hub: "dehradun", km: 190, hrs: 8.5, via: ["Mussoorie", "Naugaon", "Purola", "Mori", "Netwar"] },
  "bali-pass":              { hub: "dehradun", km: 190, hrs: 8.5, via: ["Mussoorie", "Naugaon", "Purola", "Mori", "Netwar"] },
  "black-peak":             { hub: "dehradun", km: 190, hrs: 8.5, via: ["Mussoorie", "Naugaon", "Purola", "Mori", "Netwar"] },
  "rupin-pass":             { hub: "dehradun", km: 200, hrs: 9, via: ["Naugaon", "Purola", "Mori", "Netwar"] },
  "nag-tibba":              { hub: "dehradun", km: 85, hrs: 3.5, via: ["Kempty Falls", "Nainbagh"] },
  "dodital-darwa":          { hub: "dehradun", km: 140, hrs: 5.5, via: ["Chamba", "Uttarkashi"] },
  "dayara-bugyal":          { hub: "dehradun", km: 175, hrs: 7, via: ["Uttarkashi", "Bhatwari"] },
  "gidara-bugyal":          { hub: "dehradun", km: 185, hrs: 7.5, via: ["Uttarkashi", "Bhatwari"] },
  "gaumukh-tapovan":        { hub: "dehradun", km: 240, hrs: 10, via: ["Uttarkashi", "Harsil", "Gangotri temple"] },
  "kedartal":               { hub: "dehradun", km: 240, hrs: 10, via: ["Uttarkashi", "Harsil", "Gangotri temple"] },
  "audens-col":             { hub: "dehradun", km: 240, hrs: 10, via: ["Uttarkashi", "Harsil", "Gangotri temple"] },
  "kalindi-khal":           { hub: "dehradun", km: 240, hrs: 10, via: ["Uttarkashi", "Harsil", "Gangotri temple"] },
  "roopkund":               { hub: "rishikesh", km: 245, hrs: 10, via: ["Devprayag", "Karnaprayag", "Tharali", "Dewal"] },
  "brahmatal":              { hub: "rishikesh", km: 245, hrs: 10, via: ["Devprayag", "Karnaprayag", "Tharali", "Dewal"] },
  "kuari-pass":             { hub: "rishikesh", km: 255, hrs: 10.5, via: ["Devprayag", "Rudraprayag", "Karnaprayag", "Chamoli", "Joshimath"] },
  "pangarchulla":           { hub: "rishikesh", km: 255, hrs: 10.5, via: ["Devprayag", "Rudraprayag", "Karnaprayag", "Chamoli", "Joshimath"] },
  "valley-of-flowers":      { hub: "rishikesh", km: 270, hrs: 11, via: ["Rudraprayag", "Karnaprayag", "Joshimath"] },
  "satopanth-tal":          { hub: "rishikesh", km: 295, hrs: 12, via: ["Joshimath", "Badrinath temple"] },
  "bagini-glacier":         { hub: "rishikesh", km: 275, hrs: 11, via: ["Karnaprayag", "Joshimath", "Tapovan (Chamoli)"] },
  "deoriatal-chandrashila": { hub: "rishikesh", km: 190, hrs: 8, via: ["Devprayag", "Rudraprayag", "Ukhimath"] },
  "madmaheshwar":           { hub: "rishikesh", km: 210, hrs: 9, via: ["Rudraprayag", "Ukhimath"] },
  "rudranath":              { hub: "rishikesh", km: 215, hrs: 9, via: ["Rudraprayag", "Chamoli", "Gopeshwar"] },
  "panwali-kantha":         { hub: "rishikesh", km: 170, hrs: 7.5, via: ["Devprayag", "New Tehri", "Ghansali"] },
  "sahastra-tal":           { hub: "rishikesh", km: 185, hrs: 8, via: ["New Tehri", "Ghansali"] },
  "pindari-glacier":        { hub: "kathgodam", km: 205, hrs: 9, via: ["Almora", "Bageshwar", "Loharkhet"] },
  "kafni-glacier":          { hub: "kathgodam", km: 205, hrs: 9, via: ["Almora", "Bageshwar", "Loharkhet"] },
  "milam-glacier":          { hub: "kathgodam", km: 275, hrs: 11.5, via: ["Almora", "Chaukori", "Birthi Falls"] },
  "panchachuli-bc":         { hub: "kathgodam", km: 320, hrs: 13, via: ["Pithoragarh", "Dharchula"] },
  "hampta-pass":            { hub: "manali", km: 17, hrs: 1, via: ["Prini", "Sethan road"] },
  "friendship-peak":        { hub: "manali", km: 14, hrs: 0.5, via: ["Palchan"] },
  "hanuman-tibba":          { hub: "manali", km: 14, hrs: 0.5, via: ["Palchan"] },
  "beas-kund":              { hub: "manali", km: 14, hrs: 0.5, via: ["Palchan"] },
  "bhrigu-lake":            { hub: "manali", km: 22, hrs: 1, via: ["Palchan", "Kothi"] },
  "deo-tibba-bc":           { hub: "manali", km: 12, hrs: 0.5, via: ["Jagatsukh"] },
  "deo-tibba-exp":          { hub: "manali", km: 12, hrs: 0.5, via: ["Jagatsukh"] },
  "chanderkhani":           { hub: "manali", km: 21, hrs: 1, via: ["Naggar Castle"] },
  "bara-bhangal":           { hub: "manali", km: 3, hrs: 0.2, via: ["Hadimba Temple"] },
  "mt-yunam":               { hub: "manali", km: 115, hrs: 4.5, via: ["Atal Tunnel", "Sissu", "Jispa", "Darcha"] },
  "kanamo-peak":            { hub: "manali", km: 205, hrs: 8, via: ["Atal Tunnel", "Kunzum La", "Kaza"] },
  "kheerganga":             { hub: "bhuntar", km: 55, hrs: 2.5, via: ["Kasol", "Manikaran"] },
  "pin-parvati":            { hub: "bhuntar", km: 55, hrs: 2.5, via: ["Kasol", "Manikaran"] },
  "sar-pass":               { hub: "bhuntar", km: 31, hrs: 1.5, via: ["Jari"] },
  "buran-ghati":            { hub: "shimla", km: 160, hrs: 7, via: ["Rohru", "Chirgaon", "Tangnu"] },
  "bhaba-pass":             { hub: "shimla", km: 200, hrs: 8, via: ["Rampur", "Wangtu"] },
  "shrikhand-mahadev":      { hub: "shimla", km: 175, hrs: 7.5, via: ["Rampur", "Nirmand", "Bagipul"] },
  "churdhar":               { hub: "chandigarh", km: 95, hrs: 3.5, via: ["Nahan"] },
  "prashar-lake":           { hub: "chandigarh", km: 195, hrs: 6.5, via: ["Bilaspur", "Mandi"] },
  "jalori-serolsar":        { hub: "chandigarh", km: 260, hrs: 9, via: ["Mandi", "Aut", "Banjar", "Shoja"] },
  "triund":                 { hub: "dharamshala", km: 5, hrs: 0.3, via: ["McLeodganj"] },
  "indrahar-pass":          { hub: "dharamshala", km: 5, hrs: 0.3, via: ["McLeodganj"] },
  "kareri-lake":            { hub: "dharamshala", km: 30, hrs: 1.3, via: ["Ghera"] },
  "kashmir-great-lakes":    { hub: "srinagar", km: 80, hrs: 2.5, via: ["Kangan", "Sonamarg"] },
  "goechala":               { hub: "bagdogra", km: 150, hrs: 6, via: ["Jorethang", "Tashiding"] }
};
