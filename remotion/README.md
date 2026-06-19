# Atelier presentation video (Remotion)

Animated presentation video for course submission. Visuals match `docs/presentation.md`; voiceover uses a **presenter script** (conversational, not verbatim slide reading).

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) (or npm)
- `ELEVENLABS_API_KEY` in repo-root `.env` (for voiceover)

## Quick start

```bash
cd remotion
pnpm install
pnpm studio
```

Opens Remotion Studio in the browser — scrub the timeline, preview transitions, tweak timing.

## ElevenLabs voiceover (presenter style)

The narrator **presents** the app and slides in natural speech — pointing at what's on screen without reading every bullet aloud.

**Edit the script:** `remotion/src/presenter-script.ts`  
**Regenerate audio:**

```bash
pnpm video:voiceover
```

This will:

1. Read conversational copy from `src/presenter-script.ts`
2. Call ElevenLabs for each slide
3. Save clips to `public/voiceover/*.mp3`
4. Update `src/voiceover-manifest.json` so slide length matches audio

Natural-sounding defaults: **Chris** voice, lower stability (0.38), slightly slower speed (0.93). Override in `.env`:

```env
ELEVENLABS_PRESENTATION_VOICE_ID="iP95p4xoKVk53GoZ742B"
ELEVENLABS_PRESENTATION_STABILITY="0.38"
ELEVENLABS_PRESENTATION_SIMILARITY="0.78"
ELEVENLABS_PRESENTATION_SPEED="0.93"
```

## Render MP4 for submission

```bash
pnpm video:render
```

Output: `docs/atelier-presentation.mp4`

Recommended order:

```bash
pnpm video:voiceover   # after editing presenter-script.ts
pnpm video:studio      # preview
pnpm video:render      # export
```

## Structure

| File | Purpose |
|------|---------|
| `src/PresentationVideo.tsx` | Main composition — slides + audio |
| `src/presenter-script.ts` | **Presenter narration** (edit this) |
| `src/narration.ts` | Slide id → audio file + script wiring |
| `src/voiceover-manifest.json` | Audio durations (generated) |
| `src/slideTimeline.ts` | Slide order, timing, audio paths |
| `src/slideTransitions.ts` | Per-slide transitions (slide, wipe, fade) |
| `src/slides/*.tsx` | Individual animated slides |
| `scripts/generate-voiceover.ts` | ElevenLabs batch generator |

## Transitions

Slide changes use `@remotion/transitions` (configured in `src/slideTransitions.ts`):

| After slide | Effect |
|-------------|--------|
| Title | Fade into Problem |
| Problem, Audience, Architecture, Feedback | Slide in from right |
| Demo | Wipe up into Architecture |
| Status | Fade into Closing |

Preview in Studio with `pnpm studio` — scrub across slide boundaries to check timing.

## Adjust timing

- **With voiceover:** re-run `pnpm video:voiceover` after editing `presenter-script.ts`
- **Without voiceover:** edit `SLIDE_DURATIONS` in `src/theme.ts`
