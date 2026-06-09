# Packet Atlas

Packet Atlas is an interactive network/data journey atlas.

It explains one request/response journey across multiple abstraction layers: user intent, browser/application meaning, DNS, transport, TLS, routing, link-layer delivery, server-side processing and response rendering.

## Project shape now

Packet Atlas is **not** a course platform, quiz app, flashcard system or generic e-learning product.

Its scope stays narrow and deliberate:

```text
One journey, many lenses.
```

The current application organizes that journey into five **product workspaces**:

- Journey
- Diagnostics
- Protocols
- Internals
- Capture

## Current repo state

The current v7.7 checkpoint includes:

- React + Vite + TypeScript application
- scenario-driven journey models
- Journey / Diagnostics / Protocols / Internals / Capture workspaces
- HTTPS baseline scenario and SSH scenario manifest
- failure diagnostics and protocol variants
- packet internals and capture-aware inspector
- verified HTTPS real capture fixture
- verified localhost HTTP real capture fixture
- dedicated HTTP vs HTTPS contrast workspace
- Atlas Orientation Panel
- Atlas Inventory Panel
- Guided Learning Path
- Capture Workspace Guide
- Explain This Screen cards
- unit tests, Playwright E2E and visual regression
- repository-root GitHub Actions quality workflow

## Strongest technical proof

Packet Atlas currently has two verified real capture fixtures:

| Fixture | What it proves |
|---|---|
| `https-basic-real-fixture` | HTTPS exposes DNS/TCP/TLS evidence, while readable HTTP stays hidden on the wire. |
| `http-local-real-fixture` | Plain localhost HTTP exposes readable request/response evidence, with no TLS wrapper. |

In short:

```text
HTTPS = envelope visible, letter hidden
HTTP  = letter visible
```

## Animated journey status

Packet Atlas already has the beginnings of a guided flow:

- Journey controls for previous / next / progress
- stage deep-dive cards for current-step explanation
- a Cinematic Trace Mode with restart / previous / play / pause / next / speed

What is still missing is not a totally new idea, but a stronger **narrative layer** above the existing atlas:

- app-level guided-flow state,
- visited stage history,
- clearer current-step framing,
- branch choices for failure paths,
- a calmer presentation mode.

## Safe capture rule

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

## Project status reports

```bash
npm run status:checkpoint
npm run project:summary
npm run release:readiness
```

## Verification

Non-UI patch:

```bash
npm run lint
npm run build
npm run verify
```

UI patch:

```bash
npm run visual:update
npm run visual:test
npm run visual:ci:test
npm run lint
npm run build
```

## Next recommended milestone

**v7.8 — Animated Journey Mode promotion**

Do not build a second atlas. Promote the existing cinematic/guided pieces into one calmer narrative layer that sits on top of the current workspace system.
