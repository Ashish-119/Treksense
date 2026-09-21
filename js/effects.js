/* ============================================================
   TrekSense — effects.js
   Motion layer: scroll reveals, 3D tilt, parallax, count-ups,
   page-fade transitions. Fully skipped under reduced-motion.
   ============================================================ */

const FX = (() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---- Scroll reveal: elements rise & fade in, staggered ---- */
  function reveal(selector, stagger = 70) {
    if (reduced) return;
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add("fx-in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    els.forEach((el, i) => {
      el.classList.add("fx-reveal");
      el.style.transitionDelay = `${(i % 6) * stagger}ms`;
      io.observe(el);
    });
  }

  /* ---- 3D tilt on cards (desktop pointers only) ---- */
  function tilt(selector, max = 7) {
    if (reduced || !finePointer) return;
    document.querySelectorAll(selector).forEach(card => {
      card.classList.add("fx-tilt");
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateY(-5px) scale(1.015)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ---- Hero parallax: scene drifts slower than the scroll ---- */
  function parallax(container) {
    if (reduced) return;
    const el = document.querySelector(container);
    const scene = el && (el.querySelector("img.cover") || el.querySelector("svg.scene"));
    if (!scene) return;
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, el.offsetHeight);
        scene.style.transform = `translateY(${y * 0.35}px) scale(${1 + y * 0.0004})`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- Count-up numbers (e.g. "12,500 ft", "₹7,499") ---- */
  function countUp(selector, duration = 900) {
    if (reduced) return;
    document.querySelectorAll(selector).forEach(el => {
      const text = el.childNodes[0] && el.childNodes[0].nodeType === 3 ? el.childNodes[0].nodeValue : null;
      if (!text) return;
      const m = text.match(/^([^\d]*)([\d,]+)(.*)$/);
      if (!m) return;
      const target = parseInt(m[2].replace(/,/g, ""), 10);
      if (!Number.isFinite(target) || target === 0) return;
      const t0 = performance.now();
      const tick = now => {
        const k = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - k, 3);
        el.childNodes[0].nodeValue =
          m[1] + Math.round(target * eased).toLocaleString("en-IN") + m[3];
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---- Starfield: depth-parallax dots for a dark hero band ---- */
  function starfield(selector) {
    const canvas = document.querySelector(selector);
    if (!canvas) return;
    const hero = canvas.closest(".stars-hero") || canvas.parentElement;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, stars = [];
    const pointer = { x: 0, y: 0 };

    function makeStars() {
      const count = Math.max(40, Math.min(150, Math.round((w * h) / 2600)));
      stars = Array.from({ length: count }, () => {
        const depth = 0.3 + Math.random() * 0.7;      // 0.3 (far, small, slow) .. 1 (near, big, fast)
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: depth * (Math.random() * 1.1 + 0.5),
          depth,
          baseA: Math.random() * 0.5 + 0.35,
          phase: Math.random() * Math.PI * 2,
          speed: 0.15 + Math.random() * 0.35,
          drift: (Math.random() - 0.5) * 0.05
        };
      });
    }

    function resize() {
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeStars();
    }

    function paint(t, animate) {
      ctx.clearRect(0, 0, w, h);
      stars.forEach(s => {
        if (animate) {
          s.y -= s.drift * s.depth;
          if (s.y < -4) s.y = h + 4;
          if (s.y > h + 4) s.y = -4;
        }
        const twinkle = animate ? Math.sin(t * 0.0011 * s.speed + s.phase) * 0.3 : 0;
        const px = s.x + pointer.x * 12 * s.depth;
        const py = s.y + pointer.y * 8 * s.depth;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0.08, s.baseA + twinkle).toFixed(2)})`;
        ctx.fill();
      });
    }

    resize();
    window.addEventListener("resize", resize);

    if (reduced) { paint(0, false); return; }   // static field, no motion

    if (finePointer) {
      hero.addEventListener("mousemove", e => {
        const r = hero.getBoundingClientRect();
        pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });
      hero.addEventListener("mouseleave", () => { pointer.x = 0; pointer.y = 0; });
    }

    function loop(t) {
      paint(t, true);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ---- Page fade transitions between pages ---- */
  function pageEnter() {
    if (reduced) return;
    document.body.classList.add("fx-page-enter");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => document.body.classList.add("fx-page-ready")));
  }

  function navigate(url) {
    if (reduced) { location.href = url; return; }
    // hash-only change (e.g. Explore ⇄ Saved) never reloads the page —
    // fading out here would leave the body stuck invisible. Just go.
    const target = new URL(url, location.href);
    if (target.pathname === location.pathname && target.search === location.search) {
      location.href = url;
      return;
    }
    if (document.body.classList.contains("fx-page-exit")) return;  // ignore rapid re-clicks
    document.body.classList.add("fx-page-exit");
    setTimeout(() => { location.href = url; }, 240);
    // safety net: if navigation didn't happen (blocked/cancelled), un-freeze
    setTimeout(() => document.body.classList.remove("fx-page-exit"), 1600);
  }

  /* Intercept plain internal links for the fade (cards navigate via FX.navigate) */
  function interceptLinks() {
    if (reduced) return;
    document.addEventListener("click", e => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.target === "_blank" || href.startsWith("http")) return;
      const target = new URL(href, location.href);
      if (target.pathname === location.pathname && target.search === location.search) return; // hash-only: let the browser handle it
      e.preventDefault();
      navigate(href);
    });
  }

  return { reveal, tilt, parallax, countUp, pageEnter, navigate, interceptLinks, starfield };
})();

document.addEventListener("DOMContentLoaded", () => {
  FX.pageEnter();
  FX.interceptLinks();
});

/* Restore state when returning via bfcache (back button after fade-out) */
window.addEventListener("pageshow", e => {
  if (e.persisted) {
    document.body.classList.remove("fx-page-exit");
    document.body.classList.add("fx-page-enter", "fx-page-ready");
  }
});
