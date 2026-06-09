# Packet Atlas v8.3 — Branch Classifier Precision

v8.3 tightens the branch classifier so failure choices do not jump across layers too early.

## Rule

Branch choices should appear where they teach the right diagnostic boundary:

```text
DNS query / DNS response       -> DNS failure
TCP handshake / transport      -> TCP blocked
TLS handshake / TLS boundary   -> TLS failure
HTTP GET / proxy / app / resp  -> HTTP or application error
```

## Why this matters

The word `response` can appear in `DNS response`, but that does not mean an HTTP/application error belongs there.

This patch keeps the user from learning the wrong shortcut:

```text
DNS response != HTTP response
```

## Product boundary

This is a correctness patch. It does not add a new mode or new UI.
