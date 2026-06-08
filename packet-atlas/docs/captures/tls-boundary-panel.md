# Packet Atlas v6.4 — TLS Boundary Panel

v6.4 adds a focused TLS visibility boundary panel.

It separates:

- what a network observer can see,
- what cannot be inferred from the wire.

For the first verified HTTPS capture, the important result is:

```text
DNS frames: visible
TCP/443 frames: visible
TLS frames: visible
Readable HTTP frames: 0
```

This supports the core Packet Atlas teaching model: HTTP exists logically, but HTTPS protects readable HTTP payload inside TLS.
