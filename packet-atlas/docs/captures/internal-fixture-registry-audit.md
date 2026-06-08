# Packet Atlas v6.5 — Internal Fixture Registry Audit

This non-UI patch adds a fixture registry audit.

It checks:

- required tracked fixtures exist,
- fixture IDs are unique,
- real fixtures are attached,
- real fixtures contain redaction metadata.

Run:

```bash
npm run capture:registry:audit
```

This patch intentionally does not modify UI components or visual snapshots.
