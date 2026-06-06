# Real Capture Workflow Orchestrator

Run:

```bash
npm run capture:workflow
```

It writes:

```text
reports/real-capture-workflow.md
```

The report checks which artifacts already exist and tells you the next practical command.

Expected path:

```text
plan
→ pcap
→ profile
→ raw fixture
→ normalized fixture
→ mapping
→ candidate
→ validate
→ promote
→ strict readiness
```

This script does not capture traffic and does not modify fixtures.
