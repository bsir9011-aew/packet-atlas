# Packet Atlas Guided Scenario Runtime

This report describes how guided scenarios should be read at runtime.

Default scenario: HTTPS happy path

## Scenario cards

### HTTPS happy path

- Mode: happy-path
- Reader action: Follow the complete journey once before inspecting failure paths.

### DNS failure

- Mode: failure-path
- Reader action: Start from the symptom, then prove whether name resolution stopped the journey.

### TCP blocked

- Mode: failure-path
- Reader action: Prove whether DNS worked and transport failed.

### TLS failure

- Mode: failure-path
- Reader action: Prove whether TCP worked and the secure envelope failed.

### HTTP/application error

- Mode: failure-path
- Reader action: Prove whether earlier layers carried the request and application evidence matters.

## Runtime rule

Choose a scenario, read one step, check evidence, write one notebook line and move next.
