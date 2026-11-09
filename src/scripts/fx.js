// The kept motion set's script side (glass overhaul, D8; styles in src/styles/fx.css):
// the amber sweep across the page headline once its words have landed, the play/pause
// morph on the tour buttons, and the cursor spotlight on glass panels. Ported from the
// approved mock's fx.js without its review sheet, URL switches or storage.
// Nothing runs under prefers-reduced-motion or Save-Data.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const root = document.documentElement;
const off = matchMedia('(prefers-reduced-motion: reduce)').matches || root.classList.contains('save-data');

// ---------- Headline: one amber sweep after the words land, then a glow on the accent ----------
function sweep(h1) {
  const words = $$('.w', h1); if (!words.length) return;
  const r = h1.getBoundingClientRect(), W = r.width, D = 1150, t0 = performance.now();
  const pos = words.map((w) => { const b = w.getBoundingClientRect(); return [b.left - r.left, b.top - r.top]; });
  h1.classList.add('fx-sweep');
  const tick = (now) => {
    const k = Math.min(1, (now - t0) / D), e = k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2;
    const bx = -0.3 * W + 1.6 * W * e;
    words.forEach((w, j) => w.style.setProperty('--b', `${(bx - pos[j][0] - pos[j][1] * 0.45).toFixed(1)}px`));
    if (k < 1) requestAnimationFrame(tick);
    else {
      h1.classList.remove('fx-sweep'); h1.classList.add('fx-glow');
      setTimeout(() => h1.classList.remove('fx-glow'), 1300);
    }
  };
  requestAnimationFrame(tick);
}

// ---------- Play/pause morph: two shapes reshape on a light spring ----------
const PP = {
  play: [[[8, 5], [14, 8.7], [14, 15.3], [8, 19]], [[14, 8.7], [20, 12], [20, 12], [14, 15.3]]],
  pause: [[[6, 5], [10, 5], [10, 19], [6, 19]], [[14, 5], [18, 5], [18, 19], [14, 19]]],
};
const dPath = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L') + 'Z';
// Stiffness ~480, damping ratio .75: settles in about 300ms with a 3% overshoot.
const spring = (t) => { const w = 22, z = 0.75, wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t)); };
function morph(b) {
  if ($('.fx-pp', b)) return;
  b.insertAdjacentHTML('beforeend', '<svg class="fx-pp" viewBox="0 0 24 24" aria-hidden="true"><path/><path/></svg>');
  const paths = $$('.fx-pp path', b), state = () => (b.getAttribute('aria-pressed') === 'true' ? 'pause' : 'play');
  let cur = state(), raf = 0;
  const draw = (A, B, e) => paths.forEach((p, i) => p.setAttribute('d', dPath(A[i].map(([x, y], j) => [x + (B[i][j][0] - x) * e, y + (B[i][j][1] - y) * e]))));
  draw(PP[cur], PP[cur], 1);
  new MutationObserver(() => {
    const nx = state(); if (nx === cur) return;
    const A = PP[cur], B = PP[nx]; cur = nx; cancelAnimationFrame(raf);
    const t0 = performance.now();
    const tick = (now) => { const t = (now - t0) / 1000; draw(A, B, t > 0.5 ? 1 : spring(t)); if (t <= 0.5) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  }).observe(b, { attributes: true, attributeFilter: ['aria-pressed'] });
}

// ---------- Cursor spotlight on glass panels ----------
const SPOT = '.tile, .prail, .bento .wide, .works-head .hire, .ins-body.glass';
function spot(el) {
  if (el._fxSpot) return; el._fxSpot = true;
  if (getComputedStyle(el).position === 'static') el.classList.add('fx-rel');
  el.insertAdjacentHTML('beforeend', '<span class="fx-spot" aria-hidden="true"></span>');
  el.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--fx-x', `${e.clientX - r.left}px`); el.style.setProperty('--fx-y', `${e.clientY - r.top}px`);
    el.classList.add('fx-lit');
  });
  el.addEventListener('pointerleave', () => el.classList.remove('fx-lit'));
}

if (!off) {
  for (const h1 of $$('[data-words]')) {
    const n = $$('.w', h1).length;
    // The last word lands at 80ms + (n - 1) * 55ms + 760ms; the sweep starts then.
    setTimeout(() => sweep(h1), 80 + (n - 1) * 55 + 700);
  }
  $$('.rail-tour, .ins-tour').forEach(morph);
  $$(SPOT).forEach(spot);
}
