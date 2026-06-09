# Packet Atlas Roadmap

## Current milestone

**v7.7 — Release Checkpoint / Project Status**

This milestone does not add more UI surface area.

It makes the project legible again:

- sync the docs with the real repo state,
- publish a trustworthy project status report,
- publish a trustworthy release readiness snapshot,
- clarify the next product milestone.

## Immediate next steps

1. **v7.8 — Animated Journey Mode promotion**
   - promote the existing cinematic trace from secondary playback to a first-class guided mode,
   - keep the current workspace system intact,
   - move guided-flow state to the atlas store,
   - make the current step visually calmer and more central.

2. **v7.9 — Stage narrative metadata** ✅
   - adds a reusable narrative model for `whatHappensNow`, `whyItMatters`, `userVisibleOutcome`, `networkEvidence`, `diagnosticHint` and `nextChoices`,
   - keeps Animated Journey Mode on top of the same scenario/stage data,
   - prepares the project for branching choices without creating a second parallel atlas.

3. **v8.0 — Branching Journey Choices**
   - add choices for happy path and failure branches,
   - start with a synthetic DNS failure branch,
   - teach that `site does not work` can fail before TCP, TLS or HTTP ever start.

4. **v8.1 — Presentation Mode polish**
   - reduce clutter for demo/teaching mode,
   - enlarge the current stage,
   - keep supporting evidence one click away instead of everywhere at once.

## Not in scope

- quizzes,
- daily missions,
- progress accounts,
- backend user profiles,
- generic certification training modes,
- browser-side raw PCAP parsing,
- separate routes/pages for every single journey stage.
