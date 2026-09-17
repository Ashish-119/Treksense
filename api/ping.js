/* ============================================================
   TrekSense — /api/ping   (Vercel serverless function)

   A genuinely lightweight connectivity probe for js/peakstore.js's
   pingOnline() — no Overpass call, no external dependency, just an
   instant echo. /api/peaks was the wrong thing to ping: it always
   calls Overpass regardless of bbox size, so its latency reflects
   Overpass's mood, not whether the device is online. That mismatch
   made the online-gate report "offline" during perfectly good
   connections whenever Overpass was merely slow (see BUILD-LOG).
   ============================================================ */
module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ ok: true, t: Date.now() });
};
