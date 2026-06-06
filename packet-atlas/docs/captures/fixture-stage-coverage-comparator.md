# Fixture Stage Coverage Comparator

Compare synthetic fixture stage coverage with a real/candidate fixture:

```bash
npm run capture:coverage:compare
```

Default comparison:

```text
src/data/fixtures/https-example.synthetic.fixture.json
vs
src/data/fixtures/https-basic.real.fixture.candidate.json
```

Output:

```text
reports/fixture-stage-coverage.md
```

This does not prove packet correctness. It answers a narrower question:

> Does the candidate fixture cover the same scenario stages as the baseline fixture?
