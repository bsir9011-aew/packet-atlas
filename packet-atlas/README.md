# Packet Atlas

**Packet Atlas** is an interactive client-side atlas for following one data journey across many lenses: user intent, application protocol, TLS, transport, IP, link layer, devices, failure variants and capture fixtures.

It is not a course platform, quiz app or Cyber Career clone. The product model is: **one journey, many observers, many layers**.

## Current baseline scenario

`https://example.com` with frozen assumptions: IPv4, classic DNS over UDP/53, TCP, TLS 1.3, HTTP/1.1, no cache, no service worker, no connection reuse, NAT enabled, Ethernet access medium.

## Main UI areas

- Scenario Variant panel
- Flow Diff & Failure Trace
- Failure Trace Navigator
- Layer Highlight Mode
- Global Journey Map
- Route Timeline
- Side Panel tabs: Inspector / Device / Stack
- Observer Mode
- Stage Deep Dive
- Protocol Mini Diagrams
- Packet Field Explorer
- Device Visibility Matrix
- Encapsulation Transform View
- Protocol Sequence Boards
- Wireshark-style Field Tree
- Capture Fixture Panel

## Commands

```bash
npm run build
npm test
npm run capture:validate
npm run validate:project
npm run atlas:health
npm run validate:all
npm run dev -- --host 0.0.0.0
```

## Design guardrails

- Keep Packet Atlas as an atlas/simulator, not a learning habit platform.
- Add protocol/device/flow visibility before adding generic study features.
- Keep PCAP parsing offline; runtime consumes normalized fixtures.
- Be explicit about scenario assumptions.
- Treat colors as helpful, not as the only meaning carrier.
