# Packet Atlas v6 readiness gate

Generated: 2026-06-06T08:21:57.747Z

Mode: advisory

## Checks

| Status | Check | Message | Next action |
|---|---|---|---|
| ⏳ | real-fixture-exists | Real fixture is missing: src/data/fixtures/https-basic.real.fixture.json | Promote a validated candidate using npm run capture:candidate:promote. |
| ⏳ | real-fixture-attached | No real fixture status available. | The trusted fixture must have status attached. |
| ⏳ | real-fixture-has-frames | No real fixture frames available. | Attach normalized frames from a real capture. |
| ⏳ | candidate-reviewed | Candidate validation report is missing. | Run npm run capture:candidate:validate before promotion. |
| ⏳ | strict-readiness | Fixture readiness status: pending | Run npm run capture:readiness:strict after promotion. |
| ✅ | privacy-reviewed | Privacy audit status: ok; findings: 1 | — |
| ⏳ | pcap-profile-compatible | PCAP profile report is missing. | Run npm run capture:profile and confirm the capture matches the frozen baseline. |
| ⏳ | candidate-or-real-present | No candidate or real capture artifact exists yet. | Build a candidate with npm run capture:candidate after mapping. |

## Result

⏳ Not ready for v6.0 yet. Remaining blockers: 7.

## Rule

Do not label v6.0 until a real fixture is attached, strict readiness passes and privacy review is complete.
