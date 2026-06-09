# Packet Atlas v7.8 — Animated Journey Mode Promotion

v7.8 promotes the existing cinematic playback idea into the main Journey reading path.

This is not a second atlas.

It reuses existing building blocks:

- `JourneyControls` for stage movement,
- `StageDeepDiveCards` for stage explanation,
- `CinematicTraceMode` for playback,
- `atlasStore` for shared state.

## What changed

- Animated Journey Mode now appears in the Journey workspace.
- The old secondary Capture playback cluster is removed.
- Playback state moves into the central atlas store:
  - `animatedJourneyPlaying`,
  - `animatedJourneySpeed`,
  - `visitedStageIds`.
- The active stage now shows:
  - what happens now,
  - why it matters,
  - what the user sees,
  - what network evidence looks like,
  - diagnostic trap,
  - next choices.

## Product rule

Do not build a separate course or quiz flow. This mode is a calmer narrative layer over the same atlas.
