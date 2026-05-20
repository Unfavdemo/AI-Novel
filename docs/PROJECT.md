# Project: No Name

> Placeholder brand name until the client finalizes the app title.

## Core overview

**Audiobook application** — a private production studio for AI-assisted serial fiction and chapter-by-chapter audio. The creator generates and refines manuscripts, casts multi-regional narration, and publishes a listener catalog (Pocket-FM-style chapter unlocks).

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
- [CCC_DELIVERABLE_REPORT.md](./CCC_DELIVERABLE_REPORT.md) — CCC coursework deliverable
- [CCC_TASK_BOARD.md](./CCC_TASK_BOARD.md) — sprint task board
