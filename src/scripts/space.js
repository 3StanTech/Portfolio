// Shared helpers for the sky, the black hole and the page transition (galaxy.js, hole.js,
// warp.js). Ported from the approved black-hole FX mock (black-hole-fx-mocks/approved/shared/util.js).

// Seeded random numbers, so the sky is the same on every visit.
export function mulberry(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// Time-based easing: move `cur` toward `target` with time constant `tau` seconds, the same at
// 60Hz and 120Hz.
export const approach = (cur, target, tau, dt) => target + (cur - target) * Math.exp(-dt / tau);
export const smooth = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : a * a * (3 - 2 * a));
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const easeOutCubic = (k) => 1 - (1 - k) ** 3;
export const easeInCubic = (k) => k ** 3;
export const easeInOutCubic = (k) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2);

// A colour token read from tokens.css. RGB-channel tokens ("194 65 12") become "194,65,12"
// for rgba() strings; a plain colour comes back as written.
const css = () => getComputedStyle(document.documentElement);
export const rgb = (name, fallback) => (css().getPropertyValue(name).trim() || fallback).split(/[\s,]+/).join(',');
export const color = (name, fallback) => css().getPropertyValue(name).trim() || fallback;

// The horizon curve. 1024px and wider keep the original arc: Rx = 0.95w, Ry = max(720, 1.05h).
// Narrower screens copy that arc's shape (its height-to-width ratio at 1440x900) instead of a
// tall U.
export function curve(w, h) {
  const Rx = w * 0.95;
  return { Rx, Ry: w >= 1024 ? Math.max(720, h * 1.05) : Rx * (945 / 1368) };
}
export const sagAt = (x, w, { Rx, Ry }) => { const dx = (x - w / 2) / Rx; return Ry * (1 - Math.sqrt(Math.max(0, 1 - dx * dx))); };
export const slopeAt = (x, w, { Rx, Ry }) => { const dx = (x - w / 2) / Rx, s = Math.sqrt(Math.max(1e-4, 1 - dx * dx)); return (Ry / Rx) * dx / s; };

// Reduced motion or Save-Data: no transition, no shooting stars, a still sky and interior.
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const saveData = navigator.connection?.saveData === true || document.documentElement.classList.contains('save-data');
export const still = () => reduce.matches || saveData;
