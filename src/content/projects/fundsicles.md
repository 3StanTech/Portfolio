---
title: Fundsicles — Expense Tracker
slug: fundsicles
kind: personal
group: systems
displayOrder: 3
clientType: Personal finance tracker (public demo)
stack: [React, TypeScript, Vite, IndexedDB]
year: 2026
summary: >-
  A personal-finance app built to distinguish actual spending from money moved
  between accounts. I kept amounts exact to the centavo, excluded
  transfers and pending entries from cash-flow totals, and used database
  aggregates for the production dashboard rather than its limited transaction
  list. Tests cover money parsing and financial calculations. Production uses
  Supabase with user-scoped access policies; the public demo uses fictional data
  in browser storage so visitors can try transactions and reset their changes
  without accessing a client's finances.
blurb: Expense tracker with sample Philippine-peso data.
outcome: Spending totals separate transfers from expenses; demo data stays in the browser.
liveUrl: https://publicdemo-expense-tracker.netlify.app
liveLabel: Visit interactive demo version
demoNote: Demo only — sample data stays in your browser. PIN 123456.
repoUrl: https://github.com/3StanTech/PublicDemo-Expense-Tracker
coverAlt: Fundsicles home dashboard with sample balances, budget progress, and recent transactions
cover: ../../assets/fundsicles-home.webp
---
