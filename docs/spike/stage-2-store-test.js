"use strict";
const $ = (id) => document.getElementById(id);
    const log = (msg) => { const el = $("log"); el.textContent = (el.textContent === "idle" ? "" : el.textContent + "\n") + msg; el.scrollTop = el.scrollHeight; };
    const fmtAge = (ms) => {
      if (ms == null) return "—";
      const s = Math.round((Date.now() - ms) / 1000);
      if (s < 60) return s + "s ago";
      if (s < 3600) return Math.round(s / 60) + "m ago";
      if (s < 86400) return Math.round(s / 3600) + "h ago";
      return Math.round(s / 86400) + "d ago";
    };
    function row(k, v, cls) { return `<div><span class="k">${k}</span><span class="v ${cls||""}">${v}</span></div>`; }

    /* ---- service worker ---- */
    async function initSW() {
      const rows = [];
      if (!("serviceWorker" in navigator)) {
        rows.push(row("service worker API", "not supported", "bad"));
      } else {
        try {
          const reg = await navigator.serviceWorker.register("/sw.js");
          await navigator.serviceWorker.ready;
          rows.push(row("service worker", "registered · scope " + reg.scope, "ok"));
        } catch (e) {
          rows.push(row("service worker", "FAILED: " + e.message, "bad"));
        }
      }
      rows.push(row("secure context", window.isSecureContext ? "yes" : "NO — sw/persist need https", window.isSecureContext ? "ok" : "bad"));
      rows.push(row("indexedDB", typeof indexedDB !== "undefined" ? "available" : "missing", typeof indexedDB !== "undefined" ? "ok" : "bad"));
      const persisted = await PeakStore.isPersisted();
      rows.push(row("storage persisted", persisted ? "yes" : "no (tap the button)", persisted ? "ok" : "warn"));
      $("swRows").innerHTML = rows.join("");
    }

    $("persistBtn").addEventListener("click", async () => {
      const ok = await PeakStore.requestPersistence();
      log(ok ? "storage.persist() → granted" : "storage.persist() → denied (browser decides; usually fine on installed/bookmarked PWAs)");
      initSW();
    });
    $("usageBtn").addEventListener("click", async () => {
      const est = await PeakStore.estimateUsage();
      log(est ? `usage: ${(est.usage/1024).toFixed(0)} KB / quota ${(est.quota/1024/1024).toFixed(0)} MB` : "estimate() not supported");
    });

    /* ---- geolocation ---- */
    $("geoBtn").addEventListener("click", () => {
      if (!navigator.geolocation) { log("geolocation not supported"); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => { $("lat").value = pos.coords.latitude.toFixed(4); $("lon").value = pos.coords.longitude.toFixed(4); log("location set from GPS"); },
        (err) => log("geolocation error: " + err.message)
      );
    });

    /* ---- prepare ---- */
    $("prepBtn").addEventListener("click", async () => {
      $("prepBtn").disabled = true;
      $("log").textContent = "";
      const center = { lat: parseFloat($("lat").value), lon: parseFloat($("lon").value) };
      const radius = parseInt($("radius").value, 10);
      log(`preparing ${radius} km around ${center.lat}, ${center.lon}…`);
      let hinted404 = false;
      try {
        const summary = await PeakStore.prepareArea(center, radius, {
          onStatus(evt) {
            if (evt.phase === "start") { log(`${evt.totalTiles} tiles cover this area · ${evt.toFetch} need fetching`); $("barFill").style.width = "2%"; }
            else if (evt.phase === "fetching") { log(`  → fetching ${evt.tileKey} (${evt.index + 1}/${evt.total})`); $("barFill").style.width = Math.round(((evt.index) / evt.total) * 100) + "%"; }
            else if (evt.phase === "tile-done") { log(`  ✓ ${evt.tileKey} — ${evt.peakCount} peaks${evt.degraded ? " (degraded/offline dataset)" : ""}`); $("barFill").style.width = Math.round(((evt.index + 1) / evt.total) * 100) + "%"; }
            else if (evt.phase === "tile-error") {
              log(`  ✗ ${evt.tileKey} — ${evt.error}`);
              if (!hinted404 && /HTTP 404/.test(evt.error)) {
                hinted404 = true;
                log(`  ⚠ /api/peaks is 404ing — this page is being served by something that only serves static files\n` +
                    `    (e.g. VS Code Live Server, port 5500). Stop that and run "python3 scripts/dev-server.py 8000"\n` +
                    `    instead, then reopen this page from http://localhost:8000/… — that's the only local server\n` +
                    `    here that emulates /api/peaks.`);
              }
            }
          }
        });
        log(`done — fetched ${summary.fetched}, failed ${summary.failed}, skipped(cached) ${summary.skipped}, evicted ${summary.evicted}, +${summary.peaksAdded} peaks`);
        if (summary.aborted) {
          log(`  ⚠ every tile failed — nothing was evicted and the prep centre wasn't moved.\n` +
              `    Whatever was previously prepared is untouched (this is deliberate: a\n` +
              `    failed attempt should never destroy good offline data).`);
        }
        $("barFill").style.width = "100%";
      } catch (e) {
        log("prepareArea() threw: " + e.message);
      }
      $("prepBtn").disabled = false;
      refreshPrep();
      refreshTiles();
    });

    $("clearBtn").addEventListener("click", async () => {
      await PeakStore.clearAll();
      log("cleared all stored peaks/tiles/prep");
      $("barFill").style.width = "0%";
      refreshPrep(); refreshTiles();
      $("peaksTable").querySelector("tbody").innerHTML = "";
      $("qcount").textContent = "0";
    });

    /* ---- status views ---- */
    async function refreshPrep() {
      const p = await PeakStore.getPrep();
      $("prepRows").innerHTML = p
        ? row("centre", `${p.center.lat.toFixed(3)}, ${p.center.lon.toFixed(3)}`) +
          row("radius", p.radiusKm + " km") +
          row("prepared", fmtAge(p.preparedAt)) +
          row("schema version", p.schemaVersion)
        : row("status", "nothing prepared yet", "warn");
    }
    async function refreshTiles() {
      const tiles = await PeakStore.allTiles();
      const tbody = $("tilesTable").querySelector("tbody");
      tbody.innerHTML = tiles.sort((a,b) => a.tileKey.localeCompare(b.tileKey)).map(t =>
        `<tr><td>${t.tileKey}</td><td><span class="tag ${t.status}">${t.status}</span></td><td>${t.peakCount}</td><td>${fmtAge(t.preparedAt)}</td></tr>`
      ).join("") || `<tr><td colspan="4" style="color:var(--dim)">none yet</td></tr>`;
    }

    $("queryBtn").addEventListener("click", async () => {
      const center = { lat: parseFloat($("lat").value), lon: parseFloat($("lon").value) };
      const radius = parseInt($("radius").value, 10);
      const peaks = await PeakStore.peaksForBox(center, radius);
      peaks.sort((a, b) => (b.elevation || 0) - (a.elevation || 0));
      $("qcount").textContent = peaks.length;
      $("peaksTable").querySelector("tbody").innerHTML = peaks.slice(0, 60).map(p =>
        `<tr><td>${p.name}</td><td>${p.elevation != null ? p.elevation + " m" : "—"}</td><td>${p.tileKey}</td></tr>`
      ).join("") || `<tr><td colspan="3" style="color:var(--dim)">no peaks stored for this area — prepare it first</td></tr>`;
    });

    initSW();
    refreshPrep();
    refreshTiles();
