---
title: Order Management System + CRM Dashboard
slug: cafe-dashboard
kind: commercial
group: systems
displayOrder: 2
clientType: Matcha cafe, Metro Manila
stack: [React, TypeScript, Supabase, Netlify, Firebase]
year: 2026
summary: >-
  A mobile-first order and customer dashboard for a matcha café. To keep
  customized orders consistent, I centralized pricing in a catalog-based engine
  that calculates totals exactly to the centavo and ignores totals supplied by imports.
  Validation runs before an imported order is saved; tests cover price
  manipulation, modifier rules, and persistence. The public demo runs on
  Firebase with sample data: each visitor's changes stay under their own
  anonymous ID, and a Cloud Function re-checks every saved order total.
blurb: Order and customer dashboard for a matcha cafe.
outcome: Consistent order totals with a separate, inspectable demo.
liveUrl: https://cafe-oms-demo.web.app/
liveLabel: Visit interactive demo version
demoNote: Demo only. Sample data; the PIN is shown on the lock screen.
repoUrl: https://github.com/3StanTech/PublicDemo-Order-CRM-Dashboard
coverAlt: "Order dashboard demo on a phone: the Today board, with each order marked Server-verified"
cover: ../../assets/cafe-oms-demo.png
caseStudy:
  lede: >-
    A phone-first order and customer dashboard for a paying matcha café,
    where every total comes from one pricing engine, down to the centavo.
  facts:
    - { label: Role, value: Solo full-stack developer }
    - { label: Client, value: A paying matcha café }
    - { label: Built, value: Jul–Sep 2026 }
    - { label: Stack, value: "React, TypeScript, Supabase, Netlify. Demo: Firebase" }
  problem: >-
    Orders arrived as chat messages, each cup with its own strength, powder
    and sweetness, plus thermal bags, and every total was worked out by hand.
    One missed upgrade meant a wrong bill. The café also needed a public demo that shows
    the real workflow without touching a single real customer.
  constraints:
    - Run one-handed on a phone
    - Real customer data stays in production
    - No hosting bill for the public demo
    - The demo keeps working if the server check pauses
  diagram: cafe-dashboard
  diagramCaption: >-
    Sample orders are built in the browser. Only a visitor's own changes are
    saved, and the server check writes its answer beside the order, never over it.
  decisions:
    - title: One pricing engine, in centavos
      body: >-
        Every total comes from one catalog-based engine that counts in whole
        centavos, so an upgraded cup costs the same on every screen.
    - title: Imported totals are never trusted
      body: >-
        Imported or pasted orders are re-priced before they are saved. A total
        that arrives with the import is ignored, not corrected.
    - title: Sample data on the device, changes in the cloud
      body: >-
        The demo builds its sample orders in the browser. Firestore holds only
        what a visitor creates, edits or deletes, under an anonymous ID only
        they can read, so untouched sample records are never written to the server.
    - title: A server check that adds trust, not risk
      body: >-
        A Cloud Function re-prices each saved order with the same engine and
        writes a separate verification record. The browser still prices
        everything itself, so the demo works with the Function switched off.
    - title: Guardrails on a free trial
      body: >-
        The Function runs one instance with tight memory and time limits under
        a spend cap and budget alert. App Check rejects requests without a
        token, and the rules cap how fast and how much each visitor can write.
  proof:
    - lead: Tampering is caught.
      body: An order whose stored total was edited by hand shows "Not verified".
    - lead: Works without the server.
      body: With the Function deleted, the demo still creates and lists orders.
    - lead: Rules tested in CI.
      body: >-
        An emulator suite checks the Firestore rules on every pull request,
        alongside lint, unit tests, the build and an offline browser smoke test.
    - lead: Previewed before merge.
      body: Every pull request gets its own preview link, checked before it ships.
    - lead: Quick on a phone.
      body: About 4 seconds to first view on a phone over Fast 3G, and unsaved changes survive a reload.
  next: >-
    A public ordering link for customers, priced by the same engine before the
    owner accepts each order.
---
