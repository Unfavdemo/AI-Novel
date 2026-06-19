# Project: No Name

> Placeholder brand name until the client finalizes the app title.

## Problem statement

Independent creators who publish serialized audio fiction cannot move from draft manuscript to monetized, listenable chapters in one workflow. They rely on separate tools for writing, narration, catalog hosting, and per-chapter sales—none built for serial unlock models—so production stays slow and expensive and readers get a fragmented experience.

Full write-up: [PROBLEM_STATEMENT.md](./PROBLEM_STATEMENT.md)

## Core overview

**Atelier** (working name; repo: AI-Novel) — a private production studio for AI-assisted serial fiction and chapter-by-chapter audio. **Creators / studio operators** generate and refine manuscripts and publish to a catalog for **readers and listeners** (Pocket-FM-style chapter unlocks). See `docs/STAKEHOLDERS.md`.

## Status

**In Progress**

## Timeline

**1 Month+** (estimated)

## Target platforms

| Phase | Platform | Approach |
|-------|----------|----------|
| Current | Web | Next.js responsive app (`/studio` admin workspace, `/` catalog) |
| Planned | iOS, Android | API-first backend; native shell (Expo/React Native or Capacitor) consuming the same REST routes |

Architecture today is **cross-platform-ready** at the API layer; native store builds are a follow-on milestone.

## Key surfaces

- **`/`** — Reader discover catalog (production home)
- **`/studio`** — Creator Studio (dual-column chat + manuscript agents)
- **`/library`** — Author content management
- **`/`** — Reader catalog and chapter playback

## Environment

See [README.md](../README.md) and [.env.example](../.env.example) for `OPENAI_*`, `ELEVENLABS_*`, and database configuration.

## Related docs

- [CLIENT_PRICING_AND_TCO.md](./CLIENT_PRICING_AND_TCO.md) — operating cost scenarios
- [INTERNAL_PROJECT_LEDGER.md](./INTERNAL_PROJECT_LEDGER.md) — contract & infrastructure ledger (internal)
- [PROBLEM_STATEMENT.md](./PROBLEM_STATEMENT.md) — product problem statement
- [SOLUTION_DOCUMENTATION.md](./SOLUTION_DOCUMENTATION.md) — Level 12 solution brief (CCC communicating & documenting)
- [CHANGELOG.md](./CHANGELOG.md) — documentation and deliverable version history
- [STAKEHOLDERS.md](./STAKEHOLDERS.md) — stakeholder roles (creators, readers)
- [CCC_DELIVERABLE_REPORT.md](./CCC_DELIVERABLE_REPORT.md) — CCC coursework deliverable
- [CCC_TASK_BOARD.md](./CCC_TASK_BOARD.md) — sprint task board
