// The sky outside the black hole (black-hole FX, ported from the approved mock's galaxy.js):
// a pitch-black sky of drifting, twinkling stars with parallax, rich around the cursor and on
// the side you scroll toward, occasional shooting stars, and stars smeared toward the horizon
// where they touch it. No nebula and no hole drawing: hole.js owns the interior and the rims,
// locked to the page. Every ease is per unit of time, not per frame; stars are placed once per
// width, so a phone toolbar showing or hiding never re-places them.
// Under reduced motion or Save-Data the stars hold still (no drift, twinkle, parallax, cursor
// effects or shooting stars); the frame is redrawn on scroll so the smear follows the rim.
// Paused while the tab is hidden; devicePixelRatio capped at 2. Colours come from tokens.css.
import { mulberry, approach, smooth, rgb, color, still } from './space.js';

const O = { density: 0.00048, drift: 0.012, parallax: 0.34, starBoost: 1, twinkle: 1, twinkleRate: 1.6, glints: 0.07, base: 0.27, sparse: 0.54, radius: 300, tilt: 1, pull: -1 };
const METEOR_GAP = [6, 14]; // seconds between shooting stars
const BEND_REACH = 120;     // px outside the rim where stars smear toward it

// `hole` is hole.js's query API, or null on a page without a horizon (the 404 page).
export function starfield(canvas, hole) {
  const o = O;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, fieldH = 0, dpr = 1, stars = [], raf = 0, last = performance.now(), t = 0;
  let pal = {};
  const readPalette = () => {
    pal = { white: color('--star', '#fff'), cool: color('--star-cool', '#9DBBE6'), warm: color('--star-warm', '#E7A35A'),
      smear: { white: rgb('--smear', '255 250 240'), cool: rgb('--steel-light-rgb', '157 187 230'), warm: rgb('--star-warm-rgb', '231 163 90') },
      meteor: rgb('--meteor', '255 250 242'), meteorWarm: rgb('--rim-4', '255 214 160'), head: rgb('--meteor-head', '255 252 246'), headEdge: rgb('--glare', '255 240 222') };
  };

  let builtW = -1;
  function size() {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (w !== builtW) build();
  }
  function build() {
    builtW = w; readPalette();
    const rand = mulberry(7);
    fieldH = Math.max(h, screen.height || h, 700);
    const n = Math.round(w * fieldH * o.density) + 60;
    stars = Array.from({ length: n }, () => {
      const z = rand(), tint = rand();
      return {
        x: rand() * w, y: rand() * fieldH * 1.6, z,
        r: 0.35 + z * z * 1.25, a: 0.25 + z * 0.6,
        tw: rand() * Math.PI * 2, ts: (0.5 + rand() * 2.3) * o.twinkleRate, amp: o.twinkle * (0.35 + 0.65 * rand()),
        glint: z > 0.45 && rand() < o.glints, q: rand(),
        c: tint > 0.93 ? 'warm' : tint > 0.78 ? 'cool' : 'white',
      };
    });
  }

  // Pointer and scroll state (eased per unit of time).
  const ptr = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, on: 0, ton: 0 };
  let flow = 0, flowT = 0, lastSY = scrollY, lastMove = 0;
  const tl = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return; ptr.tx = e.clientX; ptr.ty = e.clientY; ptr.ton = 1; if (ptr.x < -1e3) { ptr.x = ptr.tx; ptr.y = ptr.ty; } }, { passive: true });
  document.addEventListener('pointerleave', () => { ptr.ton = 0; });
  addEventListener('blur', () => { ptr.ton = 0; });
  addEventListener('scroll', () => { const d = scrollY - lastSY; lastSY = scrollY; if (Math.abs(d) > 1) { flowT = Math.sign(d); lastMove = performance.now(); } }, { passive: true });
  function richAt(x, y) {
    let L = o.base;
    if (flow) { const f = flow > 0 ? y / h : 1 - y / h; L += (f - L) * Math.abs(flow); }
    if (ptr.on > 0.01) { const d = Math.hypot(x - ptr.x, y - ptr.y); L += (1 - L) * ptr.on * smooth(1 - d / o.radius); }
    return Math.max(0, Math.min(1, L));
  }

  // ---------- Shooting stars ----------
  // Occasional, and only where open sky is on screen. When the hole dominates the screen they
  // curve into it and flare at the rim; when the screen is mostly sky they fly straight and
  // tilt a little away from the hole.
  let meteors = [], nextAt = 0;
  const skyBands = () => (hole ? hole.skyBands(h) : [[0, h]]);
  function spawnMeteor() {
    const bands = skyBands().filter(([a, b]) => b - a > 120);
    if (!bands.length) return;
    const [ya, yb] = bands[Math.floor(Math.random() * bands.length)];
    const left = Math.random() < 0.5;
    let ang = (left ? 0.18 : Math.PI - 0.18) + (left ? 1 : -1) * Math.random() * 0.5; // shallow, falling
    let straight = !hole;
    const skyFrac = bands.reduce((a, [y0, y1]) => a + (y1 - y0), 0) / h;
    if (hole && skyFrac > 0.6) {
      straight = true;
      const rim = hole.rimsOnScreen(h)[0];
      const away = rim ? (rim.dir === 'in' ? -1 : 1) : (Math.random() < 0.5 ? -1 : 1); // -1 up (hole below), 1 down (hole above)
      const tilt = 0.08 + 0.22 * Math.random();
      ang = left ? away * tilt : Math.PI - away * tilt;
    }
    const sp = 620 + Math.random() * 520;
    meteors.push({
      x: w * (0.08 + Math.random() * 0.84), y: ya + (yb - ya) * Math.random() * 0.7,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 0, max: 0.75 + Math.random() * 0.55,
      len: 130 + Math.random() * 130, trail: [], flared: false, warm: Math.random() < 0.25, straight,
    });
  }
  function drawMeteors(dt) {
    if (still()) { meteors = []; return; }
    if (!nextAt) nextAt = t + 2 + Math.random() * 3;
    if (t >= nextAt) { spawnMeteor(); nextAt = t + METEOR_GAP[0] + Math.random() * (METEOR_GAP[1] - METEOR_GAP[0]); }
    if (!meteors.length) return;
    ctx.save(); ctx.lineCap = 'round'; ctx.globalCompositeOperation = 'lighter';
    meteors = meteors.filter((m) => (m.life += dt) < m.max);
    for (const m of meteors) {
      if (!m.straight) {
        // The path bends toward the nearest point of the hole.
        const tgt = hole.pullPoint(m.x, m.y, h);
        if (tgt) {
          const want = Math.atan2(tgt[1] - m.y, tgt[0] - m.x), cur = Math.atan2(m.vy, m.vx);
          let d = want - cur; d = Math.atan2(Math.sin(d), Math.cos(d));
          const sp = Math.hypot(m.vx, m.vy) * (1 + 0.5 * dt), turn = Math.max(-1, Math.min(1, d)) * 1.5 * dt;
          m.vx = Math.cos(cur + turn) * sp; m.vy = Math.sin(cur + turn) * sp;
        }
      }
      m.x += m.vx * dt; m.y += m.vy * dt;
      m.trail.unshift([m.x, m.y]); if (m.trail.length > 18) m.trail.pop();
      if (!m.straight && !m.flared && hole.inside(m.x, m.y)) { m.flared = true; hole.flare(m.x, m.y); m.max = m.life + 0.05; }
      const k = m.life / m.max, fade = Math.min(1, k / 0.15) * Math.min(1, (1 - k) / 0.35);
      const col = m.warm ? pal.meteorWarm : pal.meteor;
      if (!m.straight && m.trail.length > 2) {
        // A curved tail: the recent path, fading toward its end.
        for (let i = 1; i < m.trail.length; i++) {
          const f = 1 - i / m.trail.length;
          ctx.strokeStyle = `rgba(${col},${0.95 * fade * f})`; ctx.lineWidth = 0.5 + 1.6 * f;
          ctx.beginPath(); ctx.moveTo(m.trail[i - 1][0], m.trail[i - 1][1]); ctx.lineTo(m.trail[i][0], m.trail[i][1]); ctx.stroke();
        }
      } else {
        const sp = Math.hypot(m.vx, m.vy), ux = m.vx / sp, uy = m.vy / sp, L = m.len * (0.6 + 0.4 * fade);
        const g = ctx.createLinearGradient(m.x, m.y, m.x - ux * L, m.y - uy * L);
        g.addColorStop(0, `rgba(${col},${fade})`); g.addColorStop(0.3, `rgba(${col},${0.55 * fade})`); g.addColorStop(1, `rgba(${col},0)`);
        ctx.strokeStyle = g; ctx.lineWidth = 1.7;
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - ux * L, m.y - uy * L); ctx.stroke();
      }
      const hg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 6); hg.addColorStop(0, `rgba(${pal.head},${fade})`); hg.addColorStop(1, `rgba(${pal.headEdge},0)`); ctx.fillStyle = hg; ctx.fillRect(m.x - 6, m.y - 6, 12, 12);
    }
    ctx.restore();
  }

  // Stars just outside the rim: a short luminous smear pointing into the horizon, brightest at
  // the star and fading toward the rim.
  function drawSmear(s, px, py, { f, m, r }) {
    const n = Math.hypot(1, m), sgn = r.dir === 'in' ? 1 : -1, nx = -m * sgn / n, ny = sgn / n;
    const len = s.r * (2 + 12 * f), c = pal.smear[s.c];
    const x0 = px - nx * len * 0.25, y0 = py - ny * len * 0.25, x1 = px + nx * len, y1 = py + ny * len;
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, `rgba(${c},0)`); g.addColorStop(0.2, `rgba(${c},1)`); g.addColorStop(1, `rgba(${c},0)`);
    ctx.strokeStyle = g; ctx.lineWidth = s.r * 1.7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  }

  function draw(now) {
    raf = 0;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
    const frozen = still();
    if (!frozen) t += dt;
    const T = frozen ? 0 : t;
    if (!frozen) {
      if (performance.now() - lastMove > 900) flowT = 0;
      flow = approach(flow, flowT, flowT ? 0.2 : 0.55, dt);
      ptr.x = approach(ptr.x, ptr.tx, 0.13, dt); ptr.y = approach(ptr.y, ptr.ty, 0.13, dt);
      ptr.on = approach(ptr.on, ptr.ton, 0.27, dt);
    }
    const gx = o.tilt && !frozen && ptr.on > 0.01 ? (ptr.x / w - 0.5) * ptr.on : 0, gy = o.tilt && !frozen && ptr.on > 0.01 ? (ptr.y / h - 0.5) * ptr.on : 0;
    if (frozen) { tl.x = 0; tl.y = 0; ptr.on = 0; flow = 0; }
    else { tl.x = approach(tl.x, gx, 0.27, dt); tl.y = approach(tl.y, gy, 0.27, dt); }
    const sy = frozen ? 0 : scrollY;
    ctx.clearRect(0, 0, w, h);
    const rims = hole ? hole.rimsOnScreen(h) : [];
    for (const s of stars) {
      const y = ((s.y - sy * o.parallax * (0.3 + s.z) + T * o.drift * 60 * s.z) % (fieldH * 1.6) + fieldH * 1.6) % (fieldH * 1.6) - fieldH * 0.3;
      if (y < -40 || y > h + 40) continue;
      let px = s.x - tl.x * 30 * s.z, py = y - tl.y * 18 * s.z, lensK = 0, bend = null;
      if (o.pull && !frozen && ptr.on > 0.01) {
        const dx = px - ptr.x, dy = py - ptr.y, d = Math.hypot(dx, dy);
        if (d < 230 && d > 0.5) { const f = smooth(1 - d / 230) * ptr.on, a = 36 * f * (0.45 + s.z); px += dx / d * a; py += dy / d * a; lensK = f; }
      }
      // Stars just outside the rim are pushed out and smeared toward it.
      for (const r of rims) {
        const yr = r.yAt(px), d = r.dir === 'in' ? yr - py : py - yr;
        if (d > 0 && d < BEND_REACH) { const f = (1 - d / BEND_REACH) ** 2; py += (r.dir === 'in' ? -1 : 1) * f * 9; bend = { f, m: r.slopeAt(px), r }; break; }
      }
      if (py < -4 || py > h + 4) continue;
      let k = 1;
      if (!frozen) { const wave = 0.5 + 0.5 * Math.sin(s.tw + T * s.ts); k = s.glint ? wave ** 4 : wave; }
      let lit = s.glint ? 0.35 + 0.65 * k : 1 - s.amp + s.amp * k;
      const L = frozen ? o.base : richAt(px, py);
      const vis = smooth((o.sparse + (1 - o.sparse) * L - s.q) / 0.12 + 0.5);
      if (vis <= 0.01) continue;
      let boost = o.starBoost * (0.75 + 1.0 * L);
      if (!s.glint) lit = 1 - s.amp * (0.4 + 0.9 * L) * (1 - k);
      if (lensK) boost *= 1 + 0.7 * lensK;
      ctx.globalAlpha = Math.min(1, s.a * lit * boost * vis);
      if (bend) { drawSmear(s, px, py, bend); continue; }
      ctx.fillStyle = pal[s.c];
      ctx.beginPath(); ctx.arc(px, py, s.r, 0, Math.PI * 2); ctx.fill();
      // Cross glints (owner, 2026-11-16): present across the whole sky at about a quarter strength, rising
      // to 70% around the cursor and where you scroll; none in the still frame.
      if (s.glint && !frozen && k > 0.3) {
        const g = (k - 0.3) / 0.7 * (0.25 + 0.45 * smooth((L - o.base) / 0.45)), len = s.r * (4 + 10 * g);
        ctx.strokeStyle = pal[s.c]; ctx.lineCap = 'round';
        ctx.lineWidth = 0.7; ctx.globalAlpha = 0.55 * g;
        ctx.beginPath(); ctx.moveTo(px - len, py); ctx.lineTo(px + len, py); ctx.moveTo(px, py - len); ctx.lineTo(px, py + len); ctx.stroke();
        ctx.lineWidth = 1.2; ctx.globalAlpha = 0.8 * g;
        ctx.beginPath(); ctx.moveTo(px - len * 0.35, py); ctx.lineTo(px + len * 0.35, py); ctx.moveTo(px, py - len * 0.35); ctx.lineTo(px, py + len * 0.35); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    drawMeteors(dt);
    if (!frozen) schedule();
  }

  // One scheduler: at most one frame is ever pending, so no second loop can start.
  function schedule() { if (!raf && !document.hidden) raf = requestAnimationFrame(draw); }
  size(); schedule();
  addEventListener('resize', () => { size(); schedule(); });
  // Still mode redraws on scroll so the smear follows the rim; the moving sky loops itself.
  addEventListener('scroll', () => { if (still()) schedule(); }, { passive: true });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { last = performance.now(); schedule(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else { last = performance.now(); schedule(); } });
}
