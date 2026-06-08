# Real Capture Foundation

Packet Atlas currently has two verified real capture fixtures.

## HTTPS fixture

```text
id: https-basic-real-fixture
status: attached
frames: 23
redaction: applied
```

Evidence:

```text
DNS > 0
TCP/443 > 0
TLS > 0
readable HTTP = 0
```

Meaning:

```text
HTTPS protects HTTP meaning inside TLS.
```

## HTTP local fixture

```text
id: http-local-real-fixture
status: attached
frames: 12
redaction: applied
```

Evidence:

```text
DNS = 0
TCP/8080 > 0
TLS = 0
readable HTTP > 0
```

Meaning:

```text
Plain HTTP exposes request/response evidence on the wire.
```

## Contrast

```text
HTTPS = envelope visible, letter hidden
HTTP  = letter visible
```

This contrast is the strongest current evidence milestone in Packet Atlas.
