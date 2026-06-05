# Changelog

## v5.7 — Repository & CI Hardening

- Moved GitHub Actions workflow to the repository root.
- Added monorepo-safe CI working directory for `packet-atlas`.
- Expanded verification to include lint, bundle budget, manifest validation, capture cross-validation, E2E and visual regression.
- Updated README, roadmap and changelog.
- Removed local patch installers, generated patch backups and rejected learning-mode leftovers.
- Fixed stale atlas health check paths.
- Set package version to `5.7.0`.

## v5.2–v5.6 — Scenario/capture quality layer

- Added Scenario Manifest v2 groundwork.
- Added scenario-to-capture cross-validator.
- Added keyboard navigation and accessibility live region.
- Added visual regression harness.
- Added capture stage mapper heuristics.

## v4.7–v5.1 — Hardening and capture bridge

- Added repository hygiene audit.
- Added unified quality gate.
- Added GitHub Actions workflow scaffold.
- Added real capture placeholder and recipe.
- Added Capture-aware Inspector.

## v4.2–v4.6 — Testing, fixtures and component catalog

- Added Playwright E2E smoke tests.
- Added Scenario Quality Linter.
- Added TShark fixture pipeline.
- Added symbolic PHY Signal Strip.
- Added Component Lab.

## v4.1 — Workspace Consolidation & UX Stabilization

- Reorganized the application into focused workspaces: Journey, Diagnostics, Protocols, Internals and Capture.
- Moved secondary protocol/diagnostic panels out of the default scroll path.
- Restored the map/timeline/inspector as the center of the experience.
- Added a small workspace model test to keep the organization intentional.

## v2.1 — Stabilization & Project Cleanup

- Added project health scripts.
- Added project validation script.
- Added README, changelog and roadmap.
- Kept the app direction focused on atlas/simulator behavior.

## v2.0 — Offline Capture Fixture Pipeline

- Added normalized capture fixture model.
- Added synthetic fixture sample and validation command.

## v1.6–v1.9

- Added Observer Mode, Encapsulation Transform View, Protocol Sequence Boards and Wireshark-style Field Tree.

## v1.1–v1.5

- Added scenario variants, failure impact, visibility matrix, flow diff and failure trace navigator.
