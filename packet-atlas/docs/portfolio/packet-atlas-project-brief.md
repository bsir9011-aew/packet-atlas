# Packet Atlas — Portfolio Project Brief

## Portfolio note

This is a portfolio-ready project brief for Packet Atlas.

## One-sentence summary

Packet Atlas is an interactive network journey atlas that visualizes how a user request becomes DNS, TCP, TLS, HTTP, routing and application behavior, backed by verified packet capture fixtures.

## What makes it valuable

Most networking explanations are either too abstract or too packet-centric. Packet Atlas connects both:

- human intent,
- browser/application meaning,
- transport and security layers,
- network evidence,
- real capture data.

## Technical highlights

- React + TypeScript application
- Scenario-driven architecture
- Real capture fixture pipeline
- TShark-based capture export/normalization
- HTTPS vs plaintext HTTP contrast
- Visual regression testing
- CI quality workflow

## Current real capture milestone

The project contains two verified fixture paths:

```text
HTTPS example.com:
  DNS + TCP/443 + TLS
  readable HTTP = 0

HTTP localhost:
  TCP/8080
  readable HTTP > 0
  TLS = 0
```

## What this demonstrates

- TLS hides HTTP method/path/body from network observers.
- Plain HTTP exposes application-layer request/response evidence.
- Packet evidence and application assumptions must be separated.
- Safe capture workflows can be built around redaction and local-only raw artifacts.

## Next milestone

A dedicated HTTP vs HTTPS contrast workspace that presents both real traces side by side.
