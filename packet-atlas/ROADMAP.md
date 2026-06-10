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

3. **v8.0 — Branching Journey Choices** ✅
   - adds diagnostic branch previews for DNS failure, TCP blocked, TLS failure and HTTP/application error,
   - keeps the stable scenario path intact,
   - teaches that `site does not work` can fail before TCP, TLS or HTTP ever start.

4. **v8.1 — DNS Failure Branch Path** ✅
   - expands the DNS failure preview into a concrete diagnostic path,
   - teaches `DNS failure -> no target IP -> no TCP -> no TLS -> no HTTP`,
   - keeps this as a guided branch preview, not a full alternate scenario route yet.

5. **v8.2 — Presentation Focus Mode polish** ✅
   - reduces clutter for demo/teaching mode,
   - enlarges the current guided stage,
   - keeps supporting evidence below the primary story instead of competing with it.

## Not in scope

- quizzes,
- daily missions,
- progress accounts,
- backend user profiles,
- generic certification training modes,
- browser-side raw PCAP parsing,
- separate routes/pages for every single journey stage.


## v8.3 — Branch Classifier Precision ✅

- DNS-only stages expose DNS failure choices.
- TCP stages expose TCP blocked choices.
- TLS stages expose TLS failure choices.
- HTTP/app stages expose HTTP/application error choices.
- `DNS response` is not treated as `HTTP response`.


## v8.4 — Focus Mode Viewport Anchor ✅

- Focus Mode marks the current step more clearly.
- Playback controls stay reachable while reading.
- Wide screens keep the guided story centered.


## v8.5 — Branch Decision Explainer ✅

- Branches explain why they belong at that layer.
- Branches show what not to assume.
- Branches name the evidence rule before deeper debugging.


## v8.5–v8.7 — Branch Evidence Pack ✅

- v8.5: branch decision explanations.
- v8.6: DNS failure synthetic fixture.
- v8.7: DNS failure capture plan.


## v8.8–v9.0 — DNS Branch Evidence Integration ✅

- v8.8: DNS branch evidence checklist in the UI.
- v8.9: checklist aligned with the synthetic fixture contract.
- v9.0: DNS branch readiness report for future real capture work.


## v9.1 — Guided Journey Reset ✅

- Focus Mode becomes a manual-first guided story.
- Auto-play becomes slower and optional.
- Supporting panels stop competing with the current step.


## v9.2 — Guided Step Coach ✅

- Adds a Before / Now / Next reading guide.
- Gives each stage a simple action and proof question.
- Keeps focus on understanding one step before pressing Next.


## v9.3 — Guided Read Mode Cleanup ✅

- Focus Mode stops repeating the same reading content twice.
- The Guided Step Coach becomes the main reading path.
- The coach footer gets a real Next action.


## v9.4–v9.5 — Coach-Only Guided Reading ✅

- v9.4: Focus Mode keeps the coach as the main reading path.
- v9.5: Final recap appears only at the end of the journey.
- No dashboard-like progress widgets are added.


## v9.6–v9.7 — Guided Narrator Pack ✅

- v9.6: narrator line per journey stage.
- v9.7: pause prompt and handoff to the next step.
- No dashboards, charts or extra metrics.


## v9.8–v10.2 — Guided Story Layer Pack ✅

- v9.8: stage-level story script.
- v9.9: mental model per step.
- v10.0: evidence question per step.
- v10.1: do-not-jump guard per step.
- v10.2: vocabulary helper per step.


## v10.3–v10.7 — Guided Authoring Pack ✅

- v10.3: full guided script model.
- v10.4: Markdown renderer.
- v10.5: story quality rules.
- v10.6: guided story reports.
- v10.7: authoring contract.


## v10.8–v11.2 — Guided Scenario Authoring Pack ✅

- v10.8: guided scenario pack model.
- v10.9: failure story catalog.
- v11.0: evidence contracts.
- v11.1: diagnostic guardrails.
- v11.2: scenario quality reports.
