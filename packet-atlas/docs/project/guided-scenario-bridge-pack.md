# Packet Atlas v11.8–v12.2 — Guided Scenario Bridge Pack

This pack connects scenario authoring to the existing journey model.

It does not add UI.

## v11.8 — Scenario-to-stage bridge

Guided scenario steps are mapped to existing journey stages.

## v11.9 — Anchor reasons

Each bridge anchor explains why the step belongs to that journey stage.

## v12.0 — Bridge readiness

Adds a readiness check for future UI integration.

## v12.1 — Bridge reports

Adds:

```bash
npm run story:bridge
npm run story:bridge:readiness
```

## v12.2 — UI-prep contract

The next UI patch can show scenario choices without inventing logic inside components.

## Product rule

No dashboard.

```text
scenario step -> existing journey stage -> guided reader action
```
