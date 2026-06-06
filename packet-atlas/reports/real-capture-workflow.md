# Packet Atlas real capture workflow

Generated: 2026-06-06T07:02:19.032Z

## Current state

- ✅ **plan** — `src/data/capture-plans/https-basic.controlled-capture-plan.json`
- ⬜ **pcap** — `captures/https-basic.pcapng`
- ⬜ **profile** — `reports/pcap-profile.json`
- ⬜ **raw-fixture** — `src/data/fixtures/https-basic.raw.json`
- ⬜ **normalized-fixture** — `src/data/fixtures/https-basic.real.fixture.json`
- ⬜ **mapping** — `src/data/fixtures/https-basic.real.fixture.mapping.json`
- ⬜ **candidate** — `src/data/fixtures/https-basic.real.fixture.candidate.json`

## Next action

Run or review:

```bash
Use the reviewed TShark command from reports/capture-command-plan.sh
```

## Safety rule

Capture only traffic you are authorized to inspect. Keep capture windows short and controlled.
