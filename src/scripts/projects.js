// Projects Inspector (glass overhaul, Spotlight layout). Every build is server-rendered in
// ProjectInspector.astro; this script shows one at a time beside the index, with prev/next,
// Stack and Outcome tabs (arrow keys), the desktop/phone capture flip, #slug deep links and
// a 5s tour. The tour holds while the pointer or focus is inside, while a Project details
// dialog is open (so its trigger stays visible to take focus back), while the Inspector is
// off screen and while the tab is hidden (WCAG 2.2.2); reduced motion starts it paused.
import { adapt, adaptAll, mountLenses } from './site.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

for (const ins of $$('[data-ins]')) {
  const picks = $$('.ins-pick', ins), builds = $$('.ins-build', ins), list = $('.ins-list', ins);
  if (!picks.length || picks.length !== builds.length) continue;
  ins.classList.add('is-ready');
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
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
        e.preventDefault(); selectTab(tabs[(k + d + tabs.length) % tabs.length], true);
      });
    });
    if (tabs[0]) selectTab(tabs[0]);
    const cover = $('.ins-cover', build), title = $('.ins-title', build).textContent.trim();
    cover.addEventListener('click', () => {
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
    if (focus) picks[i].focus();
    restart();
  };

  picks.forEach((b, i) => {
    b.addEventListener('click', () => select(i));
    let hoverT;
    b.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; clearTimeout(hoverT); hoverT = setTimeout(() => select(i), 160); });
    b.addEventListener('pointerleave', () => clearTimeout(hoverT));
    b.addEventListener('keydown', (e) => {
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); select(i + d, { focus: true }); }
    });
  });
  $('.ins-prev', ins).addEventListener('click', () => select(cur - 1));
  $('.ins-next', ins).addEventListener('click', () => select(cur + 1));

  // ---------- Tour ----------
  const tourBtn = $('.ins-tour', ins);
  let touring = !reduce.matches, holdPointer = false, holdFocus = false, onScreen = true, timer = 0;
  const dialogOpen = () => document.querySelector('dialog.pm[open]') !== null;
  const running = () => touring && !holdPointer && !holdFocus && !dialogOpen() && onScreen && document.visibilityState === 'visible';
  function restart() {
    clearTimeout(timer);
    if (running()) timer = window.setTimeout(() => select(cur + 1), 5000);
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
  new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; restart(); }).observe(ins);
  document.addEventListener('visibilitychange', restart);
  for (const dialog of $$('dialog.pm')) dialog.addEventListener('close', restart);
  reduce.addEventListener('change', () => { if (reduce.matches) setTour(false); });

  // ---------- Deep links: /projects/#<slug> selects that build and stops the tour ----------
  const fromHash = () => builds.findIndex((b) => '#' + b.dataset.slug === location.hash);
  const openHash = () => {
    const k = fromHash(); if (k < 0) return;
    setTour(false); select(k, { swap: false });
    requestAnimationFrame(() => ins.scrollIntoView({ block: 'start' }));
  };
  addEventListener('hashchange', openHash);
  addEventListener('resize', () => { placeLens(); placeTab(builds[cur]); });

  const k = fromHash();
  if (k >= 0) { touring = false; select(k, { swap: false }); requestAnimationFrame(() => ins.scrollIntoView({ block: 'start' })); }
  else select(0, { swap: false });
  setTour(touring);
  document.fonts?.ready.then(() => { placeLens(); placeTab(builds[cur]); adaptAll(); });
}
