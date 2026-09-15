# `/api/peaks` — frozen response schema

Stage 1 deliverable of the [Peak Finder AR blueprint](peak-finder-ar-blueprint.html).
This contract is **frozen**: fields won't be renamed, retyped, or removed. New fields
may be added (clients must ignore unknown fields). Breaking changes bump the path
(`/api/v2/peaks`), not this one.

## Request

```
GET /api/peaks?bbox=south,west,north,east
```

| Param | Required | Type | Notes |
|---|---|---|---|
| `bbox` | yes | `"south,west,north,east"` — 4 comma-separated decimal degrees | See limits below |

**Limits** (violating any → `400`):
- `south < north`, `west < east`
- `south ≥ -90`, `north ≤ 90`, `west ≥ -180`, `east ≤ 180`
- each side ≤ **3°**
- area ≤ **1.0 deg²** (≈ 4 tiles) — request one [tile](#tile-scheme) at a time in normal use

The client (Stage 2+ on-device store) should always request **exact 0.5° tiles**
from `js/tiles.js` — identical requests then land on the same cached URL and cost
zero provider calls on repeat views. Non-tile-aligned boxes work (useful for
`curl`/debugging) but won't share a cache entry with a neighbouring tile request.

## Response — `200`

```jsonc
{
  "bbox": [30.5, 79.0, 31.0, 79.5],      // echoes the request, [s, w, n, e]
  "tileKey": "30.5_79.0",                 // set only if bbox is exactly one canonical tile, else null
  "generatedAt": "2026-09-12T10:00:00.000Z",
  "source": "osm",                        // "osm" | "fallback"
  "degraded": true,                       // present + true only when source is "fallback"
  "providerError": "Overpass HTTP 504",   // present only when degraded
  "count": 97,
  "peaks": [
    {
      "id": "osm:node/342104861",         // stable — safe to use as a merge/upsert key
      "name": "Mukut Parbat",
      "lat": 30.95077,
      "lon": 79.56775,
      "elevation": 7242,                  // metres, integer, or null if OSM has no ele tag
      "prominence": null,                 // metres, integer, or null — rarely present in OSM
      "region": null,                     // free text or null — rarely present in OSM
      "source": "osm"                     // "osm" | "fallback" — per-peak, matches the top-level source
    }
  ]
}
```

Peaks are sorted by `elevation` descending (nulls last). Duplicate names within
~100 m of each other are collapsed to one record.

## Response — `400`

```json
{ "error": "bbox must have south < north and west < east" }
```

## Filtering

OpenStreetMap's `natural=peak` tag is used for everything from Everest to a
novelty waypoint someone dropped on a cycling app. A node is only kept if:

- it has a `name` tag, **and**
- it has `ele ≥ 1000` (metres), **or** it carries a `wikidata`/`wikipedia` tag
  (notable enough to be worth showing even without a logged elevation)

## Caching

- Success (`source: "osm"`): `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`
- Degraded (`source: "fallback"`): `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`
  (short — so a real provider recovery is picked up within the hour)

Caching is per exact request URL (Vercel edge). There is no server-side database —
repeat-view economy comes entirely from (a) this HTTP cache and (b) the client's
own on-device store (Stage 2+), which is why tile-aligned requests matter.

## Tile scheme

See [`js/tiles.js`](../js/tiles.js) — frozen 0.5° × 0.5° grid (~55 km at Himalayan
latitudes), shared verbatim between this API and the on-device store. A tile key
is its lower-left corner, `"<south>_<west>"`, e.g. `"30.5_79.0"`.

```js
Tiles.tileKeyFor(30.7, 79.2)        // "30.5_79.0"
Tiles.tileKeyToBbox("30.5_79.0")    // { s: 30.5, w: 79.0, n: 31.0, e: 79.5 }
Tiles.bboxToTileKeys({ s, w, n, e }) // [ "30.5_79.0", "30.5_79.5", ... ]
```

## Examples

```bash
# a single tile over the Gangotri group
curl "https://<deployment>/api/peaks?bbox=30.5,79.0,31.0,79.5"

# invalid — area too large
curl "https://<deployment>/api/peaks?bbox=20,70,35,90"
# → 400 "bbox area too large — max 1 deg² (~4 tiles). Request one tile at a time."
```

## Provider

[Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) over OpenStreetMap
data — no API key. `queryOverpass()` in `api/peaks.js` is the only
provider-specific function; swap it for any other source without touching this
schema or any client code. On provider failure (timeout, non-2xx, both mirrors
down) the endpoint still returns `200` with `api/_fallback-peaks.json`
(~130 major Himalayan summits) and `degraded: true` — callers should never need
to special-case a network error from this endpoint, only check `degraded`.
