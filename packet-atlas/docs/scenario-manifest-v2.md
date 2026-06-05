# Scenario Manifest v2

v5.2 adds a versioned manifest around the existing TypeScript scenario.

This is deliberately a safe groundwork step, not a risky full migration of the baseline scenario to JSON.

The manifest declares:

- scenario identity,
- source module,
- supported workspaces,
- fixture relationships,
- required quality checks.

Run:

```bash
npm run scenario:manifest:validate
```
