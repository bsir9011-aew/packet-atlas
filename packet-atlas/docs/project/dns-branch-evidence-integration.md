# Packet Atlas v8.8–v9.0 — DNS Branch Evidence Integration

This pack connects the DNS failure branch to an explicit evidence checklist and readiness snapshot.

## v8.8 — Evidence checklist in the branch preview

The DNS failure branch now shows a compact evidence checklist:

```text
DNS query exists
DNS failure answer exists
TCP/443 absent
TLS absent
HTTP absent
```

## v8.9 — Synthetic fixture alignment

The checklist mirrors the synthetic fixture contract so the UI, model and test evidence teach the same thing.

## v9.0 — DNS branch readiness snapshot

The `branch:dns:readiness` script creates a small milestone report:

```bash
npm run branch:dns:readiness
```

This marks the DNS failure branch as ready for a later controlled real capture candidate.
