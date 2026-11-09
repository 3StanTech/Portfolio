// Rasterize the social share card (public/og-image.svg, the black G4 card) to a PNG,
// then composite the Night Studio monogram into the logo plate.
//
// Social platforms (Facebook, X, LinkedIn, iMessage, Slack, …) don't render
// SVG og:images, so we ship a PNG. This runs automatically before every build
// (via the `prebuild` npm hook) so the PNG can never drift from the SVG —
// edit og-image.svg, and the PNG regenerates on the next build.
//
// Each <text> is drawn as outlines from the site's own fonts (static @fontsource
// WOFF files of Geist, Geist Mono and DM Serif Display, read with opentype.js; the
// site's variable WOFF2 files cannot be read there) before rasterizing, so the card looks the same
// on every build host instead of falling back to whatever system fonts it has.
//
// `sharp` is available because Astro depends on it for image optimization.
import sharp from 'sharp';
import opentype from 'opentype.js';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const src = join(publicDir, 'og-image.svg');
const logoSrc = join(publicDir, 'logo.png');
const out = join(publicDir, 'og-image.png');

// Matches the logo plate in public/og-image.svg (rect#logo-slot).
const LOGO_X = 868;
const LOGO_Y = 92;
const LOGO_SIZE = 248;
const LOGO_PAD = 14;
const LOGO_RADIUS = 40;
// Text in the card's upper area must end this far left of the logo plate; all
// text must end inside the card frame (x 48–1152) with the same margin.
const TEXT_GAP = 24;
const FRAME_RIGHT = 1152;

// Matches the plate's fill in og-image.svg (rect#logo-slot), behind the logo's margins.
const PLATE = { r: 0x22, g: 0x2a, b: 0x39, alpha: 1 };

// font-family + font-weight in og-image.svg → static font file.
const FONT_FILES = {
  'Geist 700': '@fontsource/geist/files/geist-latin-700-normal.woff',
  'Geist 600': '@fontsource/geist/files/geist-latin-600-normal.woff',
  'Geist 400': '@fontsource/geist/files/geist-latin-400-normal.woff',
  'Geist Mono 500': '@fontsource/geist-mono/files/geist-mono-latin-500-normal.woff',
  'DM Serif Display 400': '@fontsource/dm-serif-display/files/dm-serif-display-latin-400-italic.woff'
};
const fonts = new Map();
function loadFont(key) {
  if (!FONT_FILES[key]) throw new Error(`No font file mapped for "${key}" in og-image.svg`);
  if (!fonts.has(key)) {
    const buf = readFileSync(join(root, 'node_modules', FONT_FILES[key]));
    fonts.set(key, opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)));
  }
  return fonts.get(key);
}

const attr = (attrs, name) => attrs.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const decode = (t) => t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

// Serialize path commands ourselves: opentype.js's toPathData rounding turns some
// tiny decimals (e.g. 1e-14) into NaN, which stops the renderer mid-path.
const n = (v) => v.toFixed(2).replace(/\.?0+$/, '');
function pathData(commands) {
  return commands.map((c) => {
    if (c.type === 'M' || c.type === 'L') return `${c.type}${n(c.x)} ${n(c.y)}`;
    if (c.type === 'Q') return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
    if (c.type === 'C') return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
    return 'Z';
  }).join('');
}

// Glyph-by-glyph layout: advance + GPOS/kern pair kerning + letter-spacing. It skips
// opentype.js's text shaping on purpose: that path runs Hanken Grotesk's ccmp
// lookups, which opentype.js 2.0 does not support, and the card needs no shaping.
function layout(font, text, x, y, size, spacing) {
  const scale = size / font.unitsPerEm;
  const glyphs = [...text].map((ch) => font.charToGlyph(ch));
  let cursor = x;
  let d = '';
  glyphs.forEach((glyph, i) => {
    if (glyph.index === 0) throw new Error(`Font has no glyph for "${text[i]}" in "${text}"`);
    d += pathData(glyph.getPath(cursor, y, size).commands);
    cursor += glyph.advanceWidth * scale + (i < glyphs.length - 1 ? spacing + font.getKerningValue(glyph, glyphs[i + 1]) * scale : 0);
  });
  if (d.includes('NaN')) throw new Error(`Bad outline for "${text}"`);
  return { d, right: cursor };
}

// Replace every <text> with <path>s of its glyph outlines (start-anchored, baseline y).
// A <text> may hold <tspan> runs (font-family, font-weight, fill, letter-spacing each
// optional, inherited from the <text>); runs are laid out one after another on the line.
function outlineText(svg) {
  return svg.replace(/<text\b(\s[^>]*)>([\s\S]*?)<\/text>/g, (_, attrs, inner) => {
    const size = Number(attr(attrs, 'font-size'));
    const x = Number(attr(attrs, 'x'));
    const y = Number(attr(attrs, 'y'));
    const runs = [];
    inner.replace(/<tspan\b([^>]*)>([^<]*)<\/tspan>|([^<]+)/g, (__, tAttrs, tText, plain) => {
      const raw = tText ?? plain;
      if (raw && raw.length) runs.push({ attrs: tAttrs ? ' ' + tAttrs : '', text: decode(raw) });
      return '';
    });
    const pick = (run, name, fallback) => attr(run.attrs, name) ?? attr(attrs, name) ?? fallback;
    let cursor = x;
    let out = '';
    let label = '';
    for (const run of runs) {
      if (!run.text.trim() && run === runs.at(-1)) continue;
      const key = `${pick(run, 'font-family')} ${pick(run, 'font-weight', '400')}`;
      const { d, right } = layout(loadFont(key), run.text, cursor, y, size, Number(pick(run, 'letter-spacing', 0)));
      out += `<path fill="${pick(run, 'fill')}" d="${d}"/>`;
      cursor = right;
      label += run.text;
    }
    const limit = y < LOGO_Y + LOGO_SIZE + size ? LOGO_X - TEXT_GAP : FRAME_RIGHT - TEXT_GAP;
    if (cursor > limit) throw new Error(`"${label.trim()}" ends at x=${Math.round(cursor)}, past ${limit}`);
    return out;
  });
}

try {
  if (!existsSync(logoSrc)) {
    throw new Error(`Missing Night Studio OG logo at ${logoSrc}`);
  }

  const svg = outlineText(readFileSync(src, 'utf8'));
  const base = await sharp(Buffer.from(svg), { density: 200 })
    .resize(1200, 630)
    .png()
    .toBuffer();

  // The logo sits inside the plate with rounded corners (the plate's radius less the pad).
  const inner = LOGO_SIZE - LOGO_PAD * 2;
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${inner}" height="${inner}"><rect width="${inner}" height="${inner}" rx="${LOGO_RADIUS - LOGO_PAD}" fill="#fff"/></svg>`);
  const logo = await sharp(logoSrc)
    .resize(inner, inner, { fit: 'contain', background: PLATE, kernel: 'lanczos3' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const info = await sharp(base)
    .composite([
      {
        input: logo,
        left: LOGO_X + LOGO_PAD,
        top: LOGO_Y + LOGO_PAD
      }
    ])
    .png()
    .toFile(out);

  console.log(`[og-image] regenerated og-image.png (${info.width}x${info.height}) as the black G4 card`);
} catch (err) {
  console.error('[og-image] failed to regenerate PNG:', err.message);
  process.exit(1);
}
