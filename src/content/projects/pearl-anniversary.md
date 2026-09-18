---
title: Pearl Anniversary Celebration
slug: pearl-anniversary
kind: personal
displayOrder: 3
clientType: Privacy-safe anniversary keepsake (public demo)
stack: [HTML, CSS, JavaScript, Netlify Blobs]
year: 2026
summary: >-
  A shared family keepsake with editable letters, a gallery, and cinematic
  playback. In the private production app, I used authenticated access and
  private Blob storage, with version checks that reject stale edits or deletions
  instead of silently replacing someone else's changes. Tests exercise these
  conflict paths. The linked public demo is a separate Netlify build with
  fictional content, isolated storage, and a scheduled reset; it demonstrates
  the experience without exposing the family's private album.
blurb: Pearl-anniversary keepsake album with story, gallery, and letters.
outcome: Conflict-aware editing in the private build, with a separate public showcase.
liveUrl: https://publicdemo-anniv-celebration.netlify.app
liveLabel: Visit interactive demo version
demoNote: Demo only — fictional couple; guest edits may reset daily.
repoUrl: https://github.com/3StanTech/PublicDemo-Anniv-Celebration
coverAlt: Couple embracing outdoors in warm golden light at sunset
cover: ../../assets/pearl-anniversary-hero.webp
---
