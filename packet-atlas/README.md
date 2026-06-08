# Packet Atlas

Packet Atlas is an interactive network/data journey atlas.

It explains one request/response journey across multiple abstraction layers: user intent, browser/application meaning, DNS, transport, TLS, routing, link-layer delivery, server-side processing and response rendering.

The current milestone includes two verified real capture fixtures:

| Fixture | What it proves |
|---|---|
| `https-basic-real-fixture` | HTTPS exposes DNS/TCP/TLS evidence, but readable HTTP is not visible on the wire. |
| `http-local-real-fixture` | Plain HTTP on localhost exposes readable request/response evidence. |

## Why this project exists

Packet Atlas is not a course platform, not a quiz app and not a generic e-learning platform. It is a visual, layered atlas for understanding how one action becomes packets, frames, encrypted records and application behavior.

The core idea:

```text
One journey, many lenses.

In lowercase terms for the project scope: one journey, many lenses.
```

A browser action is not only a packet. A packet is not only an application event. Packet Atlas separates these viewpoints.

## Current technical capabilities

- React/Vite application
- TypeScript data models
- Scenario-driven architecture
- HTTPS baseline scenario
- Failure variants and diagnostic views
- Capture-aware inspector
- Verified real capture fixture pipeline
- HTTPS vs HTTP contrast audit
- Unit tests, E2E tests and visual regression tests
- GitHub Actions quality workflow

## Real capture safety model

Raw capture artifacts stay local-only:

- `captures/*.pcapng`
- `*.raw.json`
- `*.candidate.json`
- `*.mapping.json`

Only reviewed, normalized and redacted JSON fixtures are committed.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm run verify:full
```

## Real capture checks

```bash
npm run capture:registry:audit
npm run capture:contrast:audit
```

## Project status

Packet Atlas has reached the v6.x real-capture foundation:

```text
HTTPS capture: DNS + TCP/443 + TLS + readable HTTP = 0
HTTP local capture: TCP/8080 + readable HTTP > 0 + TLS = 0
```

Next larger milestone: a dedicated visual HTTP vs HTTPS contrast workspace.
