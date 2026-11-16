// The page transition (black-hole FX, ported from the approved mock's warp.js, "fall"), a
// two-half stitch for a multi-page site with no client router: the leaving page dims to black
// and navigates; the arriving page starts covered (the inline head script in Base.astro adds
// html.bh-cover before first paint, from a sessionStorage flag) and emerges from the centre
// over content that is already loading. The first page of a visit plays the full fall-in
// (streaks, a ring growing past the screen); links to Projects, Services, About and a case
// study play the short warp. It never locks input: the canvas takes no pointer events and any
// click, key, wheel or touch finishes the arrival. Luminance eases; no flash. Reduced motion
// and Save-Data get a plain cut. If this script never runs, the cover lifts itself after 3 s.
import { clamp, easeOutCubic, easeInCubic, mulberry, rgb, color, still } from './space.js';

const DUR = { full: 2000, warp: 620, leave: 340, skip: 160 };
const TARGET = [/^\/(projects|services|about)\/$/, /^\/projects\/[^/]+\/$/];

export function startWarp() {
  const root = document.documentElement;
  let cv = null, ctx = null, W = 0, H = 0, dpr = 1, raf = 0, run = null;
  const pal = { page: color('--page'), hot: rgb('--rim-4', '255 214 160'), white: rgb('--rim-5', '255 246 234'), amber: rgb('--rim-3', '233 162 92'), steel: rgb('--steel-light-rgb', '157 187 230'), streak: rgb('--meteor', '255 250 242') };
  const rand = mulberry(9);
  const streaks = Array.from({ length: 110 }, () => ({ a: rand() * 6.283, r0: rand(), z: 0.3 + 0.7 * rand(), c: rand() > 0.85 ? pal.steel : rand() > 0.85 ? pal.amber : pal.streak }));

  function ensure() {
    if (cv) return;
    cv = document.createElement('canvas'); cv.className = 'bh-warp'; cv.setAttribute('aria-hidden', 'true');
    document.body.append(cv); ctx = cv.getContext('2d'); size();
    addEventListener('resize', size);
  }
  function size() {
    dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (run) draw(progress(performance.now()));
  }
  function play(phase, full, dur, done) {
    ensure(); cancelAnimationFrame(raf);
    run = { phase, full, dur, t0: performance.now(), done, skip: null };
    cv.style.display = 'block';
    tick(performance.now());
  }
  function progress(now) {
    if (run.skip) return run.skip.from + (1 - run.skip.from) * clamp((now - run.skip.at) / DUR.skip, 0, 1);
    return clamp((now - run.t0) / run.dur, 0, 1);
  }
  function tick(now) {
    raf = 0; if (!run) return;
    const k = progress(now);
    draw(k);
    if (k >= 1) { const r = run; run = null; r.done?.(); return; }
    raf = requestAnimationFrame(tick);
  }
  function hide() { run = null; cancelAnimationFrame(raf); raf = 0; if (cv) cv.style.display = 'none'; }

  // ---------- Drawing ----------
  function draw(k) {
    const { phase, full } = run;
    ctx.clearRect(0, 0, W, H);
    if (phase === 'leave') { ctx.globalAlpha = easeInCubic(k); ctx.fillStyle = pal.page; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; return; }
    // Arrive: a hole opens from the centre; the full entry first holds the streaks, then opens.
    const cx = W / 2, cy = H / 2, R = Math.hypot(W, H) / 2 + 30;
    const q = full ? clamp((k - 0.28) / 0.72, 0, 1) : k;
    const r = easeOutCubic(q) * R * 1.05, ringA = 0.95 * (1 - q) ** 0.8;
    const sk = 1 - easeOutCubic(full ? k : q), sA = 0.85 * (1 - (full ? k : q));
    ctx.fillStyle = pal.page; ctx.beginPath(); ctx.rect(0, 0, W, H);
    if (r > 0.5) ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
    // Streaks: stars stretched along the fall, longest at the peak of the motion.
    ctx.lineCap = 'round';
    for (const s of streaks) {
      const rr = R * (0.05 + s.r0 * 0.9) * (1 + 0.6 * (1 - sk)), len = 4 + 240 * sk * s.z;
      const ux = Math.cos(s.a), uy = Math.sin(s.a);
      ctx.strokeStyle = `rgba(${s.c},${sA * s.z * 0.7})`; ctx.lineWidth = 0.6 + s.z;
      ctx.beginPath(); ctx.moveTo(cx + ux * rr, cy + uy * rr); ctx.lineTo(cx + ux * (rr + len), cy + uy * (rr + len)); ctx.stroke();
    }
    if (r > 0.5 && r < R * 1.04 && ringA > 0.01) {
      ctx.save();
      ctx.shadowColor = `rgba(${pal.hot},${ringA})`; ctx.shadowBlur = 26;
      ctx.strokeStyle = `rgba(${pal.hot},${ringA * 0.8})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 6; ctx.strokeStyle = `rgba(${pal.white},${ringA})`; ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Any input finishes an arrival quickly (the page under it is already live).
  const skip = () => { if (run && run.phase === 'arrive' && !run.skip) run.skip = { at: performance.now(), from: progress(performance.now()) }; };
  for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) addEventListener(ev, skip, { passive: true, capture: true });

  // ---------- Arrive ----------
  function arrive() {
    const mode = root.dataset.bhArrive;
    try { sessionStorage.removeItem('bh-arrive'); sessionStorage.setItem('bh-visited', '1'); } catch {}
    if (!root.classList.contains('bh-cover')) return;
    if (still()) { root.classList.remove('bh-cover'); return; }
    const full = mode !== 'warp';
    play('arrive', full, full ? DUR.full : DUR.warp, hide);
    root.classList.remove('bh-cover'); // the canvas now covers (its first frame is black)
  }

  // ---------- Leave ----------
  const isTarget = (url) => url.origin === location.origin && !(url.pathname === location.pathname && url.hash) && TARGET.some((re) => re.test(url.pathname));
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (!isTarget(url) || still()) return;
    e.preventDefault();
    let gone = false;
    const go = () => { if (gone) return; gone = true; try { sessionStorage.setItem('bh-arrive', 'warp'); } catch {} location.href = url.href; };
    // A second input during the leave goes straight on.
    addEventListener('pointerdown', go, { once: true, capture: true });
    addEventListener('keydown', go, { once: true, capture: true });
    play('leave', false, DUR.leave, go);
    setTimeout(go, DUR.leave + 400);
  });
  // Reduced motion switched on mid-transition: an arrival ends at once; a leave goes straight on.
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (!e.matches || !run) return;
    if (run.phase === 'arrive') hide(); else { const r = run; hide(); r.done?.(); }
  });
  // Back/forward cache: a restored page must not stay covered.
  addEventListener('pageshow', (e) => { if (e.persisted) { root.classList.remove('bh-cover'); hide(); } });

  return { arrive };
}
