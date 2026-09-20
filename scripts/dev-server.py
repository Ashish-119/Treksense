#!/usr/bin/env python3
"""
TrekSense local dev server.

Serves the static site AND emulates the Vercel serverless function at
/api/peaks (api/peaks.js) so Peak Finder work can be tested end-to-end
without deploying. Vercel runs the real Node function in production; this
is only for `python3 scripts/dev-server.py` on your machine.

    python3 scripts/dev-server.py [port]      # default 8000
    → http://localhost:8000/api/peaks?bbox=30.5,79.0,31.0,79.5
"""
import datetime
import json
import re
import sys
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

try:
    import ssl
    import certifi
    SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:  # certifi optional
    SSL_CTX = None

ROOT = Path(__file__).resolve().parent.parent
FALLBACK = json.loads((ROOT / "api" / "_fallback-peaks.json").read_text())
OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]
MAX_BBOX_DEG2 = 1.0
MAX_BBOX_SIDE_DEG = 3
TILE_DEG = 0.5


def parse_ele(raw):
    if raw is None:
        return None
    m = re.search(r"-?\d+(\.\d+)?", str(raw).replace(",", ""))
    return round(float(m.group())) if m else None


def is_mountain_peak(tags, elevation):
    if elevation is not None and elevation >= 1000:
        return True
    return bool(tags.get("wikidata") or tags.get("wikipedia"))


def query_overpass(bbox):
    q = (
        "[out:json][timeout:25];"
        f'(node["natural"="peak"]["name"]({bbox["s"]},{bbox["w"]},{bbox["n"]},{bbox["e"]});); '
        "out body 800;"
    )
    data = urllib.parse.urlencode({"data": q}).encode()
    last_err = None
    for url in OVERPASS_ENDPOINTS:
        req = urllib.request.Request(
            url, data=data,
            headers={"User-Agent": "TrekSense-PeakFinder/2.0 (local dev)",
                     "Content-Type": "application/x-www-form-urlencoded"},
        )
        try:
            with urllib.request.urlopen(req, timeout=15, context=SSL_CTX) as r:
                return json.load(r).get("elements", [])
        except Exception as e:
            last_err = e
    raise last_err or RuntimeError("Overpass unavailable")


def normalise(elements):
    seen = {}
    for el in elements:
        lat = el.get("lat") or (el.get("center") or {}).get("lat")
        lon = el.get("lon") or (el.get("center") or {}).get("lon")
        tags = el.get("tags") or {}
        name = tags.get("name") or tags.get("name:en")
        if lat is None or lon is None or not name:
            continue
        elevation = parse_ele(tags.get("ele", tags.get("ele:m")))
        if not is_mountain_peak(tags, elevation):
            continue
        key = f"{name.lower()}@{lat:.3f},{lon:.3f}"
        if key in seen:
            continue
        seen[key] = {
            "id": f"osm:{el['type']}/{el['id']}",
            "name": name,
            "lat": round(float(lat), 5),
            "lon": round(float(lon), 5),
            "elevation": elevation,
            "prominence": parse_ele(tags.get("prominence")),
            "region": tags.get("place") or tags.get("is_in:region") or tags.get("is_in"),
            "source": "osm",
        }
    return list(seen.values())


def tile_key_if_exact(bbox):
    eps = 1e-6
    snap_s = (bbox["s"] // TILE_DEG) * TILE_DEG
    snap_w = (bbox["w"] // TILE_DEG) * TILE_DEG
    is_tile = (
        abs(bbox["s"] - snap_s) < eps and abs(bbox["w"] - snap_w) < eps and
        abs((bbox["n"] - bbox["s"]) - TILE_DEG) < eps and abs((bbox["e"] - bbox["w"]) - TILE_DEG) < eps
    )
    if not is_tile:
        return None
    return f"{round(bbox['s'], 1)}_{round(bbox['w'], 1)}"


def parse_bbox(raw):
    if not raw:
        return None, "Query param 'bbox' is required: bbox=south,west,north,east"
    try:
        s, w, n, e = [float(x.strip()) for x in raw.split(",")]
    except Exception:
        return None, "'bbox' must be 4 comma-separated numbers: south,west,north,east"
    if s < -90 or n > 90 or w < -180 or e > 180:
        return None, "bbox coordinates out of range"
    if s >= n or w >= e:
        return None, "bbox must have south < north and west < east"
    if (n - s) > MAX_BBOX_SIDE_DEG or (e - w) > MAX_BBOX_SIDE_DEG:
        return None, f"bbox side too large — max {MAX_BBOX_SIDE_DEG}° per side"
    if (n - s) * (e - w) > MAX_BBOX_DEG2:
        return None, f"bbox area too large — max {MAX_BBOX_DEG2} deg² (~4 tiles). Request one tile at a time."
    return {"s": s, "w": w, "n": n, "e": e}, None


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def _json(self, status, body):
        payload = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.rstrip("/") == "/api/peaks":
            return self._peaks(urllib.parse.parse_qs(parsed.query))
        if parsed.path.rstrip("/") == "/api/ping":
            return self._json(200, {"ok": True, "t": int(datetime.datetime.now().timestamp() * 1000)})
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.rstrip("/") == "/api/telemetry":
            return self._telemetry()
        self.send_response(404)
        self.end_headers()

    def _telemetry(self):
        # Mirrors api/telemetry.js: log a structured line, no storage, no
        # third-party service — this Python server is only a local stand-in
        # for the real Vercel function, so it just prints instead of relying
        # on a dashboard that doesn't exist locally.
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b""
        try:
            body = json.loads(raw.decode("utf-8")) if raw else {}
        except Exception:
            body = {}
        print(f"[telemetry] client type={body.get('type', 'unknown')} "
              f"message={body.get('message', '')!r} context={body.get('context')!r} "
              f"path={body.get('path', '')!r}", flush=True)
        self.send_response(204)
        self.end_headers()

    def _peaks(self, qs):
        bbox, err = parse_bbox(qs.get("bbox", [None])[0])
        if err:
            return self._json(400, {"error": err})
        base = {
            "bbox": [bbox["s"], bbox["w"], bbox["n"], bbox["e"]],
            "tileKey": tile_key_if_exact(bbox),
            "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        try:
            peaks = sorted(normalise(query_overpass(bbox)), key=lambda p: -(p["elevation"] or 0))
            self._json(200, {**base, "source": "osm", "count": len(peaks), "peaks": peaks})
        except Exception as e:
            peaks = [
                {"id": "fallback:" + p["name"].lower().replace(" ", "-"), "name": p["name"],
                 "lat": p["lat"], "lon": p["lon"], "elevation": p.get("elevation"),
                 "prominence": None, "region": p.get("range"), "source": "fallback"}
                for p in FALLBACK
                if bbox["s"] <= p["lat"] <= bbox["n"] and bbox["w"] <= p["lon"] <= bbox["e"]
            ]
            peaks.sort(key=lambda p: -(p["elevation"] or 0))
            self._json(200, {**base, "source": "fallback", "degraded": True,
                              "providerError": str(e), "count": len(peaks), "peaks": peaks})


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f"TrekSense dev server -> http://localhost:{port}/  (Ctrl+C to stop)")
    ThreadingHTTPServer(("", port), Handler).serve_forever()
