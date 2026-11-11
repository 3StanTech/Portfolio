// The galaxy (glass overhaul): a pitch-black sky of drifting stars with parallax and a
// faint nebula, rich around the cursor and on the side you scroll toward, with the
// black hole's accretion-disk rims at the page's [data-horizon] markers. Ported from the
// approved mock (glass-overhaul-mocks/shared/starfield.js); no constellation lines.
// Under reduced motion or Save-Data the stars hold still (no drift, twinkle, parallax,
// scroll richness or cursor effects); the frame is redrawn only so the black-hole rims
// follow their sections as the page scrolls, like any content. No loop;
// paused while the tab is hidden; devicePixelRatio capped at 2. Colours come from CSS
// custom properties on the canvas (--star, --star-cool, --star-warm, --neb-1..3, --rim-*).
// Options: density, drift, parallax, nebula, starBoost, twinkle (0-1), glints,
// interactive (+ base, sparse, radius), horizons(), holeDark, tilt (depth tilt),
// pull (-1 lens, 0 off), crossing ('off' | 'sweep' | 'ripple' | 'both').
export function starfield(canvas, opts = {}) {
  const o = { density: 0.00022, drift: 0.012, parallax: 0.18, nebula: true, starBoost: 1, twinkle: 0.28, glints: 0, interactive: false, base: 0.3, sparse: 0.54, radius: 300, horizons: null, holeDark: 0.72, tilt: 0, pull: 0, crossing: 'off', ...opts };
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = navigator.connection?.saveData === true;
  let w = 0, h = 0, dpr = 1, stars = [], raf = 0, t0 = performance.now();

  const still = () => reduce.matches || saveData;
  // The palette is read once per build (tokens.css), not every frame.
  let pal = {};
  const readPalette = () => {
    const cs = getComputedStyle(canvas), v = (n, f) => cs.getPropertyValue(n).trim() || f;
    // RGB-channel tokens ("194 65 12") become "194,65,12" for the rgba() strings below.
    const rgb = (n, f) => v(n, f).split(/[\s,]+/).join(',');
    pal = { white: v('--star', '#fff'), cool: v('--star-cool', '#9DBBE6'), warm: v('--star-warm', '#E7A35A'), n1: v('--neb-1', 'rgb(22 38 70 / .5)'), n2: v('--neb-2', 'rgb(74 111 165 / .15)'), n3: v('--neb-3', 'rgb(217 130 43 / .05)'), emberHot: v('--ember-hot', '#FFE3BE'), ember: v('--amber-soft', '#E9A25C'),
      rim: [rgb('--rim-1', '194 65 12'), rgb('--rim-2', '217 110 30'), rgb('--rim-3', '233 162 92'), rgb('--rim-4', '255 214 160'), rgb('--rim-5', '255 246 234')],
      sweep: rgb('--rim-sweep', '255 244 228'), ripple: rgb('--rim-ripple', '233 162 92'), rippleCore: rgb('--rim-ripple-core', '255 226 190') };
  };
  let rand = mulberry(7);

  function build() {
    rand = mulberry(7);
    readPalette();
    dpr = Math.min(2, devicePixelRatio || 1);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(w * h * o.density) + 60;
    stars = Array.from({ length: n }, () => {
      const z = rand();               // depth: 0 far, 1 near
      const tint = rand();
      let x = rand() * w, y = rand() * h * 1.6;
      const amp = o.twinkle * (0.35 + 0.65 * rand());
      return {
        x, y, z,
        r: 0.35 + z * z * 1.25,
        a: 0.25 + z * 0.6,
        tw: rand() * Math.PI * 2, ts: 0.5 + rand() * 2.3, amp,
        glint: z > 0.45 && rand() < o.glints, q: rand(),
        c: tint > 0.93 ? 'warm' : tint > 0.78 ? 'cool' : 'white',
      };
    });
  }

  // Pointer and scroll state for the interactive sky (eased, not per-event).
  const ptr = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, on: 0, ton: 0 };
  let flow = 0, flowT = 0, lastSY = scrollY, lastMove = 0;
  const tl = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return; ptr.tx = e.clientX; ptr.ty = e.clientY; ptr.ton = 1; if (ptr.x < -1e3) { ptr.x = ptr.tx; ptr.y = ptr.ty; } }, { passive: true });
  document.addEventListener('pointerleave', () => { ptr.ton = 0; });
  addEventListener('blur', () => { ptr.ton = 0; });
  addEventListener('scroll', () => { const d = scrollY - lastSY; lastSY = scrollY; if (Math.abs(d) > 1) { flowT = Math.sign(d); lastMove = performance.now(); } }, { passive: true });
  const smooth = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : a * a * (3 - 2 * a));
  function richAt(x, y) {
    let L = o.base;
    if (still()) return L;
    if (flow) { const f = flow > 0 ? y / h : 1 - y / h; L += (f - L) * Math.abs(flow); }
    if (ptr.on > 0.01) { const d = Math.hypot(x - ptr.x, y - ptr.y); L += (1 - L) * ptr.on * smooth(1 - d / o.radius); }
    return Math.max(0, Math.min(1, L));
  }

  function draw(now) {
    raf = 0;
    const frozen = still();
    const t = frozen ? 0 : (now - t0) / 1000;
    if (o.interactive && !frozen) {
      if (performance.now() - lastMove > 900) flowT = 0;
      flow += (flowT - flow) * (flowT ? 0.08 : 0.03);
    }
    if ((o.interactive || o.pull || o.tilt) && !frozen) { ptr.x += (ptr.tx - ptr.x) * 0.12; ptr.y += (ptr.ty - ptr.y) * 0.12; ptr.on += (ptr.ton - ptr.on) * 0.06; }
    // Depth tilt: an eased cursor offset (-.5 to .5 of the screen); near stars move most.
    const gx = o.tilt && !frozen && ptr.on > 0.01 ? (ptr.x / w - 0.5) * ptr.on : 0, gy = o.tilt && ptr.on > 0.01 ? (ptr.y / h - 0.5) * ptr.on : 0;
    if (frozen) { tl.x = 0; tl.y = 0; ptr.on = 0; } // a live switch to still mode drops any eased tilt
    else { tl.x += (gx - tl.x) * 0.06; tl.y += (gy - tl.y) * 0.06; }
    const sy = frozen ? 0 : scrollY;
    ctx.clearRect(0, 0, w, h);
    if (o.nebula) nebula(-tl.x * 12, -tl.y * 8, frozen);
    const col = pal;
    for (const s of stars) {
      const y = ((s.y - sy * o.parallax * (0.3 + s.z) + t * o.drift * 60 * s.z) % (h * 1.6) + h * 1.6) % (h * 1.6) - h * 0.3;
      if (y < -40 || y > h + 40) continue;
      // Depth tilt and the cursor's lens move where the star is drawn, not where it lives.
      let px = s.x - tl.x * 30 * s.z, py = y - tl.y * 18 * s.z, lensK = 0;
      if (o.pull && !frozen && ptr.on > 0.01) {
        const dx = px - ptr.x, dy = py - ptr.y, d = Math.hypot(dx, dy);
        if (d < 230 && d > 0.5) {
          const f = smooth(1 - d / 230) * ptr.on;
          const a = 36 * f * (0.45 + s.z);
          px += dx / d * a; py += dy / d * a; lensK = f;
        }
      }
      if (py < -4 || py > h + 4) continue;
      // Twinkle: each star breathes at its own pace and depth; glint stars
      // spend most of the time dim and flare briefly (a sharpened sine).
      let k = 1;
      if (!frozen) {
        const wave = 0.5 + 0.5 * Math.sin(s.tw + t * s.ts);
        k = s.glint ? wave ** 4 : wave;
      }
      let lit = s.glint ? 0.35 + 0.65 * k : 1 - s.amp + s.amp * k, vis = 1, L = 1, boost = o.starBoost;
      if (o.interactive) {
        L = richAt(px, py);
        const share = o.sparse + (1 - o.sparse) * L;          // share of stars shown at this richness
        vis = smooth((share - s.q) / 0.12 + 0.5);
        if (vis <= 0.01) continue;
        boost = o.starBoost * (0.75 + 1.0 * L);
        if (!s.glint) lit = 1 - s.amp * (0.4 + 0.9 * L) * (1 - k);
      }
      if (lensK) boost *= 1 + 0.7 * lensK;
      ctx.globalAlpha = Math.min(1, s.a * lit * boost * vis);
      ctx.fillStyle = col[s.c];
      ctx.beginPath(); ctx.arc(px, py, s.r, 0, Math.PI * 2); ctx.fill();
      if (s.glint && k > 0.3 && (!o.interactive || L > 0.45)) {
        const g = (k - 0.3) / 0.7 * (o.interactive ? smooth((L - 0.45) / 0.35) : 1), len = s.r * (4 + 10 * g);
        ctx.strokeStyle = col[s.c]; ctx.lineCap = 'round';
        ctx.lineWidth = 0.7; ctx.globalAlpha = 0.55 * g;
        ctx.beginPath(); ctx.moveTo(px - len, py); ctx.lineTo(px + len, py); ctx.moveTo(px, py - len); ctx.lineTo(px, py + len); ctx.stroke();
        ctx.lineWidth = 1.2; ctx.globalAlpha = 0.8 * g;
        ctx.beginPath(); ctx.moveTo(px - len * 0.35, py); ctx.lineTo(px + len * 0.35, py); ctx.moveTo(px, py - len * 0.35); ctx.lineTo(px, py + len * 0.35); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    if (o.horizons) blackHole(t);
    if (!frozen) schedule();
  }

  // ---------- Black hole (owner, G4) ----------
  // o.horizons() returns the event horizons on screen: [{ apex, dir }] in
  // viewport px. dir 'in' = the hero's horizon (the hole lies below it; you
  // fall in by scrolling down); 'out' = the closer's (the hole lies above; you
  // leave into the footer). The interior is darkened over the stars; each rim
  // is an accretion disk that blazes up as you approach and cross it.
  const heat = { in: 0.3, out: 0.3 }, lastP = { in: null, out: null }, ev = { in: null, out: null };
  let embers = [], lastT = 0, speed = 0, lastHY = scrollY;
  function arcPts(apex, dir) {
    const Rx = w * 0.95, Ry = Math.max(720, h * 1.05), pts = [];
    for (let i = 0; i <= 72; i++) {
      const x = -60 + (w + 120) * i / 72, dx = (x - w / 2) / Rx;
      pts.push([x, apex + (dir === 'in' ? 1 : -1) * Ry * (1 - Math.sqrt(Math.max(0, 1 - dx * dx)))]);
    }
    return pts;
  }
  function blackHole(t) {
    const list = o.horizons() || [];
    const still = reduce.matches || saveData;
    if (still) { embers = []; heat.in = heat.out = 0.3; }
    const dt = Math.min(0.05, Math.max(0.001, t - lastT)); lastT = t;
    const dy = scrollY - lastHY; lastHY = scrollY;
    speed += (Math.min(1, Math.abs(dy) / 28) - speed) * 0.12;
    const hin = list.find((x) => x.dir === 'in'), hout = list.find((x) => x.dir === 'out');
    const top = hin ? arcPts(hin.apex, 'in') : null, bot = hout ? arcPts(hout.apex, 'out') : null;
    // Interior: between the 'in' rim (or above the screen) and the 'out' rim (or below it).
    const yTop = top ? Math.min(...top.map((p) => p[1])) : -1e5, yBot = bot ? Math.max(...bot.map((p) => p[1])) : 1e5;
    if (yTop < h + 40 && yBot > -40) {
      ctx.save(); ctx.fillStyle = `rgba(0,0,0,${o.holeDark})`; ctx.beginPath();
      if (top) top.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); else { ctx.moveTo(-60, -60); ctx.lineTo(w + 60, -60); }
      if (bot) [...bot].reverse().forEach(([x, y]) => ctx.lineTo(x, y)); else { ctx.lineTo(w + 60, h + 60); ctx.lineTo(-60, h + 60); }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
    for (const [hz, pts] of [[hin, top], [hout, bot]]) {
      if (!hz) continue;
      const p = hz.apex / h;
      // Crossing: the rim passes the middle of the screen (falling in, or climbing back out).
      const lp = lastP[hz.dir]; lastP[hz.dir] = p;
      if (lp !== null && o.crossing !== 'off' && !still && (lp - 0.5) * (p - 0.5) < 0) ev[hz.dir] = { t0: t, s: p < lp ? 1 : -1 };
      // Blaze: strongest as the rim passes the upper middle of the screen, and while you are moving.
      const prox = Math.exp(-(((hz.dir === 'in' ? p - 0.32 : p - 0.62) / 0.34) ** 2));
      const target = still ? 0.3 : Math.min(1, 0.22 + 0.5 * prox + 0.55 * speed * prox);
      heat[hz.dir] += (target - heat[hz.dir]) * 0.08;
      const H = heat[hz.dir];
      if (Math.max(...pts.map((q) => q[1])) < -140 || Math.min(...pts.map((q) => q[1])) > h + 140) continue;
      rim(pts, H, t, still, hz.dir);
      if (!still && H > 0.35 && embers.length < 90 && Math.random() < H * 0.9) {
        const k = Math.floor(Math.random() * pts.length), [x, y] = pts[k];
        if (x > 0 && x < w) embers.push({ x, y, vx: (Math.random() - 0.5) * 40, vy: (hz.dir === 'in' ? -1 : 1) * (14 + Math.random() * 46) * H, life: 0, max: 0.8 + Math.random() * 1.2 });
      }
    }
    if (embers.length) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      embers = embers.filter((e) => (e.life += dt) < e.max);
      for (const e of embers) {
        e.x += e.vx * dt; e.y += e.vy * dt; const f = 1 - e.life / e.max;
        ctx.globalAlpha = 0.7 * f; ctx.fillStyle = f > 0.6 ? pal.emberHot : pal.ember;
        ctx.beginPath(); ctx.arc(e.x, e.y, 0.6 + 1.1 * f, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }
  const line = (pts, dy = 0) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y + dy) : ctx.moveTo(x, y + dy))); };
  function rim(pts, H, t, still, dir) {
    // Doppler-bright on one side, with a slow swirl travelling along the disk.
    const g = (a) => { const gr = ctx.createLinearGradient(0, 0, w, 0); for (let i = 0; i <= 8; i++) { const u = i / 8; const dop = 1.25 - 0.55 * u; const sw = still ? 1 : 0.72 + 0.28 * Math.sin(u * Math.PI * 3 - t * 0.9); gr.addColorStop(u, a(Math.max(0, dop * sw))); } return gr; };
    const layers = [
      [70 + 120 * H, 0.025 + 0.05 * H, (k) => `rgba(${pal.rim[0]},${k})`],
      [34 + 60 * H, 0.05 + 0.09 * H, (k) => `rgba(${pal.rim[1]},${k})`],
      [14 + 22 * H, 0.10 + 0.16 * H, (k) => `rgba(${pal.rim[2]},${k})`],
      [5 + 7 * H, 0.22 + 0.28 * H, (k) => `rgba(${pal.rim[3]},${k})`],
      [1.6 + 1.2 * H, 0.75 + 0.25 * H, (k) => `rgba(${pal.rim[4]},${k})`],
    ];
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    for (const [lw, a, c] of layers) { ctx.lineWidth = lw; ctx.strokeStyle = g((k) => c(Math.min(1, a * k))); ctx.stroke(); }
    const e = ev[dir];
    if (e) {
      const age = t - e.t0;
      if (age > 1.6) ev[dir] = null;
      else {
        if (o.crossing === 'sweep' || o.crossing === 'both') sweep(pts, age, e.s);
        if (o.crossing === 'ripple' || o.crossing === 'both') ripple(pts, age, dir);
      }
    }
    ctx.restore();
  }
  // Sweep: one band of white-gold light runs the length of the disk, in the direction you scrolled.
  function sweep(pts, age, s) {
    const D = 0.95; if (age > D) return;
    const k = age / D, e = k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2;
    const uc = s > 0 ? -0.12 + 1.24 * e : 1.12 - 1.24 * e;
    const band = (alpha) => { const gr = ctx.createLinearGradient(0, 0, w, 0); const add = (u, a) => { if (u >= 0 && u <= 1) gr.addColorStop(u, `rgba(${pal.sweep},${a})`); };
      gr.addColorStop(0, `rgba(${pal.sweep},0)`); add(uc - 0.1, 0); add(uc - 0.03, alpha * 0.6); add(uc, alpha); add(uc + 0.03, alpha * 0.6); add(uc + 0.1, 0); gr.addColorStop(1, `rgba(${pal.sweep},0)`); return gr; };
    line(pts);
    ctx.lineWidth = 26; ctx.strokeStyle = band(0.22); ctx.stroke();
    ctx.lineWidth = 7; ctx.strokeStyle = band(0.6); ctx.stroke();
    ctx.lineWidth = 2.2; ctx.strokeStyle = band(1); ctx.stroke();
  }
  // Ripple: two faint rings spread out from the rim, away from the hole, and fade. Softened
  // (owner, G4 notes 3): about half the brightness and width, a shorter travel, the second ring fainter.
  function ripple(pts, age, dir) {
    for (const [k, s] of [[0, 1], [0.18, 0.55]]) {
      const b = (age - k) / 1.15; if (b <= 0 || b >= 1) continue;
      const off = (dir === 'in' ? -1 : 1) * (1 - (1 - b) ** 3) * 110, f = s * (1 - b) ** 1.8;
      line(pts, off);
      ctx.lineWidth = 7 * f + 1; ctx.strokeStyle = `rgba(${pal.ripple},${0.05 * f})`; ctx.stroke();
      ctx.lineWidth = 0.5 + 1.1 * f; ctx.strokeStyle = `rgba(${pal.rippleCore},${0.32 * f})`; ctx.stroke();
    }
  }

  function nebula(ox = 0, oy = 0, frozen = false) {
    const sy = (frozen ? 0 : scrollY * 0.06) - oy;
    const blobs = [
      [w * 0.78 + ox, h * 0.18 - sy, Math.max(w, h) * 0.55, pal.n1],
      [w * 0.12 + ox, h * 0.85 - sy, Math.max(w, h) * 0.45, pal.n2],
      [w * 0.55 + ox, h * 0.62 - sy, Math.max(w, h) * 0.3, pal.n3],
    ];
    for (const [x, y, r, c] of blobs) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
  }

  // One scheduler: at most one frame is ever pending, so no second loop can start.
  function schedule() { if (!raf && !document.hidden) raf = requestAnimationFrame(draw); }
  build(); schedule();
  addEventListener('resize', () => { build(); schedule(); });
  // Still mode redraws on scroll so the rims track their sections; the moving sky loops itself.
  addEventListener('scroll', () => { if (still()) schedule(); }, { passive: true });
  reduce.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else schedule(); });
}

function mulberry(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
