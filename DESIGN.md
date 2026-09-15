---
name: Tristan Portfolio
description: A confident, navy-anchored portfolio for a Quezon City software developer, with warm amber accents, editorial serif display, light + dark.
colors:
  navy: "#14304E"
  navy-deep: "#0B1F35"
  steel: "#4A6FA5"
  amber: "#D9822B"
  amber-deep: "#935214"
  gold: "#C9A227"
  paper: "#F7F9FC"
  paper-2: "#EBF0F6"
  mist: "#DCE6F1"
  sky: "#D8E8F4"
  panel: "#FFFFFF"
  ink: "#16202B"
  ink-soft: "#536376"
  line: "#D5DDE7"
  line-strong: "#AFBDCE"
  on-dark: "#EAF1F8"
  on-dark-soft: "#BCCADA"
typography:
  display:
    fontFamily: "Fraunces Variable, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(2.65rem, 1.72rem + 3.85vw, 4.75rem)"
    fontWeight: 650
    lineHeight: 1.03
    letterSpacing: "0"
  headline:
    fontFamily: "Fraunces Variable, Georgia, serif"
    fontSize: "clamp(2rem, 1.48rem + 2.15vw, 3.16rem)"
    fontWeight: 650
    lineHeight: 1.03
  title:
    fontFamily: "Fraunces Variable, Georgia, serif"
    fontSize: "clamp(1.48rem, 1.24rem + 1vw, 2.02rem)"
    fontWeight: 650
    lineHeight: 1.1
  body:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Hanken Grotesk Variable, system-ui, sans-serif"
    fontSize: "0.73rem"
    fontWeight: 820
    letterSpacing: "0.16em"
rounded:
  sm: "6px"
  md: "8px"
  pill: "999px"
spacing:
  xs: "0.35rem"
  sm: "0.65rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  "2xl": "3rem"
  section: "clamp(4.5rem, 3.2rem + 5.5vw, 8rem)"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.pill}"
    padding: "0.72rem 1.05rem"
  button-primary-hover:
    backgroundColor: "{colors.navy-deep}"
    textColor: "{colors.on-dark}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.steel}"
    rounded: "{rounded.pill}"
    padding: "0.72rem 1.05rem"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "clamp(1.25rem, 1rem + 1.2vw, 2rem)"
  pill:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.55rem"
  eyebrow:
    textColor: "{colors.amber-deep}"
    typography: "{typography.label}"
---

# Design System: Tristan Portfolio

## 1. Overview

**Creative North Star: "The Night Studio"**

A working design studio after dark: deep-navy walls, one warm amber worklight, and
the work itself glowing on display. The system is **confident, precise, and warm** —
navy carries the authority and trust a non-technical business owner needs to feel,
while amber, an editorial serif, and plain human copy keep it from ever going cold
or corporate. It should read as *sharp*, not loud; every bold move stays instantly
legible on a phone in daylight.

The register is **brand**: this portfolio is itself the strongest sample of the
work it sells, so craft, speed, and accessibility are the pitch, not decoration.
It commits to a **Committed** color strategy — navy is not a neutral backdrop but a
saturated brand surface that owns the dark bands, the primary button, and the
footer — with amber as a deliberately rare warm highlight. The system ships in
**both light and dark themes** from one set of semantic tokens; navy bands stay
dark in both, so the "studio wall" reads the same day or night.

**Key Characteristics:**
- Navy-drenched dark bands against cool off-white light bands; never a warm cream.
- Editorial serif display (Fraunces) over a clean grotesque body (Hanken Grotesk).
- Amber is the single warm accent — rare, warm, and always AA-legible.
- Flat by default; crisp borders at rest and a restrained navy-tinted lift on hover.
- Motion is purposeful and quiet: scroll reveals, card lifts, theme crossfade —
  all gated behind `prefers-reduced-motion`.

## 2. Colors

A cool, confident navy field warmed by a single ochre-amber accent — trust from the
blue end, personality from the warm one.

### Primary
- **Studio Navy** (#14304E): the brand's load-bearing color. Primary buttons, the
  brand mark, heading accents, and the base of every dark band. Carries 30–50% of
  the surface on dark sections — this is a Committed strategy, not a hint of blue.
- **Midnight Navy** (#0B1F35): the deepest tone. Footer, the darkest CTA bands, and
  primary-button hover. The back wall of the studio.

### Secondary
- **Worklight Amber** (#D9822B): the one warm accent. The dark-theme CTA fill (with
  Midnight-Navy text), external-link affordances, and warm glances of highlight.
  Bright amber never carries body text on light — it fails AA there by design.
- **Signed Amber** (#935214): the AA-safe amber for text on light surfaces — section
  eyebrows, the numbered markers, list counters, and link hover. The "signature."

### Tertiary
- **Steel** (#4A6FA5): body-link color on light, secondary-button text, quiet
  structural accent. The muted-blue mid-tone between navy and paper.
- **Brass Gold** (#C9A227): tiny accents on dark bands only (focus ring, small
  flourishes). Never on light. Its on-dark eyebrow sibling is **Lamp Gold**
  (#E7C46A).

### Neutral
- **Cloud Paper** (#F7F9FC): the light page background — a cool off-white at near-zero
  warmth. Explicitly NOT cream/sand.
- **Overcast** (#EBF0F6) / **Mist** (#DCE6F1) / **Sky** (#D8E8F4): the tinted light
  bands, tinted toward the brand's own blue, that give sections rhythm.
- **Panel White** (#FFFFFF): cards and raised surfaces on light.
- **Ink** (#16202B): body text on light (15.6:1 on paper).
- **Soft Ink** (#536376): secondary text — AA-tuned to clear 4.5:1 even on the Mist
  and Sky bands.
- **Line** (#D5DDE7) / **Line Strong** (#AFBDCE): hairlines and borders.
- **On-Dark** (#EAF1F8) / **On-Dark Soft** (#BCCADA): text on the always-dark navy
  bands, in both themes.

**Dark theme.** Surfaces invert to a navy night — page **#0B1320**, panel **#111C2B**,
ink **#EAF1F8**, links **#9DBBE6**, and the primary button flips to **Worklight Amber**
with Midnight-Navy text. Navy bands and amber stay put; the brand doesn't change
identity between themes, only its lighting.

### Named Rules
**The Amber Rarity Rule.** Amber is the worklight, not the wall. It carries ≤10% of
any screen — one CTA, the external-link marks, a hover. Flood the page with it and it
stops meaning "act here."

**The Warm-the-Navy Rule.** Warmth is carried by amber, the serif, and the copy —
*never* by tinting the body background warm. The light background is cool off-white;
a cream/sand/beige body is prohibited.

**The AA-First Rule.** Every text/background pair is verified to WCAG AA in both
themes before it ships. Amber-on-light body text and steel-on-mist are the known
traps; use Signed Amber (#935214) and Soft Ink (#536376), not their brighter siblings.

## 3. Typography

**Display Font:** Fraunces Variable (with Iowan Old Style, Georgia, serif)
**Body Font:** Hanken Grotesk Variable (with system-ui, sans-serif)

**Character:** A high-contrast pairing on the serif↔sans axis. Fraunces brings warm,
slightly literary authority to headings — the "signed" human hand — while Hanken
Grotesk keeps body copy clean, neutral, and fast to read on a phone. One display
face, one body face; contrast comes from weight and size, not from adding fonts.

### Hierarchy
- **Display** (650, clamp(2.65rem→4.75rem), lh 1.03): the hero H1 only, capped at
  ~11ch width. Ceiling stays ≤ ~4.75rem — confident, never shouting.
- **Headline** (650, clamp(2rem→3.16rem), lh 1.03): section H2s.
- **Title** (650, clamp(1.48rem→2.02rem), lh 1.1): card and panel H3s.
- **Body** (400, 1rem, lh 1.65): paragraphs; cap measure at 56–75ch.
- **Label / Eyebrow** (820, 0.73rem, 0.16em tracking, uppercase): section kickers
  and meta. Signed-Amber on light, Lamp-Gold on dark. See the Don'ts about overuse.

### Named component roles

The base steps above define the shared type scale. These named roles cover
intentional component-specific sizes in `src/styles/tokens.css`; using the roles
keeps the rendered design unchanged while making the exceptions explicit.

| Token | Value | Typical use |
|---|---|---|
| `--text-nav` | `.94rem` | navigation links |
| `--text-kicker` | `.9rem` | hero and page kickers, work metadata |
| `--text-supporting` | `.86rem` | trust notes, footer notes, supporting labels |
| `--text-label` | `.82rem` | pills, tags, facts labels, closer kicker |
| `--text-meta` | `.84rem` | card and modal metadata |
| `--text-utility` | `.88rem` | footer and facts links |
| `--step--1` | `.92rem` | compact notes and modal notes |
| `--text-badge` | `.72rem` | recommendation badges |
| `--text-compact` | `.8rem` | demo notes |
| `--text-work-number` | `1.05rem` | work-panel numbers |
| `--text-work-title` | `1.14rem` | work-panel titles |
| `--text-section-number` | `clamp(2.4rem, 1.6rem + 2.8vw, 4rem)` | numbered section markers |
| `--text-hero-title` | `clamp(2.55rem, 1.85rem + 3.3vw, 4.4rem)` | homepage hero title |
| `--text-card-fallback` | `clamp(4rem, 12vw, 9rem)` | fallback cover initials |
| `--text-section-heading` | `clamp(1.75rem, 1.3rem + 1.9vw, 2.6rem)` | bold section headings |
| `--text-page-title` | `clamp(2.1rem, 1.55rem + 2.5vw, 3.35rem)` | interior page titles |
| `--text-scope-heading` | `clamp(1.55rem, 1.15rem + 1.5vw, 2.2rem)` | scope/process heading |
| `--text-commissions-heading` | `clamp(1.55rem, 1.2rem + 1.35vw, 2.15rem)` | commissions heading |
| `--text-service-heading` | `clamp(1.4rem, 1.1rem + 1.2vw, 1.95rem)` | service tier headings |
| `--text-profile-quote` | `clamp(1.25rem, 1.08rem + .45vw, 1.4rem)` | About profile quote |
| `--text-principle-heading` | `clamp(1.2rem, 1.05rem + .6vw, 1.5rem)` | About principle headings |
| `--text-about-lede` | `clamp(1.15rem, 1.05rem + .2vw, 1.2rem)` | About lede |
| `--text-values-heading` | `clamp(1.15rem, 1rem + .4vw, 1.35rem)` | About values heading |
| `--text-closer-title` | `clamp(1.85rem, 1.4rem + 2.1vw, 3rem)` | closing CTA title |

Inline code uses the intentional `--radius-code` exception (`4px`); other
component radii remain the documented 6px, 8px, and pill scale.

### Named Rules
**The One-Serif Rule.** Fraunces owns every heading; Hanken owns every line of body.
Do not introduce a third family or set body copy in the serif. Contrast is bought
with weight and scale.

## 4. Elevation

Flat by default, lifted on interaction. Bordered surfaces carry no shadow at rest;
depth is a *response* to state (hover), not a permanent costume. Dark theme deepens
the same compact hover shadow rather than adding new layers.

### Shadow Vocabulary
- **Interactive lift** (`box-shadow: 0 6px 10px rgba(11,31,53,.14)`): used only when
  a project card rises on hover. Dark theme uses the same compact geometry with a
  deeper neutral shadow.
- **Floating menu** (`box-shadow: 0 8px 14px rgba(11,31,53,.16)`): reserved for the
  open mobile navigation, where elevation communicates that it sits above the page.

### Named Rules
**The Flat-By-Default Rule.** No stacked shadows and no glow at rest. A card sits flat
until hover, when it rises 4px, its border firms to Line-Strong, and one compact
navy-tinted shadow appears.

## 5. Components

Components read **sharp and confident**: decisive weight, crisp full borders, pill
CTAs, and a purposeful hover lift. Nothing tentative, nothing overwrought.

### Buttons
- **Shape:** fully pill (999px), min-height 2.85rem, padding 0.72rem 1.05rem.
- **Primary:** Studio-Navy fill, white text, matching navy border. In dark theme the
  fill flips to Worklight-Amber with Midnight-Navy text — the CTA is always the
  highest-contrast object on the band.
- **Hover / Focus:** primary darkens to Midnight-Navy (amber → deeper amber in dark);
  focus shows a 3px Brass-Gold outline offset 3px. Transitions are color-only, ~200ms.
- **Secondary / Ghost:** transparent fill, Steel/Navy text, full border; hover fills
  with Mist. Used for "More about me", "Open website", secondary contact.

### Chips / Pills
- **Style:** Panel-White-tinted fill, Soft-Ink text, 1px Line border, fully pill.
- **Use:** tech-stack tags on project cards and case meta. Non-interactive; purely
  informational, never mistaken for a button.

### Cards / Containers
- **Corner Style:** 8px (md).
- **Background:** Panel White on light, #111C2B on dark; no shadow at rest.
- **Border:** 1px Line, firming to Line-Strong on hover.
- **Hover:** lifts translateY(-4px); the cover image scales to 1.035 inside its clip.
- **Internal Padding:** clamp(1.25rem → 2rem).

### Navigation
- **Style:** sticky, blurred translucent Paper header with a 1px Line underbottom.
  Text links in Ink, pill hover fill in Mist. Brand mark is a navy disc with a white
  serif "T".
- **Mobile:** below 860px the links collapse into a hamburger-triggered panel
  (icon swaps to an X while open; Escape and outside-click close it and return
  focus). The theme toggle stays visible in the header bar, outside the panel.
  "Email me" renders as the primary pill CTA at the end of the nav.
- **Theme toggle:** a circular icon button (moon in light, sun in dark) that writes
  `data-theme` and persists to `localStorage`, with a no-flash inline script in
  `<head>` and `prefers-color-scheme` as the default.

### Project Card (signature)
The core proof unit. A 16:10 cover image (real project photography, screenshots, or
character GIFs), a Commercial/Personal + year meta row, a Fraunces title, a concise
summary, a hairline-topped "Outcome" row, up to four stack pills, and an honest
"Open website ↗" (or "View code ↗" for repo-only work) affordance. The card is an
`<article>`; the Fraunces title is the link, stretched over the whole card via a
pseudo-element, with a separate z-raised "Code ↗" link when a live project also has
a public repo. The homepage and Projects page use consistent compact rows for
commercial work. The Projects page separates that work from a Personal Commissions
band that stacks cleanly on mobile.

### Hero (signature)
Two-column on desktop: left is eyebrow → serif H1 (≤11ch) → subhead → contact CTAs;
right is the **Proof Panel**, a hairline-divided stack of featured-work links. The
background is a theme-aware token gradient (a soft Steel glow top-right, a faint Amber
glow bottom-left over Paper) — no raster image, so it stays clean in both themes.

## 6. Do's and Don'ts

### Do:
- **Do** keep navy Committed: let it own the dark bands, the primary button, and the
  footer at full saturation. Hedging it with grays kills the voice.
- **Do** route every color through the tokens in `src/styles/tokens.css`. All hues
  flow from tokens; the semantic roles (`--brand`, `--link`, `--on-dark`…) are what
  make the dark theme work.
- **Do** verify AA on any new text/background pair in *both* themes before shipping;
  use Signed Amber (#935214) and Soft Ink (#536376) on tinted light bands.
- **Do** keep amber rare and warm — one CTA, the external-link marks, a hover.
- **Do** gate every animation behind `@media (prefers-reduced-motion: reduce)` and
  keep reveals enhancing already-visible content (never gate visibility on a class).

### Don't:
- **Don't** ship anything that reads as **generic AI SaaS**: gradient blobs, a wall of
  identical icon-cards, the big-number hero-metric template, or glassmorphism-by-default.
- **Don't** let it look like a **cheap purchased template** — clip-art icons, stock
  everything, obviously-a-theme.
- **Don't overdesign**: no animation for its own sake, no effect that fights legibility.
  Sharp beats busy; readability wins every tie.
- **Don't go corporate-cold**: faceless navy-and-gray with no amber, no serif, no human
  copy is a failure even if it's "clean."
- **Don't** paint the body background cream/sand/beige/warm-tinted. The light surface is
  cool off-white (#F7F9FC); warmth comes from amber and type, per the Warm-the-Navy Rule.
- **Don't** lean on the **tracked uppercase eyebrow + numbered marker on every section**
  as scaffolding. Reserve numbers for a genuine sequence, such as the three-step
  Scope/Build/Launch process, and vary the section cadence elsewhere.
- **Don't** use gradient text (`background-clip: text`) or a >1px colored side-stripe
  border as an accent. Emphasis comes from weight, scale, and full borders.
