# Real Fixture Candidate Builder

After normalization and mapping:

```bash
npm run capture:candidate -- \
  src/data/fixtures/https-basic.real.fixture.json \
  src/data/fixtures/https-basic.real.fixture.mapping.json
```

The output is:

```text
src/data/fixtures/https-basic.real.fixture.candidate.json
```

This step does not promote the capture to trusted real data. It attaches suggested `stageHint` values and marks the file as:

```text
candidate-real-capture
```

Review every mapping before strict validation and promotion.
