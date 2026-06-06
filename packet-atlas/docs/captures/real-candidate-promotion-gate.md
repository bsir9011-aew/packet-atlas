# Real Candidate Promotion Gate

Validate a candidate:

```bash
npm run capture:candidate:validate -- src/data/fixtures/https-basic.real.fixture.candidate.json
```

Promote only after manual review:

```bash
npm run capture:candidate:promote -- src/data/fixtures/https-basic.real.fixture.candidate.json
```

Promotion writes:

```text
src/data/fixtures/https-basic.real.fixture.json
```

The gate requires:

- candidate status,
- non-empty frames,
- numeric unique frame numbers,
- protocol stacks,
- every planned stage mapped.
