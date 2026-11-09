// Site-wide behaviour for the glass design (glass overhaul): the galaxy, the island
// header and its contact menu, adaptive tint and the rim lens on glass, copy-to-
// clipboard feedback, scroll reveal and the Project details dialogs. Ported from the
// approved mock's engine (glass-overhaul-mocks/shared/site.js boot()) with the review
// switches removed. Everything here degrades to plain, working HTML without it.
import { liquidGlass, isLensSupported } from '../vendor/glasswork/lens.js';
import { starfield } from './galaxy.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const root = document.documentElement, body = document.body;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = root.classList.contains('save-data');
const EMAIL = body.dataset.email || '';

// ---------- Rim lens (Chromium only; elsewhere the CSS glass stays) ----------
// Each lens builds its refraction map in a pixel loop, so building them all at once is a
// long task. Glass is queued as it comes on screen and one lens is mounted per idle slot.
const lenses = new Map(), lensQueue = [], watched = new WeakSet();
const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 60));
let lensBusy = false;
const lensStep = () => {
  const el = lensQueue.shift();
  if (el && !lenses.has(el) && el.offsetWidth) {
    const small = el.offsetHeight < 60;
    lenses.set(el, liquidGlass(el, small ? { rim: 16, edge: 1.1, power: 2.6, dispersion: .22 } : { rim: 40, edge: 1.1, power: 2.6, dispersion: .15 }));
  }
  if (lensQueue.length) idle(lensStep, { timeout: 800 });
  else lensBusy = false;
};
const lensSeen = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { lensSeen.unobserve(e.target); lensQueue.push(e.target); }
  if (lensQueue.length && !lensBusy) { lensBusy = true; idle(lensStep, { timeout: 800 }); }
});
export function mountLenses(scope = document) {
  if (!isLensSupported()) return;
  for (const el of $$('.glass', scope)) {
    if (watched.has(el) || el.dataset.lens === 'none') continue;
    watched.add(el); lensSeen.observe(el);
  }
}

// ---------- Adaptive tint (after Glasswork's adapt.js) ----------
// 15 points behind a surface: over the night sky it stays clear; over a capture or
// text it thickens so its own text keeps >= 4.5:1. Captures are read from their
// pixels; text counts as busy.
// card's dense end is .9 (the mock's .64 left the sheet's amber and secondary text near 2.5:1
// over the bright captures; measured in the Phase 1 contrast sweep).
const ADAPT = { menu: [.14, .82], bar: [.14, .62], card: [.3, .9] };
const imgCache = new Map();
function imgPixels(img) {
  const key = img.currentSrc || img.src;
  let c = imgCache.get(key);
  if (!c) {
    const w = 48, h = Math.max(1, Math.round(48 * img.naturalHeight / img.naturalWidth));
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const x = cv.getContext('2d', { willReadFrequently: true });
    try { x.drawImage(img, 0, 0, w, h); c = { w, h, d: x.getImageData(0, 0, w, h).data }; } catch { c = { w: 1, h: 1, d: [128, 128, 128, 255] }; }
    imgCache.set(key, c);
  }
  return c;
}
const edgeAlpha = (y) => (y < 58 ? .72 - .12 * (y / 58) : Math.max(0, .6 * (1 - (y - 58) / 70)));
function lumAt(px, py, self) {
  for (const el of document.elementsFromPoint(px, py)) {
    if (el.closest('.hdr, dialog') || (self && self.contains(el))) continue;
    if (el.dataset.lum) return +el.dataset.lum;
    if (el.tagName === 'IMG' && el.complete && el.naturalWidth) {
      if (+getComputedStyle(el).opacity < .3) continue;
      const r = el.getBoundingClientRect(), c = imgPixels(el);
      const u = Math.min(c.w - 1, Math.max(0, Math.floor((px - r.left) / r.width * c.w)));
      const v = Math.min(c.h - 1, Math.max(0, Math.floor((py - r.top) / r.height * c.h)));
      const i = (v * c.w + u) * 4;
      return (.2126 * c.d[i] + .7152 * c.d[i + 1] + .0722 * c.d[i + 2]) / 255;
    }
    if (el.matches('h1, h2, h3, h4, p, li, strong, a, button, span') && el.textContent.trim()) return .3;
    if (el.classList.contains('glass')) return .12;
  }
  return .02;
}
function adapt(el) {
  const r = el.getBoundingClientRect(); if (!r.width) return;
  let sum = 0, max = 0;
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
    const x = r.left + r.width * (i + .5) / 5, y = r.top + r.height * (j + .5) / 3;
    let L = lumAt(x, y, el);
    if (body.dataset.scrolled === 'true' && y < 128) L *= 1 - edgeAlpha(y);
    sum += L; max = Math.max(max, L);
  }
  const L = sum / 15 * .5 + max * .5, [thin, dense] = ADAPT[el.dataset.adapt];
  el.style.setProperty('--d-thin', thin); el.style.setProperty('--d-dense', dense);
  el.style.setProperty('--density', Math.min(1, Math.max(0, (L - .03) / .45)).toFixed(3));
}
let adaptQueued = false;
export function adaptAll() {
  if (adaptQueued) return; adaptQueued = true;
  requestAnimationFrame(() => { adaptQueued = false; $$('[data-adapt]').forEach(adapt); });
}
export { adapt };

// ---------- Galaxy ----------
// Live richness (the owner's pick) with the D8 options: depth tilt, cursor lens, horizon
// crossing sweep + softened ripple. Horizons: [data-horizon="in"] (the hero; you fall in
// scrolling down) and [data-horizon="out"] (the closer; you leave into the footer).
export const sky = (() => {
  const canvas = $('.sky');
  if (!canvas) return null;
  const horizons = () => $$('[data-horizon]').map((el) => {
    const r = el.getBoundingClientRect();
    return el.dataset.horizon === 'in' ? { dir: 'in', apex: r.bottom - 150 } : { dir: 'out', apex: r.top + 150 };
  });
  const still = reduce || saveData;
  if (!still) canvas.classList.add('fx-in');
  return starfield(canvas, {
    density: .00048, starBoost: 1, twinkle: .75, glints: .06, interactive: true, base: .27, sparse: .54, parallax: .34,
    horizons, tilt: still ? 0 : 1, pull: still ? 0 : -1, crossing: still ? 'off' : 'both', chroma: false,
  });
})();

// ---------- Island ----------
const isl = $('.isl');
if (isl) {
  let islHover = false;
  const faceSize = {};
  const measureFaces = () => {
    for (const f of $$('.face', isl)) {
      const mode = f.className.match(/face-(\w+)/)[1];
      const clone = f.cloneNode(true); Object.assign(clone.style, { position: 'absolute', visibility: 'hidden', width: 'auto', inset: 'auto' });
      isl.append(clone); faceSize[mode] = Math.ceil(clone.scrollWidth) + (mode === 'mini' ? 12 : 16); clone.remove();
    }
  };
  const islandMode = (force = false) => {
    const mode = islHover ? 'expanded' : body.dataset.scrolled === 'true' ? 'mini' : 'compact';
    if (!force && isl.dataset.mode === mode && isl.style.getPropertyValue('--iw')) return;
    isl.dataset.mode = mode;
    isl.style.setProperty('--iw', (faceSize[mode] || 360) + 'px');
    isl.style.setProperty('--ih', mode === 'expanded' ? '52px' : '44px');
    setTimeout(adaptAll, 650);
  };
  isl.addEventListener('pointerenter', () => { islHover = true; islandMode(); });
  isl.addEventListener('pointerleave', (e) => { if (e.pointerType === 'touch') return; islHover = false; islandMode(); });
  isl.addEventListener('focusin', () => { islHover = true; islandMode(); });
  isl.addEventListener('focusout', (e) => { if (!isl.contains(e.relatedTarget)) { islHover = false; islandMode(); } });
  // Touch: the first tap opens the island, the next one follows a link.
  isl.addEventListener('click', (e) => { if (isl.dataset.mode !== 'expanded') { e.preventDefault(); islHover = true; islandMode(); } });
  document.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch' && !isl.contains(e.target) && islHover) { islHover = false; islandMode(); } });

  let ticking = false;
  const syncScroll = () => {
    ticking = false;
    const scrolled = String(scrollY > 40);
    if (body.dataset.scrolled !== scrolled) { body.dataset.scrolled = scrolled; islandMode(); }
    adaptAll();
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(syncScroll); } }, { passive: true });
  addEventListener('resize', adaptAll);
  body.dataset.scrolled = String(scrollY > 40);
  measureFaces(); islandMode(true);
  // The first sizing (and the one when the fonts are in) snaps; only later changes animate,
  // so loading the page causes no layout shift.
  document.fonts?.ready.then(() => { measureFaces(); islandMode(true); requestAnimationFrame(() => isl.classList.add('is-sized')); });
  document.fonts?.addEventListener('loadingdone', () => { measureFaces(); islandMode(true); });
}

// ---------- Contact menu ("check me out") ----------
const contactEl = $('.contact'), more = $('.cta-more'), pop = $('.pop');
if (contactEl && more && pop) {
  let lastPointer = 'mouse';
  document.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType; }, true);
  document.addEventListener('keydown', () => { lastPointer = 'keyboard'; }, true);
  const items = () => $$(':scope > a, :scope > button', pop);
  const isOpen = () => more.getAttribute('aria-expanded') === 'true';
  const setPop = (open, { focusFirst = false } = {}) => {
    pop.style.setProperty('--bw', more.offsetWidth + 'px');
    more.setAttribute('aria-expanded', String(open));
    pop.classList.toggle('open', open);
    if (open) { adapt(pop); if (focusFirst) requestAnimationFrame(() => items()[0]?.focus()); }
  };
  let ht;
  const fine = (e) => e.pointerType === 'mouse' || e.pointerType === 'pen';
  contactEl.addEventListener('pointerenter', (e) => { if (!fine(e)) return; clearTimeout(ht); ht = setTimeout(() => setPop(true), 90); });
  contactEl.addEventListener('pointerleave', (e) => { if (!fine(e)) return; clearTimeout(ht); ht = setTimeout(() => { if (!contactEl.contains(document.activeElement) || lastPointer === 'mouse') setPop(false); }, 280); });
  more.addEventListener('click', () => {
    if (lastPointer === 'mouse') return setPop(true);
    setPop(!isOpen(), { focusFirst: lastPointer === 'keyboard' });
  });
  // Tab past the last item (or anywhere outside) closes it.
  contactEl.addEventListener('focusout', (e) => { if (isOpen() && !contactEl.contains(e.relatedTarget)) setPop(false); });
  document.addEventListener('click', (e) => { if (isOpen() && !contactEl.contains(e.target)) setPop(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { setPop(false); more.focus(); }
    if (isOpen() && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && pop.contains(document.activeElement)) {
      e.preventDefault();
      const list = items(), k = list.indexOf(document.activeElement);
      list[(k + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length].focus();
    }
  });
}

// ---------- Copy feedback ----------
// Every mailto link also copies the address (a desktop with no mail handler otherwise does
// nothing); never preventDefault, so phones and mail apps still open a draft. The icon
// morphs to a check and the label says Copied for 1.6s; the live region announces it.
const status = $('[data-copy-status]');
const say = (m) => { if (!status) return; status.textContent = ''; setTimeout(() => { status.textContent = m; }, 30); };
function copiedMorph(el, kind) {
  let ico = $(':scope > .fx-ico', el);
  const svg = ico ? null : $(':scope > svg.icon', el);
  if (svg) {
    ico = document.createElement('span'); ico.className = 'fx-ico'; svg.replaceWith(ico); ico.append(svg);
    ico.insertAdjacentHTML('beforeend', '<svg class="icon fx-check" aria-hidden="true"><use href="#i-check"/></svg>');
  }
  clearTimeout(el._copyT);
  if (!el._restore) {
    const small = $('.two small', el);
    const label = kind === 'copy' ? $(':scope > span:not(.fx-ico)', el)?.firstChild : small ? small.firstChild : [...el.childNodes].find((n) => n.nodeType === 3 && n.data.trim());
    if (label) {
      const was = label.data; if (!small && kind !== 'copy') el.style.minWidth = el.offsetWidth + 'px';
      label.data = kind === 'copy' || small ? 'Copied' : (/^\s/.test(was) ? ' ' : '') + 'Copied';
      el._restore = () => { label.data = was; el.style.minWidth = ''; };
    }
  }
  el.classList.add('fx-done');
  el._copyT = setTimeout(() => { el.classList.remove('fx-done'); el._restore?.(); el._restore = null; if (status) status.textContent = ''; }, 1600);
}
document.addEventListener('click', (e) => {
  const target = e.target instanceof Element ? e.target : null;
  const copy = target?.closest('[data-copy]');
  const mail = target?.closest('a[href^="mailto:"]');
  const el = copy || mail;
  if (!el || !EMAIL || !navigator.clipboard) return;
  navigator.clipboard.writeText(EMAIL).then(() => {
    copiedMorph(el, copy ? 'copy' : 'mail');
    say(`Email address copied: ${EMAIL}`);
  }).catch(() => {});
});

// ---------- Scroll reveal (only under html.js; no-JS readers see everything) ----------
if (!reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
  }, { threshold: .12 });
  $$('[data-reveal]').forEach((el) => io.observe(el));
} else {
  $$('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
}

// ---------- Project details dialogs ----------
let lastTrigger = null;
document.addEventListener('click', (e) => {
  const trigger = e.target instanceof Element ? e.target.closest('[data-project-modal]') : null;
  if (!trigger) return;
  const dialog = document.getElementById(`pm-${trigger.dataset.projectModal}`);
  if (!dialog) return;
  lastTrigger = trigger;
  dialog.showModal();
  requestAnimationFrame(() => mountLenses(dialog));
});
for (const dialog of $$('dialog.pm')) {
  $('[data-modal-close]', dialog)?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { lastTrigger?.focus(); lastTrigger = null; });
}

// ---------- Lenses and tint once the layout settles ----------
setTimeout(() => { mountLenses(); adaptAll(); }, 700);
addEventListener('load', adaptAll);
