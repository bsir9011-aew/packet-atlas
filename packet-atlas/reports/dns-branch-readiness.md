# DNS Branch Readiness

Status: READY

## Checks

- ✅ Synthetic fixture exists
- ✅ DNS query frame exists
- ✅ DNS failure answer exists
- ✅ Expected absence includes TCP/443, TLS and HTTP
- ✅ Capture plan script exists
- ✅ Capture plan documentation exists

## Evidence rule

```text
DNS query exists
DNS failure answer exists
TCP/443 absent
TLS absent
HTTP absent
```

## Next milestone

The DNS failure branch is ready for a controlled real capture candidate.

