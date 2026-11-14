// Home (glass overhaul): the selected work rail (paddles and a 5s tour) and the process
// rail that draws as the scope band scrolls in. Ported from the approved mock.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
// Save-Data: no autoplay (it would fetch every capture) and no scroll-drawn rail.
const saveData = document.documentElement.classList.contains('save-data');

// ---------- Selected work rail ----------
// The row is endless: the script copies the nine tiles into a set before and a set after
// them, starts on the real set, and when scrolling settles outside the middle set shifts by
// exactly one set width (identical pixels, so nothing visibly moves). The browser still owns
// the scroll, so swipe, trackpad, keys and the paddles all work in both directions. Copies
// are hidden from screen readers and skipped by Tab, but a visible copy still opens its build
// on click; their captures load only when the original has
// loaded or the copy itself comes into view. Without this script the nine tiles stay a plain strip.
const rail = $('[data-rail]'), works = $('.works');
if (rail && works) {
  const real = [...rail.children];
  // Copies are made in a document with no window, where images never load: cloning a tile
  // in this page would start every capture's download at once, lazy or not.
  const scratch = document.implementation.createHTMLDocument('');
  const copy = () => real.map((li) => {
    const c = scratch.importNode(li, true);
    c.setAttribute('aria-hidden', 'true'); c.dataset.railCopy = '';
    for (const f of $$('a, button', c)) f.tabIndex = -1;
    const img = $('img', c);
    if (img) { img.loading = 'lazy'; img.dataset.src = img.getAttribute('src'); img.dataset.srcset = img.getAttribute('srcset') || ''; img.removeAttribute('srcset'); img.removeAttribute('src'); }
    return c;
  });
  const before = copy(), after = copy();
  rail.prepend(...before); rail.append(...after);
  const feed = (img) => { if (!img.dataset.src) return; if (img.dataset.srcset) img.srcset = img.dataset.srcset; img.src = img.dataset.src; delete img.dataset.src; };
  real.forEach((li, k) => {
    const orig = $('img', li); if (!orig) return;
    const copies = [before[k], after[k]].map((c) => $('img', c));
    if (orig.complete && orig.naturalWidth) copies.forEach(feed);
    else orig.addEventListener('load', () => copies.forEach(feed), { once: true });
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => { for (const e of entries) if (e.isIntersecting) { feed(e.target); io.unobserve(e.target); } }, { root: rail });
    for (const c of [...before, ...after]) { const img = $('img', c); if (img?.dataset.src) io.observe(img); }
  }

  // Tiles snap to the centre, so the full tiles sit in the middle with equal slivers of the
  // neighbours on both sides. base is the position that centres the first real tile; every
  // snap position is base plus a whole number of steps.
  const step = () => real[0].offsetWidth + 18;
  const setWidth = () => real[0].offsetLeft - before[0].offsetLeft;
  const base = () => real[0].offsetLeft + real[0].offsetWidth / 2 - rail.clientWidth / 2;
  const behavior = () => (reduce.matches || saveData ? 'instant' : 'smooth');
  // pos is the centred tile, counted from the first real tile (the copies before it are -9
  // to -1, after it 9 to 17). The paddles and the tour move pos and scroll to it; once the
  // row has arrived and no finger is on it, a pos outside the real set shifts by one set
  // (identical pixels). Presses during a move add up, kept inside the copies.
  const at = () => Math.round((rail.scrollLeft - base()) / step());
  const full = Math.floor((rail.clientWidth + 18) / step());
  let pos = Math.max(0, Math.floor((full - 1) / 2)), pending = false, touching = false, settle = 0;
  // Start with the first build as the leftmost full tile.
  rail.scrollTo({ left: base() + pos * step(), behavior: 'instant' });
  const wrap = () => {
    if (pos >= 0 && pos <= 8) return;
    const d = pos < 0 ? 1 : -1;
    pos += 9 * d; rail.scrollTo({ left: rail.scrollLeft + d * setWidth(), behavior: 'instant' });
  };
  const settled = () => {
    if (touching) return;
    // A programmatic move counts as arrived only at its target (an interrupted animation
    // can report an end on the way); anything else is the visitor's own scroll.
    if (pending && Math.abs(rail.scrollLeft - (base() + pos * step())) > 2) return;
    pending = false; pos = at(); wrap();
  };
  rail.addEventListener('touchstart', () => { touching = true; pending = false; }, { passive: true });
  // A lifted finger settles the row only once scrolling has been idle for 160ms; any scroll
  // (momentum included) clears that wait, and scrollend then settles it where supported.
  const native = 'onscrollend' in window;
  const idle = () => { clearTimeout(settle); settle = setTimeout(settled, 160); };
  rail.addEventListener('touchend', () => { touching = false; idle(); }, { passive: true });
  rail.addEventListener('touchcancel', () => { touching = false; }, { passive: true });
  for (const t of ['pointerdown', 'wheel', 'keydown']) rail.addEventListener(t, () => { pending = false; }, { passive: true });
  if (native) rail.addEventListener('scrollend', settled);
  rail.addEventListener('scroll', () => { if (native) clearTimeout(settle); else idle(); }, { passive: true });
  // A resize mid-move keeps the target: jump to it in the new geometry, then settle.
  addEventListener('resize', () => requestAnimationFrame(() => {
    if (pending) rail.scrollTo({ left: base() + pos * step(), behavior: 'instant' });
    settled();
  }));
  const go = (dir) => {
    if (!pending) pos = at();
    pos = Math.min(14, Math.max(-6, pos + dir));
    pending = true;
    rail.scrollTo({ left: base() + pos * step(), behavior: behavior() });
    if (behavior() === 'instant') settled();
  };
  const paddles = $$('.paddle', works);
  for (const b of paddles) b.addEventListener('click', () => { setPlaying(false); go(+b.dataset.dir); });

  // Tour: one tile to the right every 5s, never back, with no visible timer. It holds while
  // the pointer or focus is on the work, while the rail is off screen and while the tab is
  // hidden (WCAG 2.2.2); the glass button pauses or plays it; reduced motion and Save-Data
  // start it paused.
  const tourBtn = $('.rail-tour', works);
  let playing = !reduce.matches && !saveData, holdPointer = false, holdFocus = false, onScreen = true, timer = 0;
  const running = () => playing && !holdPointer && !holdFocus && onScreen && !document.hidden;
  const restart = () => {
    clearTimeout(timer);
    if (running()) timer = window.setTimeout(() => {
      if (!running()) return;
      go(1);
      restart();
    }, 5000);
  };
  const setPlaying = (on) => {
    playing = on;
    tourBtn.setAttribute('aria-pressed', String(on));
    tourBtn.setAttribute('aria-label', on ? 'Pause the project tour' : 'Play the project tour');
    restart();
  };
  setPlaying(playing);
  tourBtn.addEventListener('click', () => setPlaying(!playing));
  // Pointer and focus hold separately: tabbing out while the pointer rests on the work keeps it held.
  works.addEventListener('pointerenter', () => { holdPointer = true; restart(); });
  works.addEventListener('pointerleave', () => { holdPointer = false; restart(); });
  works.addEventListener('focusin', () => { holdFocus = true; restart(); });
  works.addEventListener('focusout', (e) => { if (!works.contains(e.relatedTarget)) { holdFocus = false; restart(); } });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; restart(); }).observe(rail);
  document.addEventListener('visibilitychange', restart);
  // Intent events distinguish visitor browsing from scrolls caused by the tour itself.
  rail.addEventListener('pointerdown', () => setPlaying(false), { passive: true });
  // A wheel is browsing only when it is mostly sideways (or Shift turns it sideways): Chrome
  // passes stray sideways pixels during an ordinary vertical trackpad scroll.
  rail.addEventListener('wheel', (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || (e.shiftKey && e.deltaY)) setPlaying(false); }, { passive: true });
  rail.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', ' '].includes(e.key)) setPlaying(false);
  });
  reduce.addEventListener('change', () => { if (reduce.matches) setPlaying(false); });
}

// ---------- Process rail ----------
// The line draws from Scope to Launch while the strip rises from 85% to 35% of the
// viewport. Without this script, under reduced motion or Save-Data it stays fully drawn (--p: 1).
const prail = $('.prail');
if (prail && !reduce.matches && !saveData) {
  let queued = false;
  const syncRail = () => {
    queued = false;
    // Reduced motion switched on mid-visit: the rail stays fully drawn from then on.
    if (reduce.matches) { prail.style.removeProperty('--p'); return; }
    const top = prail.getBoundingClientRect().top, vh = innerHeight;
    prail.style.setProperty('--p', Math.min(1, Math.max(0, (vh * 0.85 - top) / (vh * 0.5))).toFixed(3));
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(syncRail); } }, { passive: true });
  addEventListener('resize', syncRail);
  reduce.addEventListener('change', syncRail);
  syncRail();
}
