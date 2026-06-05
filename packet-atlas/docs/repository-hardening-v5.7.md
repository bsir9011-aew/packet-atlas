# v5.7 Repository & CI Hardening

This patch intentionally adds no protocol panel.

It fixes project infrastructure:

- root-level GitHub Actions workflow,
- `packet-atlas` working directory for CI commands,
- full local verification command,
- stale docs,
- stale health check path,
- committed patch installers/backups,
- duplicate/contradictory learning-mode leftovers.

The project should now be judged through:

```bash
npm run verify
npm run verify:e2e
npm run verify:full
```

`verify:full` expects visual snapshots to exist. If UI changed intentionally, run:

```bash
npm run visual:update
npm run visual:test
```
