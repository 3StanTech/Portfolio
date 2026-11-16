// The black hole, locked to the page (black-hole FX, ported from the approved mock's hole.js).
// The interior and the rims live in the document and scroll with it on the browser's own
// scrolling thread, so they never trail the content; only brightness is computed per frame:
//   .bh-layer  absolute, document-sized, behind the content (after the sky canvas)
//     .bh-hole the interior: black, its arc-shaped edges cut by clip-path; inside it a sticky
//              viewport-sized canvas draws calm points falling to the centre and a dust spiral
//     .bh-rim  one canvas per horizon, placed at its apex; the glow is pre-rendered as a true
//              soft falloff (blurred shadows, never stacked hard strokes) and re-composited per
//              frame for heat, a slow swirl, the crossing sweep and ripple, embers and flares.
// Horizons: [data-horizon="in"] (the hero; you fall in scrolling down) and
// [data-horizon="out"] (the closer; you leave into the footer). Pages with neither get no hole.
// Under reduced motion or Save-Data: a still interior and rim, no embers, sweep or ripple.
import { mulberry, approach, smooth, clamp, easeInOutCubic, rgb, curve, sagAt, slopeAt, still } from './space.js';

// The soft rim: blurred bands (bloom, glow) and a sharp core, each layer's alpha rising with heat.
const SPEC = {
  bloom: [{ lw: 130, c: 'r1', a: 0.5, blur: 70 }, { lw: 56, c: 'r2', a: 0.62, blur: 34 }],
  glow: [{ lw: 22, c: 'r3', a: 0.75, blur: 13 }, { lw: 6, c: 'r4', a: 0.9, blur: 4 }],
  core: [{ lw: 1.7, c: 'r5', a: 1 }],
  alpha: { bloom: [0.45, 0.55], glow: [0.5, 0.5], core: [0.75, 0.25] }, doppler: [1.25, 0.7],
};

export function startHole() {
  const marks = [...document.querySelectorAll('[data-horizon]')];
  if (!marks.length) return null;
  const layer = document.createElement('div'); layer.className = 'bh-layer'; layer.setAttribute('aria-hidden', 'true');
  const box = document.createElement('div'); box.className = 'bh-hole';
  const inCv = document.createElement('canvas'); inCv.className = 'bh-in';
  box.append(inCv); layer.append(box);
  const sky = document.querySelector('.sky');
  (sky ? sky.after(layer) : document.body.prepend(layer));
  const inCtx = inCv.getContext('2d');

  const rims = marks.map((el) => {
    const cv = document.createElement('canvas'); cv.className = 'bh-rim'; layer.append(cv);
    return { el, dir: el.dataset.horizon, cv, ctx: cv.getContext('2d'), heat: 0.3, lastP: null, armed: true, ev: null, embers: [], flares: [], layers: null };
  });
  const rIn = rims.find((r) => r.dir === 'in'), rOut = rims.find((r) => r.dir === 'out');

  let w = 0, vh = 0, lastW = -1, dpr = 1, geom = null, maxSag = 0, G = 140, kk = 1, docH = 0, boxTop = 0, boxH = 0;
  const pal = {};
  const readPal = () => Object.assign(pal, {
    r1: rgb('--rim-1', '194 65 12'), r2: rgb('--rim-2', '217 110 30'), r3: rgb('--rim-3', '233 162 92'), r4: rgb('--rim-4', '255 214 160'), r5: rgb('--rim-5', '255 246 234'),
    sweep: rgb('--rim-sweep', '255 244 228'), ember: rgb('--ember-rgb', '233 162 92'), emberHot: rgb('--ember-hot-rgb', '255 227 190'),
    steelLight: rgb('--steel-light-rgb', '157 187 230'), white: '255,255,255',
  });

  // ---------- Layout (on resize and when the page's height changes; never per frame) ----------
  function measure() {
    w = document.documentElement.clientWidth;
    if (w !== lastW) { vh = innerHeight; lastW = w; } // a phone toolbar does not reshape the arc
    dpr = Math.min(2, devicePixelRatio || 1);
    geom = curve(w, vh);
    maxSag = sagAt(-60, w, geom);
    kk = clamp(w / 1440, 0.62, 1);
    G = Math.round(210 * kk); // room for the widest blurred band, so it never clips
    const sy = scrollY;
    const b = document.body.getBoundingClientRect();
    docH = Math.ceil(b.bottom + sy + parseFloat(getComputedStyle(document.body).marginBottom || 0));
    layer.style.height = docH + 'px';
    for (const r of rims) {
      const rc = r.el.getBoundingClientRect();
      r.apex = r.dir === 'in' ? rc.bottom + sy - 150 : rc.top + sy + 150;
      r.top = r.dir === 'in' ? r.apex - G : r.apex - maxSag - G;
      r.h = Math.ceil(maxSag + 2 * G);
      r.cv.style.top = r.top + 'px'; r.cv.style.height = r.h + 'px';
      r.cv.width = Math.round(w * dpr); r.cv.height = Math.round(r.h * dpr);
      r.layers = prerender(r);
      r.tmp = r.tmp || document.createElement('canvas'); r.tmp.width = r.cv.width; r.tmp.height = r.cv.height;
    }
    boxTop = rIn ? rIn.apex : 0;
    const bottom = rOut ? rOut.apex : docH;
    boxH = Math.max(0, bottom - boxTop);
    box.style.top = boxTop + 'px'; box.style.height = boxH + 'px';
    const pts = [], N = 96;
    for (let i = 0; i <= N; i++) { const x = w * i / N; pts.push(`${x.toFixed(1)} ${(rIn ? sagAt(x, w, geom) : 0).toFixed(1)}`); }
    for (let i = N; i >= 0; i--) { const x = w * i / N; pts.push(`${x.toFixed(1)} ${(boxH - (rOut ? sagAt(x, w, geom) : 0)).toFixed(1)}`); }
    box.style.clipPath = `path('M ${pts.join(' L ')} Z')`;
    interior.size();
    schedule();
  }
  // Local y of the arc in a rim canvas, in CSS px.
  const localY = (r, x) => (r.dir === 'in' ? G + sagAt(x, w, geom) : G + maxSag - sagAt(x, w, geom));

  // ---------- Rim pre-render ----------
  // Each blurred pass draws only a stroke's shadow (the path is moved off-canvas and the shadow
  // offset brings it back): a smooth Gaussian, never a stack of hard-edged bands.
  function prerender(r) {
    const W = r.cv.width, H = r.cv.height, out = {};
    for (const name of ['bloom', 'glow', 'core']) {
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const c = cv.getContext('2d'); c.lineCap = 'round'; c.lineJoin = 'round';
      for (const p of SPEC[name]) {
        const lw = Math.max(0.8, p.lw * (p.blur ? kk : Math.max(0.85, kk))) * dpr;
        const shift = p.blur ? W + 400 : 0;
        c.beginPath();
        for (let i = 0; i <= 120; i++) { const x = -60 + (w + 120) * i / 120; const y = localY(r, x); i ? c.lineTo((x * dpr) - shift, y * dpr) : c.moveTo((x * dpr) - shift, y * dpr); }
        c.lineWidth = lw; c.strokeStyle = `rgba(${pal[p.c]},${p.a})`;
        if (p.blur) { c.shadowColor = `rgba(${pal[p.c]},${p.a})`; c.shadowBlur = p.blur * kk * dpr; c.shadowOffsetX = shift; }
        else { c.shadowBlur = 0; c.shadowOffsetX = 0; }
        c.stroke();
      }
      // Doppler: one side brighter (static; the swirl adds the motion).
      c.shadowBlur = 0; c.shadowOffsetX = 0; c.globalCompositeOperation = 'destination-in';
      const g = c.createLinearGradient(0, 0, W, 0), [d0, d1] = SPEC.doppler;
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, `rgba(0,0,0,${d1 / d0})`);
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      out[name] = cv;
    }
    return out;
  }

  const interior = well(inCtx, inCv, pal);

  // ---------- Per-frame ----------
  let raf = 0, last = performance.now(), t = 0, speed = 0, lastSY = scrollY;
  const visible = (r) => { const top = r.top - scrollY; return top < vh + 40 && top + r.h > -40; };

  // A soft band of one pre-rendered layer, centred at u (0..1 across the width).
  function band(r, src, uc, half, alpha, colour) {
    const tc = r.tmp.getContext('2d'), W = r.tmp.width, H = r.tmp.height;
    tc.globalCompositeOperation = 'copy'; tc.globalAlpha = 1; tc.drawImage(src, 0, 0);
    tc.globalCompositeOperation = 'destination-in';
    const g = tc.createLinearGradient(0, 0, W, 0), add = (u, a) => { if (u > 0 && u < 1) g.addColorStop(u, `rgba(0,0,0,${a})`); };
    g.addColorStop(0, 'rgba(0,0,0,0)'); add(uc - half, 0); add(uc - half * 0.35, 0.6); add(uc, 1); add(uc + half * 0.35, 0.6); add(uc + half, 0); g.addColorStop(1, 'rgba(0,0,0,0)');
    tc.fillStyle = g; tc.fillRect(0, 0, W, H);
    if (colour) { tc.globalCompositeOperation = 'source-atop'; tc.fillStyle = colour; tc.fillRect(0, 0, W, H); }
    r.ctx.globalAlpha = alpha; r.ctx.drawImage(r.tmp, 0, 0);
  }

  function drawRim(r, dt, frozen) {
    const c = r.ctx, L = r.layers, H = r.heat, A = SPEC.alpha;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    c.clearRect(0, 0, r.cv.width, r.cv.height);
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = A.bloom[0] + A.bloom[1] * H; c.drawImage(L.bloom, 0, 0);
    c.globalAlpha = A.glow[0] + A.glow[1] * H; c.drawImage(L.glow, 0, 0);
    c.globalAlpha = A.core[0] + A.core[1] * H; c.drawImage(L.core, 0, 0);
    if (!frozen) {
      // The slow swirl: a soft brighter band travels the disk once every 26 s.
      const u = ((t / 26) % 1) * 1.4 - 0.2;
      band(r, L.glow, u, 0.22, 0.28 + 0.3 * H);
      if (r.ev) {
        const age = t - r.ev.t0;
        if (age > 1.6) r.ev = null;
        else {
          // Sweep: one band of white-gold light runs the disk in the direction you scrolled.
          const D = 0.95;
          if (age < D) { const e = easeInOutCubic(age / D), uc = r.ev.s > 0 ? -0.12 + 1.24 * e : 1.12 - 1.24 * e; band(r, L.core, uc, 0.1, 1, `rgb(${pal.sweep})`); band(r, L.glow, uc, 0.12, 0.9, `rgb(${pal.sweep})`); }
          // Ripple: two faint copies of the rim spread away from the hole and fade.
          for (const [k, s] of [[0, 1], [0.18, 0.55]]) {
            const b = (age - k) / 1.15; if (b <= 0 || b >= 1) continue;
            const off = (r.dir === 'in' ? -1 : 1) * (1 - (1 - b) ** 3) * 110 * kk * dpr, f = s * (1 - b) ** 1.8;
            c.globalAlpha = 0.5 * f; c.drawImage(L.core, 0, off);
            c.globalAlpha = 0.18 * f; c.drawImage(L.glow, 0, off);
          }
        }
      }
      // Embers lift off the rim as it heats.
      if (H > 0.35 && r.embers.length < 70 && Math.random() < H * 0.7) {
        const x = Math.random() * w, y = localY(r, x);
        r.embers.push({ x, y, vx: (Math.random() - 0.5) * 40, vy: (r.dir === 'in' ? -1 : 1) * (14 + Math.random() * 46) * H, life: 0, max: 0.8 + Math.random() * 1.2 });
      }
      r.embers = r.embers.filter((e) => (e.life += dt) < e.max);
      for (const e of r.embers) {
        e.x += e.vx * dt; e.y += e.vy * dt; const f = 1 - e.life / e.max;
        c.globalAlpha = 0.7 * f; c.fillStyle = `rgb(${f > 0.6 ? pal.emberHot : pal.ember})`;
        c.beginPath(); c.arc(e.x * dpr, e.y * dpr, (0.6 + 1.1 * f) * dpr, 0, Math.PI * 2); c.fill();
      }
      // Flares where a shooting star falls into the rim.
      r.flares = r.flares.filter((f) => (f.age += dt) < 0.9);
      for (const f of r.flares) {
        const k = f.age / 0.9, a = Math.sin(Math.PI * Math.min(1, k * 2.2)) * (1 - k), R = (10 + 40 * k) * dpr;
        const g = c.createRadialGradient(f.x * dpr, f.y * dpr, 0, f.x * dpr, f.y * dpr, R);
        g.addColorStop(0, `rgba(${pal.r5},${0.9 * a})`); g.addColorStop(0.3, `rgba(${pal.r4},${0.4 * a})`); g.addColorStop(1, `rgba(${pal.r3},0)`);
        c.globalAlpha = 1; c.fillStyle = g; c.fillRect(f.x * dpr - R, f.y * dpr - R, R * 2, R * 2);
      }
    } else { r.embers = []; r.flares = []; r.ev = null; }
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  }

  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
    const frozen = still();
    if (!frozen) t += dt;
    const v = Math.abs(scrollY - lastSY) / dt; lastSY = scrollY;
    speed = frozen ? 0 : approach(speed, clamp(v / 1600, 0, 1), 0.2, dt);
    for (const r of rims) {
      const p = (r.apex - scrollY) / vh;
      // Crossing: fires when the rim passes the middle of the screen, once per pass. It re-arms
      // only after the rim has left the screen, and a running sweep is never restarted.
      if (!visible(r)) r.armed = true;
      if (r.lastP !== null && r.armed && !r.ev && !frozen && (r.lastP - 0.5) * (p - 0.5) < 0) { r.ev = { t0: t, s: p < r.lastP ? 1 : -1 }; r.armed = false; }
      r.lastP = p;
      // Blaze: strongest as the rim passes the upper middle of the screen, and while you move.
      const prox = Math.exp(-(((r.dir === 'in' ? p - 0.32 : p - 0.62) / 0.34) ** 2));
      const target = frozen ? 0.3 : Math.min(1, 0.22 + 0.5 * prox + 0.55 * speed * prox);
      r.heat = frozen ? 0.3 : approach(r.heat, target, 0.22, dt);
      if (visible(r)) drawRim(r, dt, frozen);
    }
    const info = view();
    if (info) interior.draw(info, dt, frozen, speed);
    if (!frozen) schedule();
  }
  // The visible part of the interior, in viewport px.
  function view() {
    const top = rIn ? rIn.apex - scrollY : -1e5, bot = rOut ? rOut.apex - scrollY : docH - scrollY;
    if (top > vh || bot < 0) return null;
    const rect = inCv.getBoundingClientRect();
    const y0 = Math.max(0, top), y1 = Math.min(vh, bot);
    return { y0, y1, cx: w / 2, cy: (y0 + y1) / 2, offset: rect.top };
  }
  function schedule() { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); }

  // ---------- Queries for the sky (shooting stars and the horizon smear) ----------
  const near = (r, x, y) => Math.abs(r.apex - scrollY + (r.dir === 'in' ? 1 : -1) * sagAt(x, w, geom) - y) < 80;
  const api = {
    // The bands of the screen that are open sky, not interior.
    skyBands(h) {
      const out = [];
      if (rIn) { const a = rIn.apex - scrollY; if (a > 0) out.push([0, Math.min(h, a)]); }
      if (rOut) { const a = rOut.apex - scrollY; if (a < h) out.push([Math.max(0, a), h]); }
      return out;
    },
    inside(x, y) {
      const top = rIn ? rIn.apex - scrollY + sagAt(x, w, geom) : -1e5, bot = rOut ? rOut.apex - scrollY - sagAt(x, w, geom) : 1e5;
      return y > top && y < bot;
    },
    // Where a shooting star at (x, y) is pulled: just inside the nearest rim.
    pullPoint(x, y, h) {
      if (rIn) { const a = rIn.apex - scrollY; if (a > -200 && a < h + 200 && y < a + sagAt(x, w, geom)) return [x * 0.7 + w * 0.15, a + sagAt(x, w, geom) + 60]; }
      if (rOut) { const a = rOut.apex - scrollY; if (a > -200 && a < h + 200 && y > a - sagAt(x, w, geom)) return [x * 0.7 + w * 0.15, a - sagAt(x, w, geom) - 60]; }
      return null;
    },
    flare(x, y) {
      const r = (rIn && near(rIn, x, y)) ? rIn : (rOut && near(rOut, x, y)) ? rOut : null;
      if (r) { r.flares.push({ x, y: localY(r, x), age: 0 }); schedule(); }
    },
    rimsOnScreen(h) {
      return rims.filter((r) => { const a = r.apex - scrollY; return a > -maxSag - 100 && a < h + maxSag + 100; }).map((r) => {
        const a = r.apex - scrollY, sgn = r.dir === 'in' ? 1 : -1;
        return { dir: r.dir, yAt: (x) => a + sgn * sagAt(x, w, geom), slopeAt: (x) => sgn * slopeAt(x, w, geom) };
      });
    },
  };

  readPal();
  measure();
  addEventListener('resize', measure);
  addEventListener('load', measure);
  document.fonts?.ready.then(measure);
  let ro = 0;
  new ResizeObserver(() => { if (!ro) ro = requestAnimationFrame(() => { ro = 0; measure(); }); }).observe(document.body);
  addEventListener('scroll', () => { if (still()) schedule(); }, { passive: true });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { last = performance.now(); schedule(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else { last = performance.now(); schedule(); } });
  return api;
}

// ---------- The interior: the gravity well ----------
// Draws into the sticky interior canvas in viewport coordinates (the canvas's own offset from
// the top of the screen is undone), so its motion stays put while the page scrolls past it;
// the clip-path on .bh-hole keeps it inside the rims. Calm points fall straight at the centre,
// gentle far out and quickening near it, each with a faint tail; slow dust spirals in.
function well(ctx, cv, pal) {
  let stars = [], dust = [], bw = -1, Rm = 600;
  const rand = mulberry(53);
  const spawn = (s, outer) => { s.r = Rm * (outer ? 0.75 + 0.3 * rand() : 0.08 + 0.95 * rand()); s.th = rand() * 6.283; s.age = outer ? 0 : 5; return s; };
  const fit = () => {
    const dpr = Math.min(2, devicePixelRatio || 1), W = Math.round(cv.clientWidth * dpr), H = Math.round(cv.clientHeight * dpr);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  };
  return {
    size() {
      fit(); const w = cv.clientWidth, h = cv.clientHeight; if (w === bw) return; bw = w;
      Rm = Math.hypot(w, h) / 2 + 40;
      const n = clamp(Math.round(w * h * 0.00012), 60, 200);
      stars = Array.from({ length: n }, () => spawn({ z: rand(), v: 4 + 10 * rand(), c: rand() > 0.82 ? 'steelLight' : rand() > 0.9 ? 'r3' : 'white' }, false));
      dust = Array.from({ length: Math.round(n * 1.8) }, () => spawn({ z: rand(), v: 2 + 3 * rand(), s: 0.7 + rand() * 1.3, a: 0.08 + 0.16 * rand() }, false));
    },
    draw(info, dt, frozen, speed) {
      const dpr = Math.min(2, devicePixelRatio || 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, -info.offset * dpr);
      ctx.clearRect(0, info.offset, cv.width / dpr, cv.height / dpr);
      const { cx, cy } = info;
      ctx.lineCap = 'round';
      for (const d of dust) {
        if (!frozen) { d.th += dt * 0.05 * (Rm / (d.r + 90)) ** 0.8; d.r -= dt * d.v * (0.5 + d.r / Rm) * (1 + 2 * speed); d.age += dt; if (d.r < 10) spawn(d, true); }
        const x = cx + Math.cos(d.th) * d.r, y = cy + Math.sin(d.th) * d.r * 0.82;
        if (y < info.y0 - 4 || y > info.y1 + 4) continue;
        ctx.globalAlpha = d.a * smooth(d.r / 90) * smooth(d.age / 2); ctx.fillStyle = `rgb(${pal.r3})`;
        ctx.fillRect(x, y, d.s, d.s);
      }
      for (const s of stars) {
        if (!frozen) {
          const pull = 1.4 * (0.6 + 1.6 * (1 - s.r / Rm) ** 2);
          s.r -= dt * s.v * pull * (1 + 5 * speed); s.age += dt;
          if (s.r < 12) spawn(s, true);
        }
        const ux = Math.cos(s.th), uy = Math.sin(s.th) * 0.82, x = cx + ux * s.r, y = cy + uy * s.r;
        if (y < info.y0 - 80 || y > info.y1 + 80) continue;
        const A = (0.14 + 0.4 * s.z) * smooth(s.r / 70) * smooth(s.age / 1.5), c = pal[s.c];
        // A point with a faint tail behind it, so its direction reads; the tail stretches on scroll.
        const nearC = 1 - clamp(s.r / Rm, 0, 1), len = 3 + 9 * nearC * s.z + 120 * speed * s.z * (s.r / Rm);
        const g = ctx.createLinearGradient(x, y, x + ux * len, y + uy * len);
        g.addColorStop(0, `rgba(${c},${Math.min(1, A * 1.2)})`); g.addColorStop(1, `rgba(${c},0)`);
        ctx.globalAlpha = 1; ctx.lineWidth = 0.5 + 0.8 * s.z; ctx.strokeStyle = g;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + ux * len, y + uy * len); ctx.stroke();
        ctx.globalAlpha = Math.min(1, A * 1.2); ctx.fillStyle = `rgb(${c})`;
        ctx.beginPath(); ctx.arc(x, y, 0.45 + 0.7 * s.z, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  };
}
