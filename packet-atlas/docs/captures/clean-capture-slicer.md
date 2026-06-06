# Clean Capture Slicer

The first live capture can include unrelated Codespaces traffic. Slice it before building a trusted fixture.

```bash
npm run capture:slice -- \
  captures/https-basic.pcapng \
  example.com \
  captures/https-basic.clean.pcapng
```

The slicer keeps:

- DNS query/response frames for the host,
- TCP streams discovered from visible TLS SNI,
- fallback IP-address traffic from DNS answers if no SNI stream is found.

It writes a `.slice-report.json` next to the output PCAP.

Use the clean PCAP for export/normalize/map/candidate work.
