# Packet Atlas Roadmap

## Current milestone

**v5.7 — Repository & CI Hardening**

The project now has workspaces, E2E tests, visual regression harness, capture fixture tooling, manifest v2 groundwork, capture cross-validation and a hardened CI workflow.

## Immediate next steps

1. **v5.8 — Real Capture Preparation**
   - create a controlled capture checklist,
   - add fixture import dry-run,
   - document exact TShark commands,
   - avoid browser cache / HTTP3 / DoH surprises.

2. **v6.0 — First Verified Real Capture**
   - attach first real DNS/TCP/TLS frames,
   - map frames to baseline HTTPS stages,
   - update Capture-aware Inspector to show real frame data,
   - pass scenario/capture cross-validation.

3. **v6.1 — Manifest-driven Scenario Registry**
   - add manifest v2 for SSH,
   - remove hardcoded HTTPS-only validation paths,
   - make scenario registry and quality tools manifest-aware.

4. **v6.2 — CSS / UI Consolidation**
   - split `packetAtlas.css`,
   - keep visual regression baselines green,
   - reduce workspace visual noise.

## Not in scope

- quizzes,
- daily missions,
- progress accounts,
- backend user profiles,
- generic certification training modes,
- browser-side raw PCAP parsing.
