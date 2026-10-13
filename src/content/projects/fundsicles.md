---
title: Fundsicles — Expense Tracker
slug: fundsicles
kind: personal
group: systems
displayOrder: 3
clientType: Personal finance tracker (public demo)
stack: [React, TypeScript, Vite, Firebase, Firestore]
year: 2026
summary: >-
  A personal-finance app built to distinguish actual spending from money moved
  between accounts. I kept amounts exact to the centavo, excluded
  transfers and pending entries from cash-flow totals, and used database
  aggregates for the production dashboard rather than its limited transaction
  list. Production uses Supabase with user-scoped access policies. The public
  demo runs on Firebase with fictional sample data: each visitor's edits are
  saved under their own anonymous ID, survive a reload, and reset from Settings.
blurb: Expense tracker with sample Philippine-peso data.
outcome: Spending totals separate transfers from expenses, exact to the centavo.
liveUrl: https://fundsicles-demo.web.app
liveLabel: Visit interactive demo version
demoNote: Demo only — sample data; your changes save to a private demo space. PIN 123456.
repoUrl: https://github.com/3StanTech/PublicDemo-Expense-Tracker
coverAlt: "Fundsicles demo on a phone: the Home screen as of Aug 31, 2026, with net worth, the month's income and expenses, budget used, debt total and a six-month income vs expenses chart"
cover: ../../assets/fundsicles-demo.png
caseStudy:
  lede: >-
    A phone-first money tracker that keeps real spending apart from money
    moved between your own accounts, with every amount exact to the centavo.
  facts:
    - { label: Role, value: Solo full-stack developer }
    - { label: Type, value: Personal project }
    - { label: Built, value: Aug–Oct 2026 }
    - { label: Stack, value: "React, TypeScript, Vite, Supabase. Demo: Firebase" }
  problem: >-
    Most budget apps count a transfer from savings to a wallet as spending,
    so the month looks worse than it was. Amounts typed as decimals drift by
    a centavo here and there, and the totals stop matching the bank. I wanted
    totals I could trust, plus a public demo that anyone can try without
    seeing anyone's real finances.
  constraints:
    - Run one-handed on a phone
    - Real finances stay in production
    - No hosting bill for the public demo
    - Visitors' edits survive a reload, even offline
  diagram: fundsicles
  diagramCaption: >-
    The sample data is built in the browser. Only a visitor's own edits are
    saved, as small change records the rules check and cap, and a visit that
    changes nothing writes nothing.
  decisions:
    - title: Whole centavos, never decimals
      body: >-
        Every amount is stored and added as a whole number of centavos, and
        the rules refuse an amount that is not one. A ₱123.45 expense raises
        the month's spending by exactly 12,345 centavos.
    - title: Transfers are not spending
      body: >-
        Money moved between your own accounts and entries still pending are
        left out of income and expenses, so a ₱500 transfer leaves the month's
        cash flow unchanged.
    - title: Sample data on the device, edits in the cloud
      body: >-
        The demo builds its sample household in the browser, dated 31 Aug 2026
        so the sample months always show. Each visitor gets an anonymous ID,
        and Firestore holds only their changes, laid over the sample data.
    - title: One offline layer, not two
      body: >-
        Firestore's own local cache is the only offline store. An edit made
        with no connection survives a reload and is sent once when the
        connection returns.
    - title: Guardrails on a free plan
      body: >-
        The rules let each visitor reach only their own space, check every
        record's shape and size, and cap how much one visitor can write. App
        Check refuses requests without a token. Reset in Settings clears a
        visitor's saved changes and restores the sample data.
    - title: Production does it differently
      body: >-
        The production app uses Supabase, with access policies scoped to each
        signed-in user and database totals behind the dashboard. The demo
        shares its screens and money rules, but none of its data.
  proof:
    - lead: Exact to the centavo.
      body: On the live demo, a ₱123.45 expense moved the month's expenses by exactly 12,345 centavos.
    - lead: Transfers stay out.
      body: A ₱500 transfer left the month's income and expenses unchanged.
    - lead: Offline edits sync once.
      body: An edit made offline survived a reload and reached the server as exactly one record.
    - lead: Locked to each visitor.
      body: A request without an App Check token is refused, and no visitor can read another's space.
    - lead: Rules tested in CI.
      body: >-
        An emulator suite checks the Firestore rules on every pull request, and
        the browser tests run against the Auth and Firestore emulators.
  demoNote: Demo only — sample data; your changes save to a private demo space. PIN 123456 (a screen lock, not security).
---
