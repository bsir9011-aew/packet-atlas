# Packet Atlas v8.1 — DNS Failure Branch Path

v8.1 turns the DNS failure branch from a single preview into a small diagnostic path.

It still does not create a full alternate route in the scenario manifest. That comes later.

## Path thesis

```text
DNS failure -> no target IP -> no TCP -> no TLS -> no HTTP
```

## Diagnostic sequence

1. DNS query is attempted.
2. DNS answer fails or times out.
3. TCP never starts because there is no target IP.
4. The correct diagnostic focus is name resolution, not application logs.

## What this teaches

A user can say "the website is down", but the packet evidence may prove that the browser never connected to the web server.

That is the key diagnostic difference:

```text
server failure: later-stage problem
DNS failure: pre-connection problem
```

## Product boundary

This is still an atlas layer:

- no quiz,
- no scoring,
- no separate lesson,
- no second router for every stage.

It is a guided diagnostic fork inside Animated Journey Mode.
