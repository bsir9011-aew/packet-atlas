# Controlled Capture Plan

Generate a plan without starting capture:

```bash
npm run capture:plan -- --interface eth0 --host example.com
```

The resulting JSON contains:

- frozen baseline assumptions,
- authorization and privacy warnings,
- capture/display filters,
- command templates,
- stop conditions.

The generated commands are templates. Review them before execution.
