# Packet Atlas Architecture Overview

Packet Atlas is built around data-driven scenarios.

## Main layers

```text
Scenario model
  ↓
Stage data
  ↓
Observer/lens projections
  ↓
Failure variants
  ↓
Capture fixtures
  ↓
UI panels
```

## Scenario model

The scenario defines the logical journey:

- stage id,
- short name,
- direction,
- device role,
- payload reference,
- visible layers,
- human/system interpretation.

## Capture fixtures

Capture fixtures are normalized JSON representations of packet captures.

There are two fixture classes:

| Type | Purpose |
|---|---|
| Synthetic fixture | Stable educational baseline. |
| Real capture fixture | Reviewed evidence derived from controlled packet capture. |

## Real fixture promotion pipeline

```text
PCAP/PCAPNG
  → export
  → normalize
  → map
  → candidate
  → validate
  → redact
  → promote
  → audit
```

Raw artifacts are not committed.

## Quality gates

The repository uses:

- TypeScript build,
- ESLint,
- Vitest unit tests,
- Playwright E2E tests,
- Playwright visual regression,
- bundle budget,
- project-specific capture audits.
