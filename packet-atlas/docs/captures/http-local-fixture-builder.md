# Packet Atlas v6.8 — HTTP Local Fixture Builder

v6.8 converts the controlled localhost HTTP capture into a reviewed candidate fixture.

Pipeline:

```bash
npm run capture:http-local:candidate -- \
  src/data/fixtures/http-local.real.fixture.json \
  src/data/fixtures/http-local.real.fixture.candidate.json

npm run capture:http-local:validate -- \
  src/data/fixtures/http-local.real.fixture.candidate.json

npm run capture:http-local:promote -- \
  src/data/fixtures/http-local.real.fixture.candidate.json
```

The promoted fixture is:

```text
src/data/fixtures/http-local.real.fixture.json
```

Raw PCAP, raw JSON, mappings and candidates remain local-only.
