# Changelog

## v13.8 — Play Mode Layout Repair

- fixed Play Mode hero layout so the current stage title uses full width,
- hid old progress-card/aside layout in Play Mode,
- reduced the large empty hero area,
- kept Play Mode focused on one current stage.

## v13.7 — Full Stage Play Mode Pack

- reframed Focus Mode as Play Mode,
- made the current stage the dominant full-screen anchor,
- hid scenario selector and dashboard leftovers in Play Mode,
- kept Atlas Mode available for inspection and exploration.

## v13.2 — Guided Scenario Reader UI Pack

- converted guided scenario selector into a one-step scenario reader,
- added scenario step ask/evidence/guard/notebook sections,
- added manual-first Previous/Next controls,
- kept the experience guided instead of dashboard-like.

## v12.7 — Guided Scenario Selector UI Pack

- added the first guided scenario selector UI,
- exposed symptom-first scenario cards,
- showed first diagnostic question and runtime reading steps,
- kept Focus Mode compact to avoid dashboard drift.

## v12.2 — Guided Scenario Bridge Pack

- added scenario-to-stage bridge model,
- added bridge readiness evaluation and reports,
- added story:bridge and story:bridge:readiness scripts,
- updated story:all to run the full guided story pipeline,
- prepared future guided scenario UI without adding UI panels.

## v11.7 — Guided Scenario Runtime Pack

- added guided scenario runtime cards and runtime steps,
- added story:runtime and story:all project scripts,
- generated a guided scenario runtime report,
- prepared a future UI bridge without adding new UI panels.

## v11.2 — Guided Scenario Authoring Pack

- added guided scenario pack models for happy path and failure paths,
- added DNS, TCP, TLS and HTTP/application failure story blueprints,
- added evidence contracts and do-not-jump guardrails for scenario steps,
- added story:scenarios and story:scenario:quality reports without changing UI.

## v10.7 — Guided Authoring Pack

- added a full guided journey script model and Markdown renderer,
- added story quality checks for evidence questions, do-not-jump guards and vocabulary,
- added story:guided and story:quality project scripts,
- generated guided story and quality reports without adding UI dashboard weight.

## v10.2 — Guided Story Layer Pack

- added a guided story script model for every journey stage,
- added mental model, evidence question, do-not-jump guard and handoff text,
- added a small vocabulary helper with do-not-confuse guidance,
- integrated the story layer into Animated Journey Mode without adding dashboard metrics.

## v9.7 — Guided Narrator Pack

- added a narrator line to each guided journey step,
- added pause prompts and handoff text before moving to the next step,
- strengthened the one-journey reading flow without adding dashboard metrics.

## v9.5 — Coach-Only Guided Reading

- made Focus Mode coach-only instead of dashboard-like,
- hid duplicate and competing panels in Focus Mode,
- added a final recap only at the last journey step,
- kept detailed workshop panels available in Atlas Mode.

## v9.3 — Guided Read Mode Cleanup

- made the Guided Step Coach the primary Focus Mode reading path,
- hid duplicate old summary and recommendation blocks in Focus Mode,
- turned the coach footer next action into a real navigation button,
- kept the full workshop available in normal Atlas Mode.

## v9.2 — Guided Step Coach

- added a guided step coach to Animated Journey Mode,
- introduced Before / Now / Next reading structure,
- added Say it simply, What to do now, Proof question and Notebook line prompts,
- reinforced manual step-by-step guidance instead of dashboard scanning.

## v9.1 — Guided Journey Reset

- reset Focus Mode toward manual step-by-step reading,
- slowed auto-play timings and made slow speed the default,
- renamed the play control to Auto-play to reduce confusion,
- hid supporting map/inspector panels in Focus Mode,
- hid empty failure-branch blocks so the final steps read cleaner.

## v9.0 — DNS Branch Evidence Integration

- connected DNS failure branches to an explicit evidence checklist,
- added a DNS branch readiness script and report,
- aligned UI branch preview, synthetic fixture evidence and capture plan documentation,
- prepared the DNS branch for a later controlled real capture candidate.

## v8.7 — Branch Evidence Pack

- added branch decision explanations for DNS, TCP, TLS and HTTP/application failures,
- added a synthetic DNS failure fixture proving DNS failure before TCP/TLS/HTTP,
- added a DNS failure capture planning script and report,
- documented the combined branch evidence workflow.

## v8.5 — Branch Decision Explainer

- added a decision explainer for branch previews,
- clarified layer boundaries for DNS, TCP, TLS and HTTP/application failures,
- showed evidence rules directly inside the selected branch preview.

## v8.4 — Focus Mode Viewport Anchor

- polished Focus Mode so the animated step reads as the screen anchor,
- added sticky playback controls in focus view,
- constrained and centered the focused presentation surface.

## v8.3 — Branch Classifier Precision

- tightened branch choice classification by layer boundary,
- prevented HTTP/application error branches from attaching to DNS-only stages,
- documented the DNS response versus HTTP response distinction.

## v8.2 — Presentation Focus Mode Polish

- added a Focus Mode toggle to Animated Journey Mode,
- added central presentation mode state to the atlas store,
- simplified the screen while focus is active by hiding guidance stacks and early filter controls,
- enlarged the current guided step without removing the supporting atlas panels.

## v8.1 — DNS Failure Branch Path

- expanded the DNS failure branch from a single preview into a short diagnostic path,
- added a reusable DNS failure branch path model,
- showed DNS failure path steps inside Animated Journey Mode branch preview,
- documented the rule: DNS failure means no target IP, no TCP, no TLS and no HTTP.

## v8.0 — Branching Journey Choices

- added a diagnostic branch choice model for DNS failure, TCP blocked, TLS failure and HTTP/application error,
- connected branch previews to Stage Narrative Metadata and Animated Journey Mode,
- added central branch selection state to the atlas store,
- documented branch previews as diagnostic forks, not full alternate routes yet.

## v7.9 — Stage Narrative Metadata

- added a reusable stage narrative metadata model,
- kept Animated Journey Mode wired through the cinematic model while moving narrative assembly into a dedicated layer,
- added narrative coverage checks for current scenario stages,
- documented the narrative contract before adding branching choices.

## v7.7 — Release Checkpoint / Project Status

- refreshed the repository status narrative to match the real v7.x repo state,
- added a richer project status generator and checkpoint command,
- regenerated committed project status and release readiness reports,
- updated the roadmap to position Animated Journey Mode as the next milestone,
- removed stale release-checkpoint expectations that still described the first real fixture as pending.

## v7.0–v7.6 — Workspace maturity and evidence layer

- added the HTTP vs HTTPS contrast workspace,
- attached the verified HTTPS real capture fixture,
- attached the verified localhost HTTP real capture fixture,
- added Atlas Orientation, Inventory, Guided Path, Capture Workspace Guide and Explain This Screen layers,
- added Cinematic Trace Mode as a secondary playback tool,
- kept unit, E2E, visual regression and GitHub Actions quality gates in place.

## v5.7 — Repository & CI Hardening

- moved GitHub Actions workflow to the repository root,
- added monorepo-safe CI working directory for `packet-atlas`,
- expanded verification to include lint, bundle budget, manifest validation, capture cross-validation, E2E and visual regression,
- updated README, roadmap and changelog,
- removed local patch installers, generated patch backups and rejected learning-mode leftovers,
- fixed stale atlas health check paths,
- set package version to `5.7.0`.

## v5.2–v5.6 — Scenario/capture quality layer

- added Scenario Manifest v2 groundwork,
- added scenario-to-capture cross-validator,
- added keyboard navigation and accessibility live region,
- added visual regression harness,
- added capture stage mapper heuristics.

## v4.7–v5.1 — Hardening and capture bridge

- added repository hygiene audit,
- added unified quality gate,
- added GitHub Actions workflow scaffold,
- added real capture placeholder and recipe,
- added Capture-aware Inspector.

## v4.2–v4.6 — Testing, fixtures and component catalog

- added Playwright E2E smoke tests,
- added Scenario Quality Linter,
- added TShark fixture pipeline,
- added symbolic PHY Signal Strip,
- added Component Lab.

## v4.1 — Workspace Consolidation & UX Stabilization

- reorganized the application into focused workspaces: Journey, Diagnostics, Protocols, Internals and Capture,
- moved secondary protocol/diagnostic panels out of the default scroll path,
- restored the map/timeline/inspector as the center of the experience,
- added a small workspace model test to keep the organization intentional.

## v2.1 — Stabilization & Project Cleanup

- added project health scripts,
- added project validation script,
- added README, changelog and roadmap,
- kept the app direction focused on atlas/simulator behavior.

## v2.0 — Offline Capture Fixture Pipeline

- added normalized capture fixture model,
- added synthetic fixture sample and validation command.

## v1.6–v1.9

- added Observer Mode, Encapsulation Transform View, Protocol Sequence Boards and Wireshark-style Field Tree.

## v1.1–v1.5

- added scenario variants, failure impact, visibility matrix, flow diff and failure trace navigator.
