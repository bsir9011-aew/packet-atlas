# Packet Atlas v8.0 — Branching Journey Choices

v8.0 adds diagnostic branch choices to Animated Journey Mode.

This is the first step toward paths such as:

- DNS failure,
- TCP blocked,
- TLS failure,
- HTTP/application error.

## Important boundary

v8.0 does **not** create full alternate scenario routes yet.

It adds branch previews at the current stage:

- what changes,
- what the user sees,
- what network evidence should or should not appear,
- what the next diagnostic step is.

This keeps the atlas stable while introducing the idea that the same journey can fork.

## Why this matters

Users often say "the page is down" as one vague failure.

The branch model teaches a more precise diagnostic chain:

```text
DNS failure  -> no TCP, no TLS, no HTTP
TCP blocked  -> DNS may work, but TLS/HTTP cannot start
TLS failure  -> TCP works, but secure exchange fails
HTTP error   -> network path may work, but application fails
```

## Product rule

Branch choices are still an atlas layer, not a quiz mechanic.

The user is not "earning progress". They are exploring what can happen next from the current step.
