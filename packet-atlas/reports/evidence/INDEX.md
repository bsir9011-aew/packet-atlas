# Packet Atlas capture evidence pack

Generated: 2026-06-06T08:21:21.848Z

This index does not prove that the first real capture is complete. It collects the operator evidence needed to review the capture pipeline.

## Evidence files

| Status | Evidence | Path |
|---|---|---|
| ✅ | Capture environment | `reports/capture-environment-report.json` |
| ✅ | Capture plan | `src/data/capture-plans/https-basic.controlled-capture-plan.json` |
| ✅ | Command plan | `reports/capture-command-plan.sh` |
| ⬜ | PCAP profile | `reports/pcap-profile.json` |
| ✅ | Fixture readiness | `reports/capture-fixture-readiness.json` |
| ✅ | Privacy audit | `reports/capture-privacy-audit.json` |
| ✅ | Fixture coverage | `reports/fixture-stage-coverage.md` |
| ✅ | Real capture workflow | `reports/real-capture-workflow.md` |
| ✅ | Release readiness | `reports/release-readiness.md` |

## Suggested review order

1. Capture environment
2. Controlled capture plan
3. PCAP profile
4. Normalized fixture and mapping
5. Candidate validation
6. Privacy audit
7. Fixture readiness
8. Release readiness

## Rule

Do not promote a real capture fixture until candidate validation and manual review both pass.
