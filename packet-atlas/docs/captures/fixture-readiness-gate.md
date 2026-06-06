# Fixture Readiness Gate

Current project-safe check:

```bash
npm run capture:readiness
```

This allows the honest `pending` state while no real fixture exists.

Strict check for the future real fixture:

```bash
npm run capture:readiness:strict
```

Strict readiness requires:

- non-empty frames,
- unique numeric frame numbers,
- protocol stacks,
- mappings for every planned stage.
