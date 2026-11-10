// Projects Inspector (glass overhaul, Spotlight layout). Every build is server-rendered in
// ProjectInspector.astro; this script shows one at a time beside the index, with prev/next,
// Stack and Outcome tabs (arrow keys), the desktop/phone capture flip, #slug deep links and
// a 5s tour. The tour holds while the pointer or focus is inside, while a Project details
// dialog is open (so its trigger stays visible to take focus back), while the Inspector is
// off screen and while the tab is hidden (WCAG 2.2.2); reduced motion and Save-Data (each
// step fetches a capture) start it paused.
import { adapt, adaptAll, mountLenses } from './site.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const saveData = document.documentElement.classList.contains('save-data');
const stacked = matchMedia('(max-width: 960px)');
const scrollBehavior = () => reduce.matches || saveData ? 'instant' : 'smooth';

for (const ins of $$('[data-ins]')) {
  const picks = $$('.ins-pick', ins), builds = $$('.ins-build', ins), list = $('.ins-list', ins);
  if (!picks.length || picks.length !== builds.length) continue;
  ins.classList.add('is-ready');
  const panel = $('.ins-panel', ins);
  let cur = -1;

  const placeLens = () => {
    const b = picks[cur]; if (!b) return;
    list.style.setProperty('--ly', b.parentElement.offsetTop + 'px');
    list.style.setProperty('--lh', b.offsetHeight + 'px');
  };
  const placeTab = (build) => {
    const tl = $('.ins-tabs', build), sel = tl && $('[aria-selected="true"]', tl);
    if (!sel) return;
    tl.style.setProperty('--tx', sel.offsetLeft + 'px'); tl.style.setProperty('--tw', sel.offsetWidth + 'px');
  };
  const selectTab = (tab, focus = false) => {
    const tl = tab.parentElement;
    for (const t of $$('[role="tab"]', tl)) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    }
    if (focus) tab.focus();
    placeTab(tab.closest('.ins-build'));
  };

  // Tabs, the capture flip and the hidden panels are set up once per build.
  for (const build of builds) {
    const tabs = $$('[role="tab"]', build);
    tabs.forEach((tab, k) => {
      tab.addEventListener('click', () => { setTour(false); selectTab(tab); });
      tab.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
        e.preventDefault(); setTour(false); selectTab(tabs[(k + d + tabs.length) % tabs.length], true);
      });
    });
    if (tabs[0]) selectTab(tabs[0]);
    const cover = $('.ins-cover', build), title = $('.ins-title', build).textContent.trim();
    cover.addEventListener('click', () => {
      setTour(false);
      const on = cover.getAttribute('aria-pressed') !== 'true';
      cover.setAttribute('aria-pressed', String(on));
      cover.setAttribute('aria-label', `${title}: show the ${on ? 'desktop' : 'phone'} view`);
    });
    $('.desk', cover).addEventListener('load', () => { if (builds[cur] === build) setTimeout(() => adapt($('.ins-body', build)), 60); });
  }

  const select = (i, { focus = false, swap = true } = {}) => {
    i = (i + picks.length) % picks.length;
    if (i === cur) return;
    cur = i;
    picks.forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
    builds.forEach((b, k) => b.classList.toggle('is-current', k === i));
    const build = builds[i];
    // Loading the hidden builds' captures waits until they are shown.
    for (const img of $$('img[loading="lazy"]', build)) img.loading = 'eager';
    if (swap) for (const el of [$('.ins-body', build), $('.ins-cover-wrap', build)]) { el.classList.remove('ins-swap'); void el.offsetWidth; el.classList.add('ins-swap'); }
    placeLens();
    requestAnimationFrame(() => { placeTab(build); mountLenses(build); adapt($('.ins-body', build)); });
    if (focus) picks[i].focus({ preventScroll: true });
    restart();
  };

  const land = () => requestAnimationFrame(() => (stacked.matches ? panel : ins).scrollIntoView({ block: 'start', behavior: scrollBehavior() }));
  const pick = (i, { focus = false, scroll = false } = {}) => {
    setTour(false);
    select(i, { focus });
    if (focus) picks[cur].focus({ preventScroll: true });
    if (scroll && stacked.matches) land();
  };

  picks.forEach((b, i) => {
    b.addEventListener('click', () => pick(i, { scroll: true }));
    let hoverT;
    b.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; clearTimeout(hoverT); hoverT = setTimeout(() => pick(i), 160); });
    b.addEventListener('pointerleave', () => clearTimeout(hoverT));
    b.addEventListener('keydown', (e) => {
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); pick(i + d, { focus: true, scroll: true }); }
    });
  });
  $('.ins-prev', ins).addEventListener('click', () => pick(cur - 1));
  $('.ins-next', ins).addEventListener('click', () => pick(cur + 1));
  for (const action of $$('.ins-actions a, .ins-actions .details', ins)) action.addEventListener('click', () => setTour(false));

  // ---------- Tour ----------
  const tourBtn = $('.ins-tour', ins);
  let touring = !reduce.matches && !saveData, holdPointer = false, holdFocus = false, onScreen = true, timer = 0;
  const dialogOpen = () => document.querySelector('dialog.pm[open]') !== null;
  const running = () => touring && !holdPointer && !holdFocus && !dialogOpen() && onScreen && document.visibilityState === 'visible';
  function restart() {
    clearTimeout(timer);
    if (running()) timer = window.setTimeout(() => { if (running()) select(cur + 1); }, 5000);
  }
  const setTour = (on) => {
    touring = on;
    tourBtn.setAttribute('aria-pressed', String(on));
    tourBtn.setAttribute('aria-label', on ? 'Pause the project tour' : 'Play the project tour');
    restart();
  };
  tourBtn.addEventListener('click', () => setTour(!touring));
  ins.addEventListener('pointerenter', () => { holdPointer = true; restart(); });
  ins.addEventListener('pointerleave', () => { holdPointer = false; restart(); });
  ins.addEventListener('focusin', () => { holdFocus = true; restart(); });
  ins.addEventListener('focusout', (e) => { if (!ins.contains(e.relatedTarget)) { holdFocus = false; restart(); } });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; restart(); }).observe(ins);
  document.addEventListener('visibilitychange', restart);
  const dialogObserver = new MutationObserver(restart);
  for (const dialog of $$('dialog.pm')) dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] });
  reduce.addEventListener('change', () => { if (reduce.matches) setTour(false); });

  // ---------- Deep links: /projects/#<slug> selects that build and stops the tour ----------
  const fromHash = () => builds.findIndex((b) => '#' + b.dataset.slug === location.hash);
  const openHash = () => {
    const k = fromHash(); if (k < 0) return;
    setTour(false); select(k, { swap: false });
    land();
  };
  addEventListener('hashchange', openHash);
  // Re-activating the current hash does not dispatch hashchange.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download')) return;
    const url = new URL(a.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash === location.hash && fromHash() >= 0) {
      e.preventDefault(); openHash();
    }
  });
  addEventListener('resize', () => { placeLens(); placeTab(builds[cur]); });

  // Measure only sheet content: inactive captures remain hidden and lazy. CSS consumes
  // this reservation only in its mid-width below-capture mode; the clone has no minimum
  // height, so the previous reservation can never feed back into the next measurement.
  let fontsReady = !document.fonts, measureQueued = false, measuredWidth = -1;
  const measureSheets = () => {
    measureQueued = false;
    if (!fontsReady) return;
    const width = panel.getBoundingClientRect().width;
    if (!width) return;
    let tallest = 0;
    for (const build of builds) {
      const sheet = $('.ins-body', build).cloneNode(true);
      sheet.classList.remove('ins-swap');
      sheet.inert = true;
      sheet.setAttribute('aria-hidden', 'true');
      for (const el of [sheet, ...$$('*', sheet)]) {
        el.removeAttribute('id');
        el.removeAttribute('aria-controls');
        el.removeAttribute('aria-labelledby');
        if (el.classList.contains('glass')) el.dataset.lens = 'none';
      }
      for (const media of $$('img, picture, iframe, video, audio, canvas', sheet)) media.remove();
      Object.assign(sheet.style, { position: 'absolute', inset: '0 auto auto 0', width: width + 'px', height: 'auto', margin: '0', visibility: 'hidden', pointerEvents: 'none', animation: 'none', transition: 'none', transform: 'none', translate: 'none' });
      sheet.style.setProperty('min-height', '0', 'important');
      sheet.style.setProperty('max-height', 'none', 'important');
      panel.append(sheet);
      const panels = $$('[role="tabpanel"]', sheet), tabs = $$('[role="tab"]', sheet);
      for (let i = 0; i < panels.length; i++) {
        panels.forEach((p, k) => { p.hidden = k !== i; });
        tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
        tallest = Math.max(tallest, sheet.getBoundingClientRect().height);
      }
      sheet.remove();
    }
    measuredWidth = width;
    panel.style.setProperty('--ins-sheet-min-height', Math.ceil(tallest) + 'px');
  };
  const queueMeasure = () => {
    if (!measureQueued) { measureQueued = true; requestAnimationFrame(measureSheets); }
  };
  if ('ResizeObserver' in window) new ResizeObserver(() => {
    if (panel.getBoundingClientRect().width !== measuredWidth) queueMeasure();
  }).observe(panel);
  addEventListener('resize', queueMeasure);

  const k = fromHash();
  if (k >= 0) { touring = false; select(k, { swap: false }); land(); }
  else select(0, { swap: false });
  setTour(touring);
  if (document.fonts) document.fonts.ready.then(() => { fontsReady = true; placeLens(); placeTab(builds[cur]); adaptAll(); queueMeasure(); });
  else queueMeasure();
}
