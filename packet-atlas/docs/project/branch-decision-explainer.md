# Packet Atlas v8.5 — Branch Decision Explainer

v8.5 adds a short decision explanation to every failure branch.

The branch preview now answers:

- why this branch belongs at this layer,
- what not to assume,
- what evidence should be checked first.

## Why this matters

Failure branches should not only say "what went wrong".

They should teach the diagnostic boundary:

```text
DNS failure -> before TCP
TCP blocked -> before TLS
TLS failure -> before readable HTTPS
HTTP error  -> after network path exists
```
