# Packet Atlas v8.5–v8.7 — Branch Evidence Pack

This pack combines three related steps into one larger patch.

## v8.5 — Branch Decision Explainer

Every failure branch explains:

- why it belongs at this layer,
- what not to assume,
- what evidence to check first.

## v8.6 — DNS Failure Synthetic Fixture

Adds a controlled synthetic DNS failure fixture:

```text
DNS query exists
DNS failure answer exists
TCP/443 absent
TLS absent
HTTP absent
```

## v8.7 — DNS Failure Capture Plan

Adds an operator-safe plan for a later real capture.

Raw captures remain local-only:

```text
do not commit PCAP / PCAPNG
```
