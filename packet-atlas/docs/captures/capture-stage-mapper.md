# Capture Stage Mapper

The mapper produces suggestions, not truth.

Run:

```bash
npm run capture:map -- src/data/fixtures/https-example.synthetic.fixture.json
```

It uses conservative heuristics such as:

- ARP layer → `arp-gateway`
- DNS to port 53 → `dns-query`
- DNS from port 53 → `dns-response`
- TLS layer → possible `tls-handshake`
- TCP/443 → possible `tcp-handshake`

Every suggestion must be reviewed before attaching it to a scenario.
