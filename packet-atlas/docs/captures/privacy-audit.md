# Capture Privacy Audit

Run a non-strict audit:

```bash
npm run capture:privacy:audit
```

Run a strict audit before publishing real capture-derived fixtures:

```bash
npm run capture:privacy:audit:strict -- src/data/fixtures
```

The audit scans JSON fixtures for:

- emails,
- MAC addresses,
- private/local/public IPv4 addresses outside documentation ranges,
- long token-like strings.

The default mode reports findings without failing the main quality gate.
