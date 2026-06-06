# v5.23 Readiness Repair

Before v5.23, passing an extra positional argument to `capture:readiness:strict` could accidentally use that argument as the report output path.

v5.23 changes this:

```bash
npm run capture:readiness:strict -- src/data/fixtures/https-basic.real.fixture.candidate.json
```

Now means:

- input fixture: candidate JSON,
- report output: `reports/capture-fixture-readiness.json`.

Custom report path requires explicit syntax:

```bash
npm run capture:readiness:strict -- candidate.json --report reports/candidate-readiness.json
```

Reports are refused inside `src/data/fixtures/`.
