# Atelier — Quick Q&A Brief

**Read time:** ~10 minutes  
**Use before:** post-video questions and live demo

---

## One-sentence pitch

Atelier is a serialized audiobook platform where creators use an AI-assisted studio to write and publish chapters, and readers discover series, unlock paid chapters, and listen with text-to-speech — all in one Next.js web app.

---

## What it is

- **Product:** Serialized fiction + chapter-by-chapter audio (Pocket-FM-style)
- **Brand in deck/video:** Atelier (repo may still say AI-Novel)
- **Status:** Working MVP — core flows end-to-end; production hardening still in progress
## Stakeholders (general)

| Group | Role |
|-------|------|
| **Creators / studio operators** | Private AI studio — `/studio`, `/library` |
| **Readers & listeners** | Public catalog — preview, unlock, chapter audio |

Full detail: `docs/STAKEHOLDERS.md`

---

## Tech stack (memorize this)

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js API route handlers (same repo) |
| Database | **PostgreSQL** + **Drizzle ORM** (not Prisma) |
| Auth | Auth.js / NextAuth v5 + Drizzle adapter |
| AI text | OpenAI (server-side, `OPENAI_API_KEY`) |
| Audio | ElevenLabs TTS (server-side, `ELEVENLABS_API_KEY`) |
| Payments | **Stub checkout today** → Stripe planned |
| Mobile | **Not built yet** — API-first for future iOS/Android |
| Tests | Smoke suite: `pnpm test:smoke` |

---

## Key routes

| Route | Who | What |
|-------|-----|------|
| `/` | Reader | Public catalog — discover series |
| `/studio` | Creator | AI chat + manuscript agents |
| `/library` | Creator | Manage published content |
| `/store` | Reader | Chapter unlock flow |
| Chapter player | Listener | Read + listen (ElevenLabs) |

---

## Problem & solution

**Problem statement:** Independent creators who publish serialized audio fiction cannot move from draft manuscript to monetized, listenable chapters in one workflow. Writing, narration, catalog hosting, and per-chapter sales live in separate tools—not built for serial unlock models—so production is slow and expensive and readers get a fragmented preview → unlock → continue experience.

**Symptoms:** Creators juggle writing apps, audio tools, and storefronts; readers bounce between surfaces; indie studios cannot sustain Pocket-FM-style serial cadence without a production team.

**Solution:** Atelier — one platform: write → refine → narrate → publish → monetize, with a private creator studio (`/studio`, `/library`) and public reader catalog on the same backend.

Full doc: `docs/PROBLEM_STATEMENT.md`

**Objectives met (MVP):**

- End-to-end creator → reader pipeline
- LLM-assisted authoring + TTS narration
- Validation via feedback + smoke tests

---

## What works today

- Public catalog + creator studio
- OpenAI chapter generation
- ElevenLabs audio playback
- Library, comments, usage tracking
- Sprint 3 UX polish + smoke tests

---

## Limitations (say these honestly)

1. **Payments:** Chapter unlock uses a **stub** flow — Stripe is the next production milestone
2. **CI:** Not fully automated yet — smoke tests exist; broader API regression coverage planned
3. **TTS cost:** Usage is tier-capped to control ElevenLabs spend
4. **Mobile:** Web only today; native apps are planned on the same API

---

## Architecture (30-second version)

```
Creator / Reader → Next.js (UI + API) → PostgreSQL
                              ↓
                    OpenAI · ElevenLabs
```

- **Why Next.js?** One codebase for UI + API; fits a small agile team
- **Why PostgreSQL + Drizzle?** Relational data: stories, chapters, unlocks, comments
- **Why API-first?** Mobile clients can reuse the same endpoints later
- **Security:** Provider API keys never touch the browser; Auth.js manages sessions

---

## Effectiveness & evidence

**How we tested:** Creator and reader walkthroughs with structured feedback; automated smoke suite (`pnpm test:smoke`)

| Objective | Result | Evidence |
|-----------|--------|----------|
| End-to-end creator → reader pipeline | Met (MVP) | Catalog, studio, library, player |
| LLM authoring + TTS narration | Met (MVP) | OpenAI + ElevenLabs server routes |
| Feedback + automated validation | Partial | Walkthroughs + smoke tests |

**Feedback → fix:**

| Feedback | Fix |
|----------|-----|
| Locked chapters unclear | Lock reason + value copy |
| Session expiry during unlock | Re-auth prompt + clear errors |
| Publish state confusing | Published vs Draft badges |

Full write-up: `docs/SOLUTION_DOCUMENTATION.md`

---

## Security & legal (if asked)

- OpenAI and ElevenLabs keys stored **server-side only**
- Auth.js JWT sessions; bcrypt for passwords
- Privacy/data inventory: `docs/APP_PRIVACY_DATA_INVENTORY.md`
- Account deletion supported from `/account`

---

## Agile process

- **2-week sprints:** monetization → AI/TTS → reliability & UX
- **Approach:** Ship working UX early; harden risky paths in parallel
- **Artifacts:** CCC deliverable report, task board, smoke tests

---

## What's next

1. **Stripe** — real chapter unlocks
2. **CI** — broader automated API tests
3. **Mobile** — native clients on same API

---

## Demo commands (if they ask to see it)

```bash
pnpm db:seed && pnpm dev
```

- Catalog: http://localhost:3000
- Studio: http://localhost:3000/studio (requires admin sign-in / `ADMIN_EMAIL`)

---

## Sources & further reading

| Doc | Purpose |
|-----|---------|
| `docs/SOLUTION_DOCUMENTATION.md` | **Level 12 solution brief** — what, how, evidence, limitations |
| `docs/CCC_DELIVERABLE_REPORT.md` | Full problem, plan, risks, testing |
| `docs/CHANGELOG.md` | Documentation and deliverable version history |
| `docs/CCC_TASK_BOARD.md` | Sprint tasks and what shipped |
| `docs/APP_PRIVACY_DATA_INVENTORY.md` | Privacy & data handling |
| `docs/CLIENT_PRICING_AND_TCO.md` | Operating cost scenarios |
| `README.md` | Setup and env vars |

---

## Common grill questions

**Prisma?**  
No — **Drizzle ORM** with PostgreSQL.

**Mobile app?**  
Not yet. Web now; architecture is API-first for iOS/Android later.

**Production-ready?**  
Core product works end-to-end. Payments and CI hardening are the main gaps.

**Why not separate backend?**  
Speed and team size. Next.js route handlers are enough for MVP; same APIs can serve mobile later.

**How do you control AI cost?**  
Server-side calls, usage tracking, ElevenLabs tier caps, model config via env.

**Biggest risk?**  
Stub payments and limited automated test coverage until Stripe + CI land.

---

## Don't oversell

- ❌ "Production payments are live" → ✅ "Stub checkout; Stripe is next"
- ❌ "We have a mobile app" → ✅ "Web MVP; mobile planned"
- ❌ "Full test coverage" → ✅ "Smoke tests on critical paths; CI expanding"
