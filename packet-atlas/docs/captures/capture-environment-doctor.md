# Capture Environment Doctor

Run:

```bash
npm run capture:doctor
```

The doctor checks whether local capture tooling is available:

- `tshark`
- `dumpcap`
- `capinfos`
- `editcap`
- visible capture interfaces
- Packet Atlas fixture and documentation directories

It writes:

```text
reports/capture-environment-report.json
```

The doctor never starts packet capture and does not fail the normal application quality gate when TShark is unavailable.
