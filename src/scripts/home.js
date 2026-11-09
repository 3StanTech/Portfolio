// Home (glass overhaul): the selected work rail (paddles and a 5s tour) and the process
// rail that draws as the scope band scrolls in. Ported from the approved mock.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

// ---------- Selected work rail ----------
const rail = $('[data-rail]'), works = $('.works');
if (rail && works) {
  const paddles = $$('.paddle', works);
  const step = () => (rail.querySelector('li')?.offsetWidth ?? 0) + 18;
  const behavior = () => (reduce.matches ? 'auto' : 'smooth');
  const sync = () => {
    paddles[0].disabled = rail.scrollLeft < 4;
    paddles[1].disabled = rail.scrollLeft > rail.scrollWidth - rail.clientWidth - 4;
  };
  for (const b of paddles) b.addEventListener('click', () => rail.scrollBy({ left: step() * +b.dataset.dir, behavior: behavior() }));
  rail.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  addEventListener('resize', sync);
  sync();

  // Tour: one tile every 5s, looping, with no visible timer. It holds while the pointer or
  // focus is on the work, while the rail is off screen and while the tab is hidden
  // (WCAG 2.2.2); the glass button pauses or plays it; reduced motion starts it paused.
  const tourBtn = $('.rail-tour', works);
  let playing = !reduce.matches, held = false, onScreen = false;
  const setPlaying = (on) => {
    playing = on;
    tourBtn.setAttribute('aria-pressed', String(on));
    tourBtn.setAttribute('aria-label', on ? 'Pause the project tour' : 'Play the project tour');
  };
  setPlaying(playing);
  tourBtn.addEventListener('click', () => setPlaying(!playing));
  works.addEventListener('pointerenter', () => { held = true; });
  works.addEventListener('pointerleave', () => { held = works.contains(document.activeElement); });
  works.addEventListener('focusin', () => { held = true; });
  works.addEventListener('focusout', (e) => { if (!works.contains(e.relatedTarget)) held = false; });
  new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; }).observe(rail);
  reduce.addEventListener('change', () => { if (reduce.matches) setPlaying(false); });
  setInterval(() => {
    if (!playing || held || !onScreen || document.hidden) return;
    const atEnd = rail.scrollLeft > rail.scrollWidth - rail.clientWidth - 8;
    rail.scrollTo({ left: atEnd ? 0 : rail.scrollLeft + step(), behavior: behavior() });
  }, 5000);
}

// ---------- Process rail ----------
// The line draws from Scope to Launch while the strip rises from 85% to 35% of the
// viewport. Without this script or under reduced motion it stays fully drawn (--p: 1).
const prail = $('.prail');
if (prail && !reduce.matches) {
  let queued = false;
  const syncRail = () => {
    queued = false;
    const top = prail.getBoundingClientRect().top, vh = innerHeight;
    prail.style.setProperty('--p', Math.min(1, Math.max(0, (vh * 0.85 - top) / (vh * 0.5))).toFixed(3));
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(syncRail); } }, { passive: true });
  addEventListener('resize', syncRail);
  syncRail();
}
