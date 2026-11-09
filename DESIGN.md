---
name: Tristan Portfolio
description: A dark glass-and-starlight portfolio for a Philippines full-stack developer. Black page, smoky navy-grey glass, Geist type with one amber DM Serif italic accent word, a live galaxy. Dark only.
colors:
  page: "#000000"
  ink: "#F5F5F7"
  ink-soft: "rgb(245 245 247 / .66)"
  ink-dim: "rgb(245 245 247 / .58)"
  hair: "rgb(245 245 247 / .13)"
  hair-strong: "rgb(245 245 247 / .28)"
  glass-tint: "#222A39"
  stage: "#0B0C10"
  sheet: "rgb(18 22 32 / .94)"
  navy: "#14304E"
  navy-2: "#0B1F35"
  steel: "#4A6FA5"
  steel-light: "#9DBBE6"
  amber: "#D9822B"
  amber-soft: "#E9A25C"
  amber-light: "#FFC98F"
  gold: "#C9A227"
  rail-a: "#5B86C4"
  rail-b: "#9DBBE6"
typography:
  display:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "clamp(50px, 1.5rem + 5.6vw, 106px)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.055em"
  headline:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "clamp(40px, 1.5rem + 3.6vw, 82px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.052em"
  section:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "clamp(30px, 1rem + 1.8vw, 48px)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.045em"
  lead:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 400
    textColor: "{colors.ink-soft}"
  body:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Geist Mono Variable, Geist Mono, ui-monospace, monospace"
    fontSize: "12.5px"
    fontWeight: 500
    letterSpacing: "0.07em"
    textTransform: "uppercase"
  accent:
    fontFamily: "DM Serif Display, Georgia, serif"
    fontStyle: "italic"
    fontWeight: 400
    textColor: "{colors.amber}"
rounded:
  pill: "999px"
  panel: "26px to 34px (Glasswork --radius, unitless)"
  image: "20px to 26px, superellipse(1.5)"
  menu-item: "16px"
spacing:
  gutter: "24px (16px under 860px)"
  maxw: "1200px"
  section: "64px (48px under 860px)"
  page-top: "clamp(120px, 16vh, 156px)"
components:
  button-glass:
    class: ".btn.glass[data-kind=dark][data-tier=clear][data-pill]"
    textColor: "{colors.ink}"
    hoverTextColor: "{colors.amber}"
    rounded: "{rounded.pill}"
    minHeight: "48px"
    padding: "0 22px"
  island:
    class: ".isl.glass (SiteHeader.astro)"
    rounded: "{rounded.pill}"
  contact-menu:
    class: ".pop.glass[data-tier=regular]"
    rounded: "24px"
  kicker:
    class: ".mono.kicker"
    typography: "{typography.label}"
    marker: "7px amber diamond"
  glass-panel:
    class: ".glass[data-kind=dark][data-tier=regular|thick]"
    backgroundColor: "{colors.glass-tint}"
    rounded: "{rounded.panel}"
  rows:
    class: ".rows"
    border: "1px {colors.hair} between rows"
  chip:
    class: ".pill"
    typography: "Geist Mono 500 12.5px"
    textColor: "{colors.ink-soft}"
    border: "inset 1px {colors.hair}"
    rounded: "{rounded.pill}"
  link-go:
    class: ".link-go"
    textColor: "{colors.steel-light}"
    hoverTextColor: "{colors.amber-light}"
---

# Design System: Tristan Portfolio

## 1. Overview

**Creative North Star: "Glass and starlight"**

The site is a dark product page for one developer: a pitch-black sky with a live galaxy,
smoky glass controls and panels that catch the light at their rims, large tight Geist
headlines, and one warm amber word per heading set in DM Serif Display italic. It should
feel like an Apple product page and still read instantly for a café owner on a phone.

The register is **brand**: the portfolio is the strongest sample of the work it sells, so
craft, speed and accessibility are the pitch. The system is internally called **G4** (the
approved mock round). It is **dark only**: there is no light theme, no theme toggle and no
`prefers-color-scheme` path.

**Key characteristics:**
- Black page (`--page`) with a fixed galaxy canvas behind everything (`Galaxy.astro`,
  `src/scripts/galaxy.js`); a black hole's rims mark the hero's exit and every closer's entry.
- Glass for controls and panels only: Glasswork (MIT, `src/vendor/glasswork/`) with the dark
  tiers in `src/styles/material.css`. Rim refraction is Chromium-only; elsewhere the blur,
  tint and rim catch stay.
- Geist for everything, Geist Mono for labels, DM Serif Display italic amber for one accent word.
- Amber is the one warm colour: accent words, kicker diamonds, hover, focus. Steel blue is
  the cool hint: links, the process rail, the galaxy's cool stars.
- Motion is a fixed, owner-approved set (section 6); reduced motion and Save-Data stop it.

## 2. Colors

All colours are tokens in `src/styles/tokens.css`. Rules never hold a hex value; a new colour
becomes a named token first.

| Role | Token | Use |
|---|---|---|
| Page | `--page` `#000` | `<html>` background; `body` has none so the canvas shows |
| Ink | `--ink` `#F5F5F7` | headings, body copy, button labels |
| Ink soft | `--ink-soft` (66%) | leads, supporting text, labels |
| Ink dim | `--ink-dim` (58%) | inactive nav and tabs; the AA floor over dimmed content |
| Hairline | `--hair` (13%) / `--hair-strong` (28%) | row dividers, chip outlines / diagram node outlines |
| Glass tint | `--glass-tint` `#222A39` | the smoky navy-grey of every dark glass surface |
| Stage | `--stage` `#0B0C10` | behind captures and diagrams |
| Sheet | `--sheet` | the Project details dialog |
| Amber | `--amber` `#D9822B`, `--amber-soft`, `--amber-light` | accent word, diamonds, hover / Projects link / current link, tags on glass |
| Steel | `--steel` `#4A6FA5`, `--steel-light` `#9DBBE6` | glows / links on black |
| Rail | `--rail-a`, `--rail-b`, `--rail-glow` | the process rail's line and nodes |
| Galaxy | `--star*`, `--neb-*`, `--ember-hot` | read once by `galaxy.js` |
| Effects | `--glare`, `--spot`, `--spot-rim`, `--glow-hot`, `--sweep*` | the motion set's light |

### Named rules
- **One warm accent.** Amber marks one word per heading and the interactive state; never a
  fill behind text (no amber buttons).
- **AA on glass, measured.** Every text on glass is at least 4.5:1 against the brightest
  realistic backdrop (95th-percentile luminance under the glyphs). Where a capture is bright,
  the glass thickens (adaptive tint) rather than the text getting louder.

## 3. Typography

- **Geist** (variable, self-hosted through Fontsource, OFL) for display and body.
- **Geist Mono** for labels: kickers, tags, chips, fact labels (uppercase, tracked .06 to .07em).
- **DM Serif Display italic** (400) for the accent word only, in amber, with no underline.
  `line-height: 0` on `.accent` keeps its taller ascent from opening a gap between lines.
  The About page's quote is the one full serif line (in ink, not amber).
- The two first-screen faces (Geist, DM Serif italic) are preloaded in `Base.astro`.

| Class | Size | Use |
|---|---|---|
| `.h1` | clamp(50px, 1.5rem + 5.6vw, 106px), 700, -.055em | Home hero; page heads scale it down (`.p-head .h1`, About, case studies) |
| `.h2` | clamp(40px, 1.5rem + 3.6vw, 82px), 700 | scope band, closer (larger) |
| `.sec-h` | clamp(30px, 1rem + 1.8vw, 48px), 700 | section headings on inner pages |
| `.lead` | 21px, ink-soft | the paragraph under a page heading |
| `.mono` | 12.5px Geist Mono 500, uppercase | labels; `.mono.kicker` adds the amber diamond |

Copy is never changed by styling: words come from the mock's `content.md` (Home, Projects)
or stay as written (the other pages). Styling may only move an already marked word into `.accent`.

## 4. Elevation: glass tiers

Shadows are not the elevation system; glass is. `material.css` sets three dark tiers on
Glasswork's material (`data-kind="dark"` plus `data-tier`):

| Tier | Use |
|---|---|
| `clear` | small floating controls: buttons, the island, the contact pill, photo frames |
| `regular` | panels with text: tiles, the scope bento, Services tiers, the stack panel, menus, the case-study menu and diagram |
| `thick` | dense reading surfaces and emphasis (the recommended Services tier) |

Panels use Glasswork's unitless `--radius` (26 to 34); continuous corners
(`corner-shape: superellipse(1.5)`) where supported. The rim lens (refraction) mounts lazily,
one per idle slot, as glass comes on screen (`site.js`); `data-lens="none"` opts a surface out
(photo frames, sticky menus, diagrams) to save the pixel work.

## 5. Components

### Buttons (`.btn.glass`)
Glass pills, 48px tall (44px in compact contexts), Geist 650 16px, an 18px sprite icon.
Every button is glass, including Email me (no amber fill). Hover and focus turn the label and
icon amber, add the warm glare sweep and a 1.02 lift; press scales to .97. Focus ring:
2px amber, 3px offset. `CTA.astro` renders the standard row (Email me, Call, Résumé, GitHub).

### Island header and contact menu (`SiteHeader.astro`)
A floating glass capsule: compact ("Tristan Dolfo · replies within a day"), expanded on hover
or focus into the nav (Projects in amber text), mini while scrolling. "check me out" opens the
glass contact menu (Email me, Copy email with a "Copied" check and live announcement, Call,
Résumé, GitHub); Escape closes and returns focus. Under 600px the open island drops Résumé and
the pill shrinks to its diamond so both fit a 360px screen.

### Page head (`.p-head`)
Centred: `.mono.kicker`, `.h1`, `.lead`, top padding clamp(120px, 16vh, 156px) to clear the
island. Projects, Services and 404 use it; About and the case studies use a left-aligned variant.

### Panels and rows
- `.gpanel` / any `.glass[data-tier]`: the panel; padding clamp(22px, 1rem + 1.6vw, 40px).
- `.rows`: hairline list rows (`--hair` above the first and under each row, 18px padding),
  used for facts, values, principles, the stack groups, constraints and decisions.
- `.dia`: bullet lists with a 7px amber diamond.
- `.pill` chips: Geist Mono, ink-soft, hairline outline, pill radius.
- `.badge`: amber-light mono label with an amber outline ("Most owners start here").
- `.link-go`: steel-light text link with an optional arrow that shifts on hover; amber-light on hover.

### Home
Hero (blur-up words and one amber sweep; the H1 is painted in the first frame), the selected
work rail (nine glass tiles, 5s tour with pause/play, paddles, the Hiring panel left of the
heading), the scope bento (packages panel, process rail with a steel-blue line and amber step
names), the closer.

### Projects (signature): the Spotlight Inspector
A typographic index on the left, the capture as a large stage, the details on a glass sheet
over the capture (Stack and Outcome tabs, live link, case study, Project details), a 5s tour
ring, prev/next, a desktop/phone capture flip and `#slug` deep links. Without JavaScript every
build is stacked and complete.

### Services
Three glass tier panels (Business is `thick` with a faint amber outline and the badge); each
has a mono tag, title, "Best for", a diamond list and a glass quote button aligned to the
panel's foot. "Every tier includes" chips sit centred below.

### About
Portrait in a clear glass frame beside the heading, lede and contact buttons; the serif aside
with the facts as rows; the six principles as two columns of diamond rows; the stack as rows
of chips in one glass panel; the approach as rows with evidence links.

### Case studies
Mono breadcrumb, left-aligned title and lede, a glass facts strip, glass action buttons, the
cover in a glass frame. Body: a sticky glass "On this page" menu (the current section gets the
amber diamond; it becomes a scrolling row under 860px), sections with `.sec-h`-scale headings,
constraints and decisions as rows, the architecture SVG in a glass panel (nodes on `--stage`
with `--hair-strong` outlines, steel-light lines), proof with amber checks.

### Closer and footer
Every page but 404 ends in the closer (`Closer.astro`): amber kicker, a large `.h2` with the
accent word, Email me and Call, a note; the black hole's outgoing rim sits above it. The footer
is the heading plus Résumé, GitHub and Facebook pills only.

### Project details dialog (`ProjectModal.astro`)
Native `<dialog>` on `--sheet` with a blurred backdrop: capture, mono meta, title, blurb,
summary, outcome, chips, and glass actions.

## 6. Motion

The set is fixed (owner's saved settings): glare and amber hover on every button and clickable
panel; the play/pause morph; the Copied check; press feel; the cursor spotlight on glass panels;
blur-up headline words with one amber sweep; stars focusing in; depth tilt; the cursor lens;
the horizon crossing sweep with a softened ripple. Springs are `--spring` and `--spring-soft`
(`material.css`).

- **Reduced motion:** every effect stops; the galaxy is one still frame; the process rail is
  fully drawn; the tours start paused.
- **Save-Data:** the same, plus every transition and animation stops (`.save-data`).
- The hero is never hidden while fonts load (no intro wait).

## 7. Do's and Don'ts

### Do
- Use glass for controls and panels, never for its own sake.
- Put every colour in `tokens.css` first.
- Measure text-on-glass contrast over the brightest backdrop it can sit on.
- Keep one obvious contact action per page (the island's "check me out" and the closer).
- Reuse `.p-head`, `.gpanel`, `.rows`, `.dia`, `.pill`, `.link-go` before writing new rules.

### Don't
- No amber-filled buttons, no underlined accent words, no second warm colour.
- No glass text below 4.5:1, no text on a bare canvas region without enough contrast.
- No light theme, no `data-theme`, no `prefers-color-scheme` branches.
- No new effects outside the motion set; nothing that hides the hero for a reveal.
- No gradient blobs, identical icon-cards or hero-metric templates (PRODUCT.md anti-references).
