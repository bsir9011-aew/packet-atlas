# Packet Atlas v8.6 — DNS Failure Synthetic Fixture

v8.6 adds a tiny synthetic fixture for the DNS failure branch.

This is not a real capture yet. It is a controlled teaching fixture.

## Evidence rule

```text
DNS query exists
DNS failure answer exists
TCP/443 absent
TLS absent
HTTP absent
```
