# v6 Readiness Gate

Advisory mode:

```bash
npm run v6:readiness
```

Strict mode:

```bash
npm run v6:readiness:strict
```

The gate checks whether Packet Atlas is ready for the first real-capture milestone.

It requires:

- attached real fixture,
- non-empty real frames,
- valid candidate report,
- strict fixture readiness,
- privacy review,
- PCAP baseline fit.

Until these pass, the project should stay in the v5.x capture-tooling phase.
