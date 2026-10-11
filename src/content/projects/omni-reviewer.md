---
title: Omni-Reviewer
slug: omni-reviewer
kind: commercial
group: systems
displayOrder: 1
clientType: Study app for a paying student client
stack: [Next.js, React, TypeScript, Postgres, Drizzle, Auth.js, Vercel Blob, OpenRouter]
year: 2026
summary: >-
  A study app for a paying student client that turns lecture slides and
  transcripts into a study guide, a summary, practice quizzes and flashcards
  that return on a schedule. To keep the notes trustworthy, every claim cites
  its source slide and a checker flags anything the slides don't support.
  Generation runs on free AI models in resumable steps, so a refresh never
  loses progress, and each student's files stay private to their account.
  The public demo uses sample packs, so visitors can study without an account
  or any of the client's material.
blurb: Study packs with cited notes, quizzes and flashcards.
outcome: Study notes that point back to the slide behind every fact.
repoUrl: https://github.com/3StanTech/Omni-Reviewer
liveUrl: https://omni-reviewer-demo.web.app/
liveLabel: Visit interactive demo version
demoNote: Demo only. Sample OpenStax Microbiology packs; no sign-in needed.
coverAlt: "Omni-Reviewer demo: a flashcard from the sample Microbiology pack, citing its source page"
cover: ../../assets/omni-reviewer-demo.png
caseStudy:
  lede: >-
    Turns a student's lecture files into study packs she can trust: a cited
    study guide, a summary, a quiz and flashcards on a schedule.
  facts:
    - { label: Role, value: Solo full-stack developer }
    - { label: Client, value: A paying student }
    - { label: Built, value: Aug–Oct 2026 }
    - { label: Stack, value: "Next.js 16, React 19, TypeScript, Auth.js, Drizzle, Neon Postgres, Vercel Blob" }
  problem: >-
    Long lecture transcripts and scanned slides, an exam date, and free AI
    models capped at 50 requests a day. Study notes that invent facts are
    worse than none.
  constraints:
    - Free models only
    - Private course files
    - Invite-only accounts
    - Works on a phone, late at night
  diagram: omni-reviewer
  diagramCaption: Nothing calls a model until the student presses Generate or Redo.
  decisions:
    - title: Generate once, keep it
      body: >-
        Study modes are saved. Opening a page or switching modes never calls a
        model, so the free daily requests go to real work.
    - title: Cite everything
      body: >-
        Every claim cites its slide page. A verifier and a term check tag
        anything the slides don't support, instead of letting it pass as fact.
    - title: Jobs that survive a refresh
      body: >-
        Generation runs one claimed step at a time with leases and revisions,
        so a refresh resumes where it stopped and a second tab can't mix two runs.
    - title: Private by default
      body: >-
        Every row belongs to one user. Another user's ID returns "not found"
        without revealing that it exists. Files stay in private storage and
        stream only to their owner.
  proof:
    - lead: Measured, not assumed.
      body: On one lecture, unsourced claims fell from 10.4% to 2.7% after the prompt and verifier changes.
    - lead: Tested against a real database.
      body: Integration suites run on live Postgres in a throwaway database branch, and CI runs on every push.
    - lead: Migrations rehearsed.
      body: Every schema change runs on a disposable branch first, with a snapshot before production.
    - lead: Checked like a user.
      body: Phone and desktop walkthroughs after every release.
  next: >-
    Streaming long study guides so the first section shows while the rest
    loads.
  demoNote: Sample packs, no sign-in. Your progress stays with your visit.
---
