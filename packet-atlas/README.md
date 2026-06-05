# Packet Atlas

**Packet Atlas** is an interactive client-side atlas for following one data journey across many lenses: user intent, application protocol, TLS, transport, IP, link layer, devices, failure variants and capture fixtures.

It is not a course platform, quiz app or Cyber Career clone. The product model is:

> **one journey, many observers, many layers**

## Current baseline scenarios

- `https://example.com` with frozen assumptions: IPv4, classic DNS over UDP/53, TCP, TLS 1.3, HTTP/1.1, no cache, no service worker, no connection reuse, NAT enabled, Ethernet access medium.
- SSH session over TCP/22 with DNS, ARP/default gateway, TCP and SSH checkpoints.

## Main workspaces

- **Journey** — map, timeline, stage controls and active-stage inspector.
- **Diagnostics** — failure variants, flow diff, failure trace, NAT and firewall state.
- **Protocols** — DNS modes, HTTP versions, IPv6 neighbor discovery, Wi-Fi, TLS visibility, proxy termination, CDN edge and symbolic PHY.
- **Internals** — observer visibility, device cutaway, packet fields, Wireshark-style tree, hex pane and component catalog.
- **Capture** — synthetic fixtures, real-capture placeholders, capture-aware inspector and trace playback.

## Quality commands

```bash
npm run verify        # standard local gate
npm run verify:e2e    # standard gate + Playwright E2E
npm run verify:full   # full gate + E2E + visual regression
```

Individual commands:

```bash
npm run build
npm test
npm run lint
npm run bundle:budget
npm run scenario:manifest:validate
npm run scenario:lint
npm run capture:validate
npm run capture:cross-validate
npm run capture:map -- src/data/fixtures/https-example.synthetic.fixture.json
npm run component:inventory
npm run hygiene:audit
npm run e2e
npm run visual:test
npm run visual:update
```

## Running in Codespaces

```bash
npm run dev -- --host 0.0.0.0
```

## Capture model

Packet Atlas does **not** parse PCAP/PCAPNG directly in the browser.

The intended workflow is:

```text
pcapng
→ TShark offline export
→ normalized fixture JSON
→ scenario stage/capture mapping
→ capture-aware inspector
```

Synthetic fixtures are labeled as synthetic. Real captures remain marked as pending until actual TShark-normalized frames are attached.

## Design guardrails

- Keep Packet Atlas as an atlas/simulator, not a learning habit platform.
- Add protocol/device/flow visibility before adding generic study features.
- Keep PCAP parsing offline; runtime consumes normalized fixtures.
- Be explicit about scenario assumptions.
- Treat colors as helpful, not as the only meaning carrier.
- Do not commit local patch installers or generated patch backups.
