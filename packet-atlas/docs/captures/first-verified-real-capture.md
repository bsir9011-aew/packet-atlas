# Packet Atlas v6.0 — First Verified Real Capture

Packet Atlas now includes a promoted real capture fixture:

```text
src/data/fixtures/https-basic.real.fixture.json
```

This fixture was created from a controlled `curl` request to `https://example.com`, then sliced, exported, normalized, mapped, validated, redacted and promoted.

## What is committed

The repository includes the reviewed normalized fixture:

- `id`: `https-basic-real-fixture`
- `kind`: `real-capture-fixture`
- `status`: `attached`
- `frames`: 23
- redaction: applied

## What is not committed

The repository should not include local raw capture artifacts:

- `captures/*.pcapng`
- `*.raw.json`
- `*.candidate.json`
- `*.mapping.json`

## Why HTTP is not visible

The real capture contains DNS, TCP/443 and TLS frames. It does not contain readable HTTP payloads because the HTTP request is protected inside TLS.
