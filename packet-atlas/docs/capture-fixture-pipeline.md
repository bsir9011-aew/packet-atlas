# Packet Atlas capture fixture pipeline

Packet Atlas should not parse PCAP/PCAPNG in the browser.

Use this offline flow instead:

```bash
node scripts/captures/tshark-export.mjs capture.pcapng src/data/fixtures/tshark-export.raw.json
node scripts/captures/normalize-fixture.mjs src/data/fixtures/tshark-export.raw.json src/data/fixtures/https-example.fixture.json
node scripts/captures/validate-fixtures.mjs
```

Recommended idea:

1. Capture a small trace.
2. Slice it with Wireshark/editcap if needed.
3. Export with TShark.
4. Normalize to a Packet Atlas fixture.
5. Attach selected frame numbers to scenario stages through `captureRef`.

Keep UI honest: synthetic bytes are synthetic; real fixture bytes are real.
