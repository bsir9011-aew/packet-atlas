# Packet Atlas 7.7.0 — Project Status

Generated: 2026-06-09T05:32:40.772Z

## Snapshot

| Area | Current state |
|---|---|
| Package version | 7.7.0 |
| UI workspaces | 5 product workspaces: Journey, Diagnostics, Protocols, Internals, Capture |
| Scenario manifests | 2: HTTPS basic, SSH session |
| Verified real fixtures | 2 attached fixtures |
| Test surface | 91 unit files, 1 E2E spec, 1 visual spec, 3 visual snapshots |
| Root CI workflow | present |

## What exists now

- A scenario-driven React/Vite/TypeScript atlas focused on one frozen request/response journey.
- Five product workspaces keep the atlas separated by lens instead of dumping every panel into one screen.
- The Capture workspace includes both the HTTP vs HTTPS contrast workspace and the real-capture evidence path.
- Atlas Orientation, Inventory, Guided Path and Explain This Screen reduce cognitive overload without turning the product into a course.

## Where to look in the repo

| Workspace | Primary file | What you will find | Why it matters |
|---|---|---|---|
| Journey | `src/features/packet-atlas/workspace/WorkspaceTabs.tsx` | PathScopeFilter, LayerHighlightPanel, JourneyControls, GlobalJourneyMap, RouteTimeline, StageDeepDiveCards, RightPanelTabs | The clean baseline story of one request/response path. |
| Diagnostics | `src/features/packet-atlas/workspace/WorkspaceTabs.tsx` | ScenarioVariantPanel, FailureTraceNavigator, VariantFlowDiff, FailureVariantBuilder, NatStateTableView, StatefulFirewallView | Failure analysis without polluting the default journey view. |
| Protocols | `src/features/packet-atlas/workspace/WorkspaceTabs.tsx` | DNS / HTTP / IPv6 / Wi-Fi / TLS visibility / proxy / CDN panels plus protocol mechanics | Alternative protocol and environment lenses for the same journey. |
| Internals | `src/features/packet-atlas/workspace/WorkspaceTabs.tsx` | ObserverModePanel, DeviceVisibilityMatrix, DeviceCutawayView, PacketFieldExplorer, WiresharkFieldTree, PacketBytesHexPane | Microscope mode for device truth, fields and bytes. |
| Capture | `src/features/packet-atlas/workspace/WorkspaceTabs.tsx` | CaptureWorkspaceGuidePanel, HttpsHttpContrastPanel, real capture panels, CaptureAwareInspector, CinematicTraceMode | Bridge between the educational atlas and real packet evidence. |

## Real evidence

| Fixture | Status | Frames | DNS | TCP/443 | TCP/8080 | TLS | Readable HTTP | Redacted |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| https-basic-real-fixture | attached | 23 | 4 | 19 | 0 | 8 | 0 | yes |
| http-local-real-fixture | attached | 12 | 0 | 0 | 12 | 0 | 2 | yes |

Teaching rule:

```text
HTTPS shows DNS/TCP/TLS evidence without readable HTTP.
Plain HTTP shows readable request/response evidence on the wire.
```

## Quality gates

| Gate | Command | Meaning |
|---|---|---|
| Checkpoint bundle | `npm run status:checkpoint` | Generate project status + release readiness reports. |
| Standard verification | `npm run verify` | Run lint, build, bundle budget, unit tests, project validation and capture/scenario quality gates. |
| Full verification | `npm run verify:full` | Standard verification plus Playwright E2E and visual regression. |
| Visual baseline refresh | `npm run visual:update` | Update local Playwright screenshots after UI changes. |
| Visual baseline CI parity | `npm run visual:ci:test` | Check snapshots in CI mode before pushing UI changes. |
| Capture contrast audit | `npm run capture:contrast:audit` | Protect the HTTPS vs HTTP teaching claim. |

## Current design truth

- Guided-flow foundation already exists: JourneyControls + StageDeepDiveCards + CinematicTraceMode are present.
- The missing piece is orchestration: the atlas store still tracks selected stage/lens/variant/observer, but it does not yet own guided-flow state such as visited stage history, playback mode or branch choice.
- Cinematic trace currently lives as a secondary playback tool inside the Capture workspace, not as the main narrative layer of the product.
- Visual regression currently covers Journey, Diagnostics and Capture. Protocols and Internals are not yet snapshot-covered.

## Next recommended milestone

**v7.8 — Animated Journey Mode promotion**

Build on what the repo already has. Do not create a parallel second atlas.

- Promote the current playback concept into a first-class guided mode.
- Keep the existing workspace model intact.
- Move guided state into the store.
- Reuse existing stage copy and relations instead of inventing a disconnected narrative schema first.
- Let the first branch candidate be DNS failure, but only after the main guided mode has a stable home.

## Technical talk track

> Packet Atlas is a scenario-driven React/Vite/TypeScript web app that models one frozen network/data journey as stage data, then lets the user inspect the same journey through multiple lenses: journey map, diagnostics, protocols, internals and real capture evidence. Its strongest proof is the HTTPS versus localhost HTTP contrast: HTTPS exposes DNS/TCP/TLS without readable HTTP, while plaintext HTTP exposes readable request/response frames directly.
