# Packet Atlas v6.1 — Real Capture Evidence Panel

The capture workspace now includes a visual evidence panel for the first verified real capture.

It summarizes:

- fixture id and status,
- clean sliced frame count,
- DNS frame count,
- TCP/443 frame count,
- TLS frame count,
- readable HTTP frame count,
- redaction status,
- stage mapping counts.

The key teaching point is intentionally simple:

> In an HTTPS trace, HTTP exists logically, but readable HTTP payload is not visible on the wire because it is protected inside TLS.
