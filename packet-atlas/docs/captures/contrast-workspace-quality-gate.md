# Packet Atlas v7.1 — Contrast Workspace Quality Gate

v7.1 adds a non-UI quality gate for the v7.0 contrast workspace.

It checks that:

- HTTPS fixture is attached and redacted,
- HTTP local fixture is attached and redacted,
- HTTPS has TLS evidence and no readable HTTP,
- HTTP local has readable HTTP and no TLS,
- the contrast workspace model exposes the key rows,
- the contrast panel is mounted in the workspace.

Run:

```bash
npm run contrast:workspace:audit
```

Generated reports stay local.
