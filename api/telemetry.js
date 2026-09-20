/* ============================================================
   TrekSense — /api/telemetry   (Vercel serverless function)

   Stage 6, t6-8: client-side error-rate visibility. Same reasoning as
   api/peaks.js's own logging — no third-party analytics service, no
   database, just a structured line per event in Vercel's own (already
   free) function logs, greppable by the "[telemetry]" prefix. Combined
   with api/peaks.js's server-side logging this covers both halves the
   DoD asks for: Overpass call volume (api/peaks.js) and error rate
   (this endpoint, fed by real client-side JS errors and prepare
   outcomes — see registerTelemetry() in js/peakfinder.js).

   Deliberately open (no auth) and deliberately minimal: this is a
   public static site with no user accounts, so there's nothing to
   authenticate against. Payload is never trusted — every field is
   whitelisted/clipped before it's logged, since this endpoint is
   reachable by anyone, not just the real app.
   ============================================================ */

const MAX_STR = 300;
const ALLOWED_TYPES = new Set(["js-error", "unhandled-rejection", "prepare-outcome"]);

function clip(v) {
  if (v == null) return "";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > MAX_STR ? s.slice(0, MAX_STR) + "…" : s;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).end(); return; }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body && typeof body === "object" ? body : {};

  const type = ALLOWED_TYPES.has(body.type) ? body.type : "unknown";
  console.log(
    "[telemetry] client type=" + type +
    " message=" + JSON.stringify(clip(body.message)) +
    " context=" + JSON.stringify(clip(body.context)) +
    " path=" + JSON.stringify(clip(body.path))
  );

  res.setHeader("Cache-Control", "no-store");
  res.status(204).end();
};
