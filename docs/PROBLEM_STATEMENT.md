# Atelier — Problem Statement

## Statement

**Independent creators who publish serialized audio fiction cannot move from draft manuscript to monetized, listenable chapters in a single workflow.** Writing, narration, catalog hosting, and per-chapter sales live in separate tools that were not designed for serial unlock models. Production stays slow and expensive; readers get a disjointed preview → unlock → continue experience. Indie studios cannot compete on pace or retention with Pocket-FM-style platforms without stitching together a full production stack by hand.

---

## Context

| Dimension | Detail |
|-----------|--------|
| **Who** | Creators / studio operators (private production workspace) and readers / listeners (public catalog) — see `docs/STAKEHOLDERS.md` |
| **Where** | Web-first today (`/studio`, `/library` for creators; `/` catalog and chapter player for readers); native mobile planned |
| **When** | Now — serialized audio fiction is growing, AI-assisted authoring and TTS are viable, but no integrated indie-grade platform ties the full pipeline together |

---

## What is broken today

1. **Fragmented toolchain** — Creators bounce between a writing app, an audio tool, and a storefront that does not understand serial chapters or unlock economics.
2. **High production cost** — Professional narration and manual revision make each chapter expensive to ship; small teams cannot sustain weekly serial cadence.
3. **Reader friction** — Discovery, free preview, paid unlock, and in-flow listening are often split across sites or apps, hurting conversion and series completion.
4. **No creator-owned serial stack** — Existing audiobook platforms optimize for finished titles or studio catalogs, not an indie operator running one private studio end-to-end.

---

## Why it matters

| Stakeholder | Impact if unsolved |
|-------------|-------------------|
| **Creators** | Longer time-to-revenue, higher burn, abandoned series, inability to test serial economics without a production team |
| **Readers** | Inconsistent quality, broken continuity between text and audio, poor unlock UX, lower willingness to pay per chapter |
| **Business** | Revenue leaks to platforms that own the funnel; creator margin erodes on tool subscriptions and manual labor |

---

## Desired outcome

A **single platform** where a creator can:

1. Draft and refine chapters with AI-assisted authoring in a private studio
2. Generate chapter narration (TTS) without a separate audio pipeline
3. Publish to a public catalog with free previews and paid unlocks
4. Let readers read and listen in one flow, chapter by chapter

**Atelier** is the MVP toward that outcome: one Next.js application with a creator studio, reader catalog, and shared backend—not a marketplace of many authors, but a production-and-distribution stack for one operator or small studio.

---

## Related docs

- `docs/PROJECT.md` — scope and status
- `docs/CCC_DELIVERABLE_REPORT.md` — deliverable analysis (includes implementation gaps)
- `docs/presentation.md` — deck slide 01 · Problem
