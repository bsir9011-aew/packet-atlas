# PCAP Profile Analyzer

After creating a capture:

```bash
npm run capture:profile -- captures/https-basic.pcapng
```

This produces:

```text
reports/pcap-profile.json
```

The analyzer checks whether the capture looks compatible with the frozen HTTPS baseline:

- visible DNS / UDP 53,
- TCP/443,
- TLS,
- possible QUIC/HTTP3 mismatch.

It does not prove semantic correctness. It is a preflight profile before normalization and mapping.
