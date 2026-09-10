# Stage 0 — Foundations & sensor spike

| | |
|---|---|
| **Goal** | Prove the sensor loop before building anything on it: confirm the four sensor APIs work on real target devices, and a label stays glued to a compass bearing as you pan. |
| **Definition of done** | On a real phone outdoors, the spike's `TARGET` label sits on the correct compass direction within **±5°** and does **not visibly drift** while the phone is held still. |
| **Effort** | ≈ half a week (mostly device testing) |
| **Status** | 🟡 In progress — Claude's part done, waiting on device measurements |

---

## Part A — What Claude built

### `docs/spike/sensor-spike.html`
A single self-contained page (no dependencies, no build). It **is** blueprint task 0‑2
("throwaway spike page: camera feed + one hard-coded label positioned by relative
bearing only") and it also runs the other Stage‑0 checks for you:

| Blueprint Stage‑0 task | Where it lives in the spike |
|---|---|
| **0‑1** Device / API audit | Preflight screen + the live "readout" panel — auto‑detects secure context, camera API, `DeviceOrientation`, whether an **absolute** orientation event ever fires, iOS permission gesture, geolocation, gyro (`devicemotion`), GPS altitude presence, camera resolution & whether FOV is exposed |
| **0‑2** Spike: camera + one bearing‑locked label | The whole live view. Set a **target true bearing**, pan the phone, the `TARGET` label tracks it and turns **green** within ±2°. A compass tick‑strip and a big true‑heading readout sit on top |
| **0‑3** Measure heading jitter & rate | **"Start 30 s jitter test"** button → reports sample count, event rate (Hz), circular mean, σ, peak‑to‑peak, a sparkline, and a verdict |
| **0‑4** Decide smoothing approach | Live **None / EMA / Complementary** switch with an α slider, showing smoothed value + lag vs raw side by side so you can feel the trade‑off. The jitter verdict recommends one |
| **0‑5** Magnetic‑declination source | The spike uses a **coarse regional constant** for now (clearly labelled). The real decision + the `.COF` download is a manual step below — declination correction itself is built in Stage 3 |

It also has a **known‑bearing check** tool (aim at a landmark whose true bearing you
know, log it — it tells you whether the phone's heading is **true** or **magnetic**),
and **Copy / Download JSON** that dumps every detected value + your test results in one
blob to paste into this file.

> The spike is **throwaway**. None of its code carries into Stage 1 — it exists only to
> de‑risk the sensor assumptions. The real project structure starts in Stage 1.

---

## Part B — What you do (manual)

### Step 1 · Put the spike on an HTTPS URL

Camera and motion sensors **only work in a secure context from a real origin** — not
from `file://`, and not reliably inside the embedded artifact preview. Easiest path,
since the repo is already on GitHub:

1. Push this branch to `github.com/Ashish-119/Treksense`.
2. Repo → **Settings** → **Pages**.
3. **Source:** "Deploy from a branch". **Branch:** `main` (or your branch), **folder:** `/ (root)`. Save.
4. Wait ~1 min. Your spike is at:
   ```
   https://ashish-119.github.io/Treksense/docs/spike/sensor-spike.html
   ```
5. Open that URL on each test phone (AirDrop / message the link to yourself).

*Alternative:* connect the repo to **Vercel** (also gives HTTPS automatically) and use
`https://<project>.vercel.app/docs/spike/sensor-spike.html`.

### Step 2 · Line up 2–3 test devices

The blueprint calls for coverage of the two engines that behave differently:

| Priority | Device | Why it matters |
|---|---|---|
| Must | An **iPhone** (Safari), iOS 16+ | `webkitCompassHeading`, the motion‑permission **gesture**, and Apple's "already true north" heading are all iOS‑specific |
| Must | An **Android** phone (Chrome), recent | `deviceorientationabsolute`, magnetic‑frame `alpha`, and generally noisier magnetometers |
| Nice | A second Android, ideally older / cheaper | Worst‑case jitter and event rate; some devices never fire an **absolute** event |

Record the exact model + OS version for each.

### Step 3 · First run on each phone

1. Hold the phone in **portrait**. Open the URL.
2. Read the **preflight** list. Everything green except "iOS permission gesture" (amber on iPhone) is expected. A red "Secure context" means the URL isn't HTTPS — fix Step 1.
3. Tap **"Start spike & grant permissions"**.
4. Grant **Motion & Orientation** (iOS shows this only because you tapped), then **Camera**, then **Location**. On iOS, if you miss the motion prompt, reload and try again — it needs the tap.
5. You should see the camera, a compass strip, and a big heading readout.

### Step 4 · Run the checks (outdoors, away from cars / rebar / speakers)

**4a — Audit (task 0‑1).** Open the sheet (drag the handle up). Walk down the readout
panel and copy each value into the results table below. Note especially:
`source`, `absolute seen`, `event rate`, `gyro rate z`, `gps altitude`, `camera FOV exposed`.

**4b — 60‑second drift watch (DoD).** Set **target true bearing** to a round number,
turn so the `TARGET` label is centred and green, then **set the phone down and don't
touch it for 60 s**. Watch the label. Does it stay within ±5° / stay green? Record
pass/fail.

**4c — Jitter test (task 0‑3).** Lay the phone flat and still, pointing at a fixed
mark. Tap **"Start 30 s jitter test"**. Don't touch it. Record the reported
`σ`, `peak‑to‑peak`, `Hz` and the verdict.

**4d — Known‑bearing accuracy (DoD, task 0‑1).** You need a landmark and its **true**
bearing from where you stand:
   - Pick something you can also see on a map (a tower, a bridge, a distinct summit, a road that runs dead straight away from you).
   - Get your lat/lon (the spike shows it) and the landmark's lat/lon (long‑press it in Google Maps).
   - Compute the initial bearing: `θ = atan2( sin Δλ · cos φ₂ , cos φ₁ · sin φ₂ − sin φ₁ · cos φ₂ · cos Δλ )`, or paste both coordinates into any "initial bearing between two points" calculator.
   - Aim the centre reticle at the landmark, enter that bearing in **"landmark true°"**, tap **"Log check"**.
   - Do this for **3–5 different directions**. The tool accumulates them and tells you whether the raw heading matches **true** or **magnetic** north, and the error each time.

**4e — Smoothing feel (task 0‑4).** While panning back and forth, switch **None →
EMA → Complementary** and move the α slider. Note which one tracks quickly *and* sits
still when you stop. (If "Complementary" runs away or lags badly, that's data — write
it down; the gyro sign may be device‑specific.)

### Step 5 · Export and paste

Tap **"Copy JSON"** (or "Download JSON") on each device. Paste each blob into the
**Results log** at the bottom of this file, and fill the `notes_fill_in` fields
(`driftOver60sPass`, `cameraLatency`, `subjectiveTracking`).

### Step 6 · Magnetic‑declination source (task 0‑5)

1. Download the official **World Magnetic Model 2025** coefficient file (`WMM.COF`),
   public domain, from NOAA NCEI: <https://www.ncei.noaa.gov/products/world-magnetic-model>
   (the "WMM2025 Coefficients" / `.COF` download).
2. Save it as `docs/spike/wmm.cof` **and** note its size — it should be ~5–6 KB.
3. Record the size in **Decision D‑0.2** below. (The evaluator that reads it is built
   in Stage 3, task 3‑1; nothing to code now.)

---

## Part C — Decisions to record (after measuring)

### D‑0.1 · Smoothing approach *(task 0‑4)*
> Filled after Step 4c/4e on all devices. **Driven by the worst device — Android not yet tested.**

- iPhone 17 (indoor): steady‑state σ ≈ 0.6° → light EMA is plenty on iOS.
- Worst‑case peak‑to‑peak jitter observed: **___°** on **___** *(pending Android)*
- Chosen filter: **☐ EMA (α ___)  ☐ Complementary  ☐ Complementary + drag‑to‑align**
- Rationale:
- *Leaning:* per‑platform — **EMA α≈0.18 on iOS** (heading is pre‑fused by iOS), decide
  Android after testing; keep `webkitCompassAccuracy` / an Android equivalent as a
  "recalibrate" trigger.

### D‑0.2 · Declination source *(task 0‑5)*

- Source: **WMM2025 `.COF`** (NOAA NCEI, public domain)
- File size: **___ KB**  ·  evaluator est. **~6 KB** → total **___ KB** ( < 50 KB ✅ / ❌ )
- Does any tested phone already report **true** heading? → **iPhone 17: YES** (`webkitCompassHeading`
  is true north). So declination is an **Android‑only** correction. Confirm on the Android device.

### D‑0.3 · Default assumed hFOV per platform
> Camera FOV is almost never exposed (`camera FOV exposed: no`). Stage 3 adds a
> calibration flow; pick a starting default now.

- iOS default hFOV: **___°** *(iPhone 17, 1280×720 `environment` stream — needs calibration in Stage 3)*   ·   Android default hFOV: **___°**

### D‑0.4 · Target test devices for the rest of the build

- Primary iOS: **iPhone 17** ✅   ·   Primary Android: **___**   ·   Low‑end check: **___**

---

## Part D — Stage 0 exit checklist

- [ ] Spike deployed to an HTTPS URL and opens on all test devices
- [ ] Audit table filled for **each** device (Results log below)
- [ ] `absolute` orientation event confirmed present (or its absence noted per device)
- [ ] 60‑second drift watch: **pass** on the primary iOS and Android devices
- [ ] Known‑bearing check: label within **±5°** of true after choosing the right true/magnetic assumption
- [ ] Jitter measured on all devices; **D‑0.1** filled
- [ ] `WMM.COF` downloaded, size confirmed; **D‑0.2** filled
- [ ] `D‑0.3` and `D‑0.4` filled
- [ ] `BUILD-LOG.md` Stage 0 row set to ✅ with the date

When every box is ticked, Stage 1 (backend + data layer) can start.

---

## Results log

### Device 1 — iPhone 17, iOS Safari  ·  **indoor test 2026‑09‑11 (Delhi, 28.563 / 77.195)**

Read from screenshots (JSON export pending — re‑run and Copy JSON after the spike update):

| Row | Value | Verdict |
|---|---|---|
| source | `ios:webkitCompassHeading (true)` | ✅ true north, declination **not needed** on this device |
| absolute seen | yes | ✅ |
| event rate | 60 Hz | ✅ |
| gyro rate z | present (±1 °/s) | ✅ `devicemotion` available |
| screen angle | 0° (portrait) | ✅ |
| gps accuracy | 9 m (indoors) | ✅ |
| gps altitude | 244 m ±30 | ✅ **provided** (blueprint expected possible null — iPhone gives it, ±30 m coarse) |
| camera | 1280×720 environment | ✅ |
| camera FOV exposed | no | expected → Stage 3 calibration |

**Jitter (Test 3, indoor, on desk near metal furniture):**
`1801 samples @ 60 Hz` · mean 92.5° · **σ 0.56°** · peak‑to‑peak 6.22° · sparkline shows the
excursion is a **startup transient**, then flat. → Real read: **iPhone 17 compass is very
stable; the 6.22° was settling, not steady‑state noise.** (Spike updated 2026‑09‑11 to trim
the first 3 s and weight σ — re‑run to get the corrected number.)

**Drift 60 s:** not done — do outdoors.
**Known‑bearing:** not done — do outdoors (the important one).
**Subjective tracking:** phone was held tilted (pitch −36° / roll −25°); hold roughly level for bearing work.

> ⚠ **Setting to fix:** the spike's *"heading is"* was on **"magnetic → add declination"**, so it
> was adding a spurious +0.67°. On iOS it should be **"already true north"**. The spike update
> now auto‑selects that when it sees `webkitCompassHeading`.

```json
(paste Copy JSON here after re-running the updated spike)
```

### Device 2 — Android (model / OS: ___)  ·  not yet tested
```json

```

### Device 3 — low-end Android (model / OS: ___)  ·  not yet tested
```json

```

---

## Interim conclusions after Device 1 (iPhone 17)

- **API audit: iPhone 17 passes cleanly.** All sensors present, 60 Hz, GPS altitude provided.
- **Heading frame: iOS = TRUE north** (`webkitCompassHeading`). Declination correction is an
  **Android-only** concern → simplifies Stage 3 for iOS.
- **Jitter: iOS is not the constraint** for D‑0.1. σ ≈ 0.6° → light EMA is fine on iOS.
  The smoothing decision will be driven by the **worst Android** device — still to test.
- **Still blocking Stage 0 exit:** outdoor drift watch, outdoor known‑bearing check (both
  devices), Android testing, `WMM.COF` download.
