# Capture Redaction Guard

Before committing real capture-derived fixtures, generate a redacted review copy:

```bash
npm run capture:redact -- \
  src/data/fixtures/https-basic.real.fixture.candidate.json \
  src/data/fixtures/https-basic.real.fixture.candidate.redacted.json
```

Optional host redaction:

```bash
npm run capture:redact -- candidate.json candidate.redacted.json --host internal.example
```

The guard redacts common sensitive values:

- MAC addresses,
- private IPv4 ranges,
- email addresses,
- a provided sensitive hostname.

This is not a legal/privacy guarantee. It is a guardrail before manual review.
