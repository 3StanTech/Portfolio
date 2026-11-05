// Rasterize the social share card (public/og-image.svg) to a PNG, then
// composite the approved Night Studio monogram into the logo plate.
//
// Social platforms (Facebook, X, LinkedIn, iMessage, Slack, …) don't render
// SVG og:images, so we ship a PNG. This runs automatically before every build
// (via the `prebuild` npm hook) so the PNG can never drift from the SVG —
// edit og-image.svg, and the PNG regenerates on the next build.
//
// Each <text> is drawn as outlines from the site's own fonts (static @fontsource
// WOFF files, read with opentype.js) before rasterizing, so the card looks the same
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
// Text in the card's upper area must end this far left of the logo plate; all
// text must end inside the card frame (x 48–1152) with the same margin.
const TEXT_GAP = 24;
const FRAME_RIGHT = 1152;

// font-family + font-weight in og-image.svg → static font file.
const FONT_FILES = {
  'Schibsted Grotesk 800': '@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-800-normal.woff',
  'Hanken Grotesk 700': '@fontsource/hanken-grotesk/files/hanken-grotesk-latin-700-normal.woff',
  'Hanken Grotesk 400': '@fontsource/hanken-grotesk/files/hanken-grotesk-latin-400-normal.woff'
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

// Replace every <text> with a <path> of its glyph outlines (start-anchored, baseline y).
function outlineText(svg) {
  return svg.replace(/<text\b([^>]*)>([^<]*)<\/text>/g, (_, attrs, raw) => {
    const text = decode(raw);
    const size = Number(attr(attrs, 'font-size'));
    const key = `${attr(attrs, 'font-family')} ${attr(attrs, 'font-weight') ?? '400'}`;
    const x = Number(attr(attrs, 'x'));
    const y = Number(attr(attrs, 'y'));
    const font = loadFont(key);
    const { d, right } = layout(font, text, x, y, size, Number(attr(attrs, 'letter-spacing') ?? 0));
    const limit = y < LOGO_Y + LOGO_SIZE + size ? LOGO_X - TEXT_GAP : FRAME_RIGHT - TEXT_GAP;
    if (right > limit) throw new Error(`"${text}" ends at x=${Math.round(right)}, past ${limit}`);
    return `<path fill="${attr(attrs, 'fill')}" d="${d}"/>`;
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

  const logo = await sharp(logoSrc)
    .resize(LOGO_SIZE - LOGO_PAD * 2, LOGO_SIZE - LOGO_PAD * 2, {
      fit: 'contain',
      background: { r: 0x0b, g: 0x1f, b: 0x35, alpha: 1 },
      kernel: 'lanczos3'
    })
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

  console.log(`[og-image] regenerated og-image.png (${info.width}x${info.height}) with Night Studio mark`);
} catch (err) {
  console.error('[og-image] failed to regenerate PNG:', err.message);
  process.exit(1);
}
