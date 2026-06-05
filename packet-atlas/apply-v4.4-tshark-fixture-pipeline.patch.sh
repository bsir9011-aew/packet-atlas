#!/usr/bin/env bash
set -euo pipefail

echo "🦈 Applying Packet Atlas v4.4 — TShark Fixture Pipeline..."

if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then
  echo "❌ Run this from the app root: /workspaces/packet-atlas/packet-atlas"
  exit 1
fi

mkdir -p scripts/captures src/data/fixtures tests/unit docs

cat > scripts/captures/tshark-export.mjs <<'MJS'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const [, , input, output = 'src/data/fixtures/tshark-export.raw.json'] = process.argv

if (!input) {
  console.error('Usage: node scripts/captures/tshark-export.mjs <capture.pcapng> [output.json]')
  process.exit(1)
}

if (!fs.existsSync(input)) {
  console.error(`Capture file not found: ${input}`)
  process.exit(1)
}

fs.mkdirSync(path.dirname(output), { recursive: true })

const result = spawnSync('tshark', ['-r', input, '-T', 'json', '-x'], {
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 64,
})

if (result.error) {
  console.error('Could not run tshark. Install Wireshark/TShark in the environment first.')
  console.error(result.error.message)
  process.exit(1)
}

if (result.status !== 0) {
  console.error(result.stderr)
  process.exit(result.status ?? 1)
}

fs.writeFileSync(output, result.stdout)
console.log(`✅ exported TShark JSON: ${output}`)
MJS

cat > scripts/captures/normalize-fixture.mjs <<'MJS'
import fs from 'node:fs'
import path from 'node:path'

const [, , input = 'src/data/fixtures/tshark-export.raw.json', output = 'src/data/fixtures/https-example.fixture.json'] = process.argv

if (!fs.existsSync(input)) {
  console.error(`Input TShark JSON not found: ${input}`)
  process.exit(1)
}

const raw = JSON.parse(fs.readFileSync(input, 'utf8'))

const frames = raw.map((packet, index) => {
  const layers = packet?._source?.layers ?? {}
  const frame = layers.frame ?? {}
  const ip = layers.ip ?? layers.ipv6 ?? {}
  const tcp = layers.tcp ?? {}
  const udp = layers.udp ?? {}
  const dns = layers.dns ?? {}
  const tls = layers.tls ?? {}
  const http = layers.http ?? {}

  return {
    frameNumber: Number(frame['frame.number'] ?? index + 1),
    timeRelative: frame['frame.time_relative'] ?? null,
    protocolStack: Object.keys(layers).filter((key) => !key.startsWith('frame_raw')),
    summary: {
      srcIp: ip['ip.src'] ?? ip['ipv6.src'] ?? null,
      dstIp: ip['ip.dst'] ?? ip['ipv6.dst'] ?? null,
      srcPort: tcp['tcp.srcport'] ?? udp['udp.srcport'] ?? null,
      dstPort: tcp['tcp.dstport'] ?? udp['udp.dstport'] ?? null,
      highestProtocol: Object.keys(layers).filter((key) => !key.endsWith('_raw')).at(-1) ?? null,
    },
    fields: { frame, ip, tcp, udp, dns, tls, http },
  }
})

const fixture = {
  id: 'https-example-fixture',
  source: path.basename(input),
  generatedAt: new Date().toISOString(),
  note: 'Normalized from TShark JSON. Attach frameNumber values to scenario stage captureRef later.',
  frames,
}

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, JSON.stringify(fixture, null, 2) + '\n')
console.log(`✅ normalized fixture: ${output}`)
MJS

cat > scripts/captures/validate-fixtures.mjs <<'MJS'
import fs from 'node:fs'
import path from 'node:path'

const fixtureDir = 'src/data/fixtures'
const failures = []

if (!fs.existsSync(fixtureDir)) {
  console.log('⚠️ no fixture directory yet')
  process.exit(0)
}

const files = fs.readdirSync(fixtureDir).filter((file) => file.endsWith('.fixture.json'))

for (const file of files) {
  const full = path.join(fixtureDir, file)
  try {
    const fixture = JSON.parse(fs.readFileSync(full, 'utf8'))
    if (!fixture.id) failures.push(`${file}: missing id`)
    if (!Array.isArray(fixture.frames)) failures.push(`${file}: missing frames[]`)
    for (const frame of fixture.frames ?? []) {
      if (typeof frame.frameNumber !== 'number') failures.push(`${file}: frame without numeric frameNumber`)
      if (!Array.isArray(frame.protocolStack)) failures.push(`${file}: frame ${frame.frameNumber} missing protocolStack[]`)
    }
  } catch (err) {
    failures.push(`${file}: ${err.message}`)
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`❌ ${failure}`)
  process.exit(1)
}

console.log(`✅ fixture validation ok (${files.length} fixture file(s))`)
MJS

cat > src/data/fixtures/https-example.synthetic.fixture.json <<'JSON'
{
  "id": "https-example-synthetic-fixture",
  "source": "synthetic",
  "generatedAt": "static",
  "note": "Educational synthetic fixture. Replace or compare with TShark-normalized fixture later.",
  "frames": [
    {
      "frameNumber": 1,
      "timeRelative": "0.000000",
      "protocolStack": ["frame", "eth", "ip", "udp", "dns"],
      "summary": {
        "srcIp": "192.168.1.10",
        "dstIp": "198.51.100.53",
        "srcPort": "53001",
        "dstPort": "53",
        "highestProtocol": "dns"
      },
      "stageHint": "dns-query"
    }
  ]
}
JSON

cat > docs/capture-fixture-pipeline.md <<'MD'
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
MD

node <<'NODE'
const fs = require('fs')
const pkgPath = 'package.json'
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
pkg.scripts = pkg.scripts || {}
pkg.scripts['capture:export'] = 'node scripts/captures/tshark-export.mjs'
pkg.scripts['capture:normalize'] = 'node scripts/captures/normalize-fixture.mjs'
pkg.scripts['capture:validate'] = 'node scripts/captures/validate-fixtures.mjs'
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
NODE

cat > tests/unit/tsharkFixturePipeline.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('TShark fixture pipeline', () => {
  it('ships offline capture scripts and a synthetic fixture', () => {
    expect(existsSync('scripts/captures/tshark-export.mjs')).toBe(true)
    expect(existsSync('scripts/captures/normalize-fixture.mjs')).toBe(true)
    expect(existsSync('scripts/captures/validate-fixtures.mjs')).toBe(true)
    expect(existsSync('src/data/fixtures/https-example.synthetic.fixture.json')).toBe(true)

    const doc = readFileSync('docs/capture-fixture-pipeline.md', 'utf8')
    expect(doc).toContain('should not parse PCAP/PCAPNG in the browser')
  })
})
TS

python3 <<'PY'
from pathlib import Path
p = Path('src/features/packet-atlas/PacketAtlasPage.tsx')
if p.exists():
    text = p.read_text()
    for old in ['Packet Atlas v4.3', 'Packet Atlas v4.2', 'Packet Atlas v4.1', 'Packet Atlas v4.0']:
        text = text.replace(old, 'Packet Atlas v4.4')
    p.write_text(text)
PY

echo "✅ v4.4 applied — TShark Fixture Pipeline."
echo "🧪 Run: npm run build && npm test && npm run capture:validate"
