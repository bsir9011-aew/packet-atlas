# Capture Command Generator

Generate a reviewable shell plan:

```bash
npm run capture:commands -- --interface eth0 --host example.com
```

The generated file is:

```text
reports/capture-command-plan.sh
```

It prints the commands needed to:

1. list interfaces,
2. start a small TShark capture,
3. trigger one controlled `curl` request,
4. inspect the capture,
5. export/normalize/profile/map the fixture,
6. run strict readiness.

The generated file does not start capture automatically.
