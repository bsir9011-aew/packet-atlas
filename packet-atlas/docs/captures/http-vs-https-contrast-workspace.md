# Packet Atlas v7.0 — HTTP vs HTTPS Contrast Workspace

v7.0 introduces the first dedicated visual contrast workspace.

It compares two verified real fixtures:

| Capture | Evidence |
|---|---|
| HTTPS | DNS + TCP/443 + TLS, readable HTTP = 0 |
| HTTP local | TCP/8080, TLS = 0, readable HTTP > 0 |

The central rule:

```text
Do not infer application content from encrypted traffic unless the capture actually exposes it.
```

This is the first UI milestone after the v6.x real-capture foundation.
