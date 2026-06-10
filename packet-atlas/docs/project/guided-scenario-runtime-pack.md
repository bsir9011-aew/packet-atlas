# Packet Atlas v11.3–v11.7 — Guided Scenario Runtime Pack

This pack prepares guided scenarios for future UI integration without adding UI now.

## v11.3 — Runtime cards

Every scenario gets a runtime card:

- label,
- mode,
- user symptom,
- first question,
- reader action.

## v11.4 — Runtime steps

Every scenario step becomes a reading unit:

- read this,
- ask this,
- evidence checklist,
- do-not-jump guard,
- notebook line,
- next action.

## v11.5 — Runtime report

Adds:

```bash
npm run story:runtime
```

## v11.6 — Full story report runner

Adds:

```bash
npm run story:all
```

## v11.7 — Future UI bridge

The next UI patch can use this runtime layer instead of inventing scenario logic inside components.

## Product rule

This is still not a dashboard.

```text
scenario -> symptom -> question -> step -> evidence -> notebook -> next
```
