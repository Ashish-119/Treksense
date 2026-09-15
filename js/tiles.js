/* ============================================================
   TrekSense — tiles.js   (Peak Finder — frozen tile scheme)

   The peak-data cache is tiled on a fixed 0.5° × 0.5° grid
   (~55 km at Himalayan latitudes). A tile key is the "S_W"
   coordinate of its lower-left corner, e.g. "30.5_79.0" covers
   [30.5°N–31.0°N] × [79.0°E–79.5°E].

   Frozen for Stage 1 (backend) and Stage 2+ (on-device store) to
   share identically — do not change TILE_DEG without bumping the
   dataset schema version (see docs/PEAKS-API.md).

   Works as a browser global (`Tiles`) via <script src="js/tiles.js">
   and as a CommonJS module via require() — no build step needed
   either way.
   ============================================================ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Tiles = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var TILE_DEG = 0.5;

  function snapDown(v, step) { return Math.floor(v / step) * step; }
  function r4(v) { return Math.round(v * 10000) / 10000; }
  function r1(v) { return Math.round(v * 10) / 10; }          // tile edges are multiples of 0.5
  function keyOf(s, w) { return r1(s) + "_" + r1(w); }

  /** The tile key of the 0.5° cell containing (lat, lon). */
  function tileKeyFor(lat, lon) {
    return keyOf(snapDown(lat, TILE_DEG), snapDown(lon, TILE_DEG));
  }

  /** { s, w, n, e } bounding box for a tile key. */
  function tileKeyToBbox(tileKey) {
    var parts = String(tileKey).split("_");
    var s = parseFloat(parts[0]), w = parseFloat(parts[1]);
    if (!isFinite(s) || !isFinite(w)) return null;
    return { s: s, w: w, n: r4(s + TILE_DEG), e: r4(w + TILE_DEG) };
  }

  /** All tile keys whose cells intersect a bbox { s, w, n, e }. */
  function bboxToTileKeys(bbox) {
    var s0 = snapDown(bbox.s, TILE_DEG);
    var w0 = snapDown(bbox.w, TILE_DEG);
    var s1 = snapDown(bbox.n - 1e-9, TILE_DEG);
    var w1 = snapDown(bbox.e - 1e-9, TILE_DEG);
    var keys = [];
    for (var s = s0; s <= s1 + 1e-9; s = r4(s + TILE_DEG)) {
      for (var w = w0; w <= w1 + 1e-9; w = r4(w + TILE_DEG)) {
        keys.push(keyOf(s, w));
      }
    }
    return keys;
  }

  /** Tile keys covering a ~radiusKm disc around (centerLat, centerLon) — used by the Stage 4 preparer. */
  function tilesCoveringDisc(centerLat, centerLon, radiusKm) {
    var dLat = radiusKm / 111;
    var dLon = radiusKm / (111 * Math.max(0.15, Math.cos(centerLat * Math.PI / 180)));
    return bboxToTileKeys({
      s: centerLat - dLat, w: centerLon - dLon,
      n: centerLat + dLat, e: centerLon + dLon
    });
  }

  /** True if bbox is (within float tolerance) exactly one canonical tile. */
  function bboxIsTile(bbox) {
    var eps = 1e-6;
    var sSnapped = Math.abs(bbox.s - snapDown(bbox.s, TILE_DEG)) < eps;
    var wSnapped = Math.abs(bbox.w - snapDown(bbox.w, TILE_DEG)) < eps;
    var sizeOk = Math.abs((bbox.n - bbox.s) - TILE_DEG) < eps && Math.abs((bbox.e - bbox.w) - TILE_DEG) < eps;
    return sSnapped && wSnapped && sizeOk;
  }

  return {
    TILE_DEG: TILE_DEG,
    tileKeyFor: tileKeyFor,
    tileKeyToBbox: tileKeyToBbox,
    bboxToTileKeys: bboxToTileKeys,
    tilesCoveringDisc: tilesCoveringDisc,
    bboxIsTile: bboxIsTile
  };
});
