# Packet Atlas v6.9 — HTTPS vs HTTP Contrast Audit

v6.9 adds a non-UI audit comparing the two real fixtures:

- `https-basic.real.fixture.json`
- `http-local.real.fixture.json`

The audit checks the key contrast:

```text
HTTPS:
  TLS > 0
  readable HTTP = 0

HTTP local:
  TLS = 0
  readable HTTP > 0
```

Run:

```bash
npm run capture:contrast:audit
```

Generated reports stay local unless intentionally reviewed.
