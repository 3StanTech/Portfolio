// Rasterize the social share card (public/og-image.svg) to a PNG, then
// composite the approved Night Studio monogram into the logo plate.
//
// Social platforms (Facebook, X, LinkedIn, iMessage, Slack, …) don't render
// SVG og:images, so we ship a PNG. This runs automatically before every build
// (via the `prebuild` npm hook) so the PNG can never drift from the SVG —
// edit og-image.svg, and the PNG regenerates on the next build.
//
// `sharp` is available because Astro depends on it for image optimization.
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const src = join(publicDir, 'og-image.svg');
const logoSrc = join(publicDir, 'logo.png');
const out = join(publicDir, 'og-image.png');

// Matches the logo plate in public/og-image.svg (rect#logo-slot).
const LOGO_X = 868;
const LOGO_Y = 92;
const LOGO_SIZE = 248;
const LOGO_PAD = 14;

try {
  if (!existsSync(logoSrc)) {
    throw new Error(`Missing Night Studio OG logo at ${logoSrc}`);
  }

  const base = await sharp(src, { density: 200 })
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
