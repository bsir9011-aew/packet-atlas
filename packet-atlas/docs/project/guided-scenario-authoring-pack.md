# Packet Atlas v10.8–v11.2 — Guided Scenario Authoring Pack

This pack creates guided scenario blueprints without adding UI panels.

## What it adds

- happy path scenario,
- DNS failure scenario,
- TCP blocked scenario,
- TLS failure scenario,
- HTTP/application error scenario,
- evidence contracts,
- do-not-jump guardrails,
- scenario quality reports.

## Commands

```bash
npm run story:scenarios
npm run story:scenario:quality
```

## Product rule

The scenario starts from what the user sees, then guides inward:

```text
symptom -> first question -> evidence -> do-not-jump guard -> notebook line
```
