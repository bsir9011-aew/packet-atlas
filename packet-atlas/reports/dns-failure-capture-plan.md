# DNS Failure Capture Plan

This plan prepares a controlled real capture for the DNS failure branch.

## Goal

Capture evidence for:

```text
DNS query exists
DNS failure / NXDOMAIN / timeout exists
TCP/443 is absent
TLS is absent
HTTP is absent
```

## Safe target

Use a deliberately invalid or controlled test domain. Prefer `.invalid` because it is reserved for invalid names.

Example target:

```text
packet-atlas-dns-test.invalid
```

## Candidate commands

Terminal A:

```bash
mkdir -p captures
tshark -i any -f "udp port 53 or tcp port 443" -a duration:8 -w captures/dns-failure-candidate.pcapng
```

Terminal B, while capture runs:

```bash
curl -v --max-time 5 https://packet-atlas-dns-test.invalid/ || true
```

## Acceptance rules

- DNS query must be visible.
- DNS failure or lack of usable DNS answer must be visible.
- There must be no TCP/443 connection to a resolved target.
- There must be no TLS handshake for that target.
- There must be no HTTP exchange.

## Privacy rule

Do not commit raw PCAP/PCAPNG files.

Only commit a reviewed, normalized and redacted fixture candidate.

