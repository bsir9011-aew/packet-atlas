# Packet Atlas v6.6 — HTTP Local Capture Plan

This non-UI patch prepares the next real capture: plaintext HTTP on localhost.

```text
HTTPS capture: DNS + TCP/443 + TLS + readable HTTP = 0
HTTP local capture: TCP/8080 + readable HTTP request/response + TLS = 0
```

Generate the operator report:

```bash
npm run capture:http-local:plan
```

Raw capture files remain local-only until reviewed, normalized, redacted and promoted.
