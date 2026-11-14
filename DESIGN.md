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
  steel: "#4A6FA5"
  steel-light: "#9DBBE6"
  amber: "#D9822B"
  amber-soft: "#E9A25C"
  amber-light: "#FFC98F"
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
    fontSize: "clamp(28px, 1rem + 1.4vw, 40px)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.04em"
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
  page-head:
    class: ".p-head > .container.inner (kicker, .h1, .lead)"
    align: "center"
    padding: "clamp(120px, 16vh, 156px) 0 56px"
    titleSize: "clamp(48px, 1.5rem + 5vw, 100px)"
  tile:
    class: ".tile.glass[data-tier=regular] (Home rail)"
    rounded: "30 (image 20px, superellipse)"
    width: "up to 344px; narrows with viewport to preserve the neighbours' slivers"
    padding: "10px"
    hover: "lift 6px, glare"
    caption: "title and client type only (no number)"
    edge: "dims to 0.22 and settles back to 0.9 scale while crossing either edge of the row"
  bento:
    class: ".bento (grid holding .wide and .prail)"
    columns: "3 (1 under 960px)"
    gap: "18px"
  bento-wide:
    class: ".bento .wide.glass (packages panel)"
    rounded: "34"
    padding: "44px"
  process-rail:
    class: ".bento .prail.glass"
    rounded: "34"
    padding: "40px 44px 44px (28px 24px under 760px)"
    line: "{colors.rail-a} to {colors.rail-b}, glow --rail-glow"
    stepName: "Geist 700 44px (34px under 760px), {colors.amber}"
    node: "14px diamond on {colors.stage}"
  inspector:
    class: ".ins (ProjectInspector.astro)"
    columns: "300px index + stage (1 column at 960px and below)"
    index-marker: "hollow 10px amber-outline diamond per build; the moving amber diamond fills the one on show"
    stage: "{colors.stage}, radius 34px, superellipse"
    sheet: ".ins-body.glass, radius 26, adaptive tint"
  closer:
    class: ".closer (Closer.astro)"
    padding: "200px 0 140px"
    kicker: "Geist 600 17px, {colors.amber}"
    titleSize: "clamp(44px, 1.5rem + 4.8vw, 104px)"
  footer:
    class: ".foot"
    heading: "Geist 650 19px, {colors.ink}"
    links: "glass pills 40px (Résumé) + 40px round icons (GitHub, Facebook)"
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
- Black page (`--page`) with a fixed galaxy canvas behind everything (`<canvas class="sky">`
  in `Base.astro`, started by `src/scripts/site.js` with the renderer in `src/scripts/galaxy.js`); a black hole's rims mark the hero's exit and every closer's entry.
- Glass for controls and panels only: Glasswork (MIT, `src/vendor/glasswork/`) with the dark
  tiers in `src/styles/material.css`. Rim refraction is Chromium-only; elsewhere the blur,
  tint and rim catch stay.
- Geist for everything, Geist Mono for labels, DM Serif Display italic amber for one accent word.
- Amber is the one warm colour: accent words, kicker diamonds, hover, focus. Steel blue is
  the cool hint: links, the process rail, the galaxy's cool stars.
- Motion is a fixed, owner-approved set (section 6); reduced motion and Save-Data stop it.

## 2. Colors

All colours are tokens in `src/styles/tokens.css`. Rules never hold a hex value; a new colour
becomes a named token first. One exception: neutral white and black alpha overlays (hover
fills, shadows, the black hole's interior darkening) may be written inline as
`rgb(255 255 255 / a)` or `rgb(0 0 0 / a)`; they carry no hue. Canvas colours with a hue
(the galaxy's) are tokens too; channel tokens hold `R G B` so code can add its own alpha.

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
| Galaxy | `--star*`, `--neb-*`, `--ember-hot`, `--rim-1`…`--rim-5`, `--rim-sweep`, `--rim-ripple*` | read once by `galaxy.js`; the `--rim-*` channel tokens are the black hole's rim layers (outer glow to core), the crossing sweep and the ripple |
| Effects | `--glare`, `--spot`, `--spot-rim`, `--glow-hot`, `--sweep*` | the motion set's light |

### Named rules
- **One warm accent.** Amber marks one word per heading and the interactive state; never a
  fill behind text (no amber buttons).
- **AA on glass, measured.** Every text on glass is at least 4.5:1 against the brightest
  realistic backdrop (95th-percentile luminance under the glyphs). Where a capture is bright,
  the glass thickens (adaptive tint) rather than the text getting louder.

## 3. Typography

- **Geist** (variable, self-hosted through Fontsource, OFL) for display and body.
- **Geist Mono** for labels: kickers, tags and fact labels (uppercase, tracked .06 to .07em), and
  the stack chips (mixed case, tracked .04em).
- **DM Serif Display italic** (400) for the accent word only, in amber, with no underline.
  `line-height: 0` on `.accent` keeps its taller ascent from opening a gap between lines.
  The About page's quote is the one full serif line (in ink, not amber).
- The two first-screen faces (Geist, DM Serif italic) are preloaded in `Base.astro`.

| Class | Size | Use |
|---|---|---|
| `.h1` | clamp(50px, 1.5rem + 5.6vw, 106px), 700, -.055em | Home hero; page heads scale it down (`.p-head .h1`, About, case studies) |
| `.h2` | clamp(40px, 1.5rem + 3.6vw, 82px), 700 | scope band, closer (larger) |
| `.sec-h` | clamp(28px, 1rem + 1.4vw, 40px), 700, -.04em | section headings on inner pages (same scale as the selected-work heading and case-study sections) |
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
Glass pills, 48px tall, Geist 650 16px, an 18px sprite icon. Compact contexts set their own
height: 44px in the Project details actions and on the Projects sheet. The sheet's text
actions and case-study breadcrumb links also have a minimum 44px hit height.
Every button is glass, including Email me (no amber fill). Hover and focus turn the label and
icon amber, add the warm glare sweep and a 1.02 lift; press scales to .97. Focus ring:
2px amber, 3px offset. `CTA.astro` renders the standard row (Email me, Call, Résumé, GitHub).

### Island header and contact menu (`SiteHeader.astro`)
A floating glass capsule: compact ("Tristan Dolfo · replies within a day"), expanded on hover
or focus into the nav (Projects in amber text), mini while scrolling. "check me out" opens the
glass contact menu (Email me, Copy email with a "Copied" check and live announcement, Call,
Résumé, GitHub); Escape closes and returns focus. At 600px and below the open island drops Résumé and
the pill shrinks to its diamond so both fit a 360px screen. That shrink moves the centred island
sideways under a still pointer; a leave reported at the pointer's last position is treated as
that shift, so the hover holds until the pointer next moves (and ends then if it is off the island).
On touch, the first completed tap on a compact or mini island only expands it; the next tap
can follow a nav link. An outside touch collapses it. Mouse hover and keyboard focus still expand it.
The decision comes from the recorded touch press and release, never the click's pointer fields
(iOS reports the click after a touch as a mouse); a click with no press (`detail` 0: scripted
or assistive) never uses that record. The faces are measured at `max-content`
width and the logo's link never shrinks, so every engine opens the island at full width with a
32px logo.

### Page head (`.p-head`)
Centred: `.mono.kicker`, `.h1`, `.lead`, top padding clamp(120px, 16vh, 156px) to clear the
island. Projects, Services and 404 use it; About and the case studies use a left-aligned variant.

### Panels and rows
- `.gpanel`: a glass panel's layout helper, padding clamp(22px, 2vw + 12px, 44px), radius 30
  (the About stack panel). Other panels set their own padding (Services tiers, case-study facts,
  diagram, menu).
- `.rows`: hairline list rows (`--hair` above the first and under each row, 18px padding),
  used for About's facts, stack groups and principles and the case studies' constraints and
  decisions. About's six values use the same hairlines on a `.dia` list (`.values`).
- `.dia`: bullet lists with a 7px amber diamond.
- `.pill` chips: Geist Mono 500 12.5px, mixed case, tracked .04em, ink-soft, hairline outline,
  pill radius.
- `.badge`: amber-light mono label with an amber outline ("Most owners start here").
- `.link-go`: steel-light text link with an optional arrow that shifts on hover; amber-light on hover.

### Home
Hero (blur-up words and one amber sweep; the H1 is painted in the first frame), the selected
work rail (nine glass tiles without numbers, an endless row, 5s tour with pause/play, paddles,
the Hiring panel left of the heading), the scope bento (packages panel, process rail with a steel-blue line and amber step
names), the closer.

The hero actions keep their full labels and DOM order: one row from 795px; two pairs at
600–794px; at 599px and below, Email and Call each occupy a row above the Résumé/GitHub pair.
The phone hero starts at 88px top padding so Email remains above the fold at 320×568,
360×780 and 390×844. Rail tiles narrow below 344px when needed to retain the
neighbours' slivers and edge gutters.

The selected work section sits under the hero's horizon arc: "selected work" clears the arc
at every width (lowered 74px on desktop and 180px at 760px and below, where the heading sits
at the arc's lower left end); the bottom spacing gives the same amount back, plus the line
the old tile numbers filled, so the scope band does not move. The Hiring panel may touch the arc.

The row is endless. home.js copies the nine tiles into a set before and a set after them
(copies are `aria-hidden` and their links take `tabindex="-1"`, so Tab and screen readers
meet nine tiles once while a visible copy still opens its build on click; they
are made in a windowless document so cloning starts no downloads, and a copy's capture loads
only after its original has loaded or when the copy itself comes into view). Tiles snap to the
centre: the full builds sit in the middle with equal slivers of their neighbours on both sides,
and the first build is the leftmost full tile at load. Once the row has arrived and no finger
is on it, a position outside the real set shifts by exactly one set (identical pixels).
Paddles never disable; presses during a move add up. The edge effect ("dim-led depth"): a wide
eased mask fades the row's own edges (nothing is painted over the galaxy), and a tile dims and
settles back while it crosses either edge (scroll-linked; off under reduced motion and Save-Data).
Without JavaScript the nine tiles stay a plain strip from the first one, with no paddles or tour button.

### Projects (signature): the Spotlight Inspector
A typographic index on the left, the capture as a large stage, the details on a glass sheet
over the capture (Stack and Outcome tabs, live link, case study, Project details), a 5s tour
ring, prev/next, a desktop/phone capture flip and `#slug` deep links. Without JavaScript every
build is stacked and complete. The index has no numbers: each build has a hollow amber
diamond where the moving diamond rests, and the moving one fills the hollow one for the build
on show; titles line up with the group labels.

The sheet overlays the capture from 1080px. At 1079px and below it follows the capture in
normal flow. The index stays beside the stage at 961–1079px; only this range reserves the
tallest sheet height across all nine builds and both tabs at the current stage width, using
`--ins-sheet-min-height`; measuring runs only while that range matches and again when it starts
matching. Measurement does not reveal inactive builds or load their captures.
At 960px and below the index stacks above the stage. Explicit index picks (including the
current pick), keyboard index changes and fresh or same-page `#slug` links land the stage's
`.ins-panel` below the fixed header rather than leaving the visitor at the index.

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
amber diamond; it becomes a scrolling row at 860px and below), sections with `.sec-h`-scale headings,
constraints and decisions as rows, the architecture SVG in a glass panel (nodes on `--stage`
with `--hair-strong` outlines, steel-light lines), proof with amber checks.
The scrolling menu has end padding beyond its edge fade so its last label remains readable;
keyboard focus removes the fade.

### Closer and footer
Every page but 404 ends in the closer (`Closer.astro`): an optional amber kicker, a large `.h2`
(with an accent word where the page marks one), an optional lead, Email me and Call, an
optional note; the black hole's outgoing rim sits above it. The footer
is the heading plus Résumé, GitHub and Facebook pills only.

### Project details dialog (`ProjectModal.astro`)
Native `<dialog>` on `--sheet` with a blurred backdrop: capture, mono meta, title, blurb,
summary, outcome, chips, and glass actions.
Backdrop dismissal requires the same primary pointer gesture to start and finish outside
the dialog, judged from the recorded press and release (not the click's pointer fields, which
iOS reports as a mouse; a click with no press, `detail` 0, is ignored). A selection or drag that crosses its edge, or a cancelled gesture, keeps it open.
Escape and Close dismiss it and return focus to its visible trigger.

## 6. Motion

The set is fixed (owner's saved settings): glare and amber hover on every button and clickable
panel; the play/pause morph; the Copied check; press feel; the cursor spotlight on glass panels;
blur-up headline words with one amber sweep; stars focusing in; depth tilt; the cursor lens;
the horizon crossing sweep with a softened ripple. Springs are `--spring` and `--spring-soft`
(`material.css`).

- **Reduced motion:** every effect stops; the galaxy is one still frame; the process rail is
  fully drawn; the tours start paused. One-shot load effects (scroll reveal, the headline
  sweep) read the setting at load; the tours and the galaxy follow a change made mid-visit.
  The process rail follows a change only when reduced motion was off at load (on at load, it
  stays fully drawn). Lens mounting does not read the setting: the refraction is static.
- **Save-Data:** the same, plus every transition and animation stops (`.save-data`).
- The hero is never hidden while fonts load (no intro wait).
- **Tours:** pointer and focus holds, an offscreen surface and a hidden browser tab temporarily
  hold autoplay. An open Project details dialog also holds the Inspector tour; both dialog
  state changes and the timer callback check that hold. Manual browsing pauses until Play:
  Home rail touch/swipe, a mostly sideways wheel (or Shift with a vertical wheel), scrolling
  keys and paddles; Inspector picks, paging, tabs, capture flips, action links and deep
  links. A vertical wheel with a stray sideways pixel is not browsing. Hovering an Inspector
  index name shows that build without pausing: the pointer hold keeps the tour still and it
  resumes after the pointer leaves. Programmatic rail scrolling is not manual intent. Play starts a fresh 5s interval once temporary holds clear.
  The Home tour only ever advances one build to the right; it never scrolls back to the start
  (the row is endless), while visitors can still go left by swipe, wheel, keys or paddle.

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
