# CCC Task Board - AI-Novel

## User Stories
- As a creator, I want reliable AI-assisted chapter generation so that I can publish content faster without losing quality.
- As a reader, I want secure paid chapter unlocks so that my purchases consistently grant access.
- As a listener, I want audio playback from generated voice content so that I can consume chapters hands-free.
- As a product owner, I want test visibility and risk controls so that releases are predictable and feasible.

## Agile Task Board
| ID | Sprint | Story Link | Task | Type | Owner | Status | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| T-01 | Sprint 1 | Reader unlock reliability | Implement production payment verification boundary for chapter unlocks | Backend | Dev | Todo | Unlock requires verified payment signal and idempotent write |
| T-02 | Sprint 1 | Reader unlock reliability | Refactor unlock endpoint to support verified source values beyond `stub` | Backend | Dev | Todo | `chapter_unlocks.source` supports production path usage without breaking reads |
| T-03 | Sprint 1 | Reader unlock reliability | Add integration tests for `locked/preview/unlocked/owner` access transitions | QA/Backend | Dev | Todo | Tests validate all chapter access states and expected status codes |
| T-04 | Sprint 1 | Product owner visibility | Add unlock-flow observability events and error taxonomy | Backend/Ops | Dev | Todo | Errors are classified and traceable in logs for unlock attempts |
| T-05 | Sprint 2 | Creator content quality | Replace placeholder text generation with provider-backed server implementation | AI/Backend | Dev | Todo | Generation endpoint returns real model output with retries/timeouts |
| T-06 | Sprint 2 | Creator content quality | Add prompt template versioning and output quality checks | AI | Dev | Todo | Quality rubric pass rate reaches agreed threshold on sample set |
| T-07 | Sprint 2 | Listener experience | Replace placeholder TTS functions with provider-backed preview/synthesis | AI/Backend | Dev | Todo | Voice preview and synthesis return playable media in staging |
| T-08 | Sprint 2 | Listener experience | Add caching/queue strategy for expensive or repeated synthesis jobs | Backend | Dev | Todo | Repeat requests avoid redundant synthesis where feasible |
| T-09 | Sprint 2 | Product owner cost control | Add usage accounting for generation tokens and TTS minutes | Backend/Ops | Dev | Todo | Dashboard/report can show monthly usage per capability |
| T-10 | Sprint 3 | Reliability baseline | Create automated smoke tests for auth, story CRUD, catalog, and unlock flows | QA | Dev | Done | `npm run test:smoke` validates auth-session endpoint, catalog/series/chapter access, unlock guard, and authenticated CRUD with `SMOKE_AUTH_COOKIE` |
| T-11 | Sprint 3 | User feedback loop | Execute structured test sessions and capture feedback categories | Product/QA | Dev + Peer | Done | Feedback log expanded in deliverable report with categorized severity and follow-up actions |
| T-12 | Sprint 3 | Iterative improvement | Implement top-priority UX fixes from feedback cycle | Frontend | Dev | Done | Added lock-value messaging, auth-expiry unlock feedback, and explicit draft/published story status labels |
| T-13 | Sprint 3 | Release readiness | Final regression pass and risk checklist sign-off | QA/Ops | Dev + Peer | Done | Sprint 3 release checklist and smoke run instructions added with rollback/mitigation confirmation points |

## Delivery Milestones
- M1 (End Sprint 1): chapter unlock production path + access-state tests.
- M2 (End Sprint 2): provider-backed LLM/TTS services active in staging.
- M3 (End Sprint 3): structured feedback cycle complete and key improvements shipped.

## Definition Of Done (Per Sprint)
- All tasks marked complete with evidence links (PR, test output, or demo recording).
- No unresolved high-severity defects in sprint scope.
- Risk register updated with current status and mitigations.
- Sprint review notes captured and next-sprint backlog reprioritized.
