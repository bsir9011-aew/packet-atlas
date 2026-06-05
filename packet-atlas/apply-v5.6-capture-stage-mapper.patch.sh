#!/usr/bin/env bash
set -euo pipefail
echo "🗺️ Applying Packet Atlas v5.6 — Capture Stage Mapper..."
if [ ! -f package.json ] || [ ! -d scripts/captures ]; then echo "❌ Run this from /workspaces/packet-atlas/packet-atlas"; exit 1; fi
mkdir -p scripts/captures docs/captures tests/unit patches/backups
cp package.json patches/backups/package.before-v5.6.json

cat > scripts/captures/map-fixture-to-stages.mjs <<'MJS'
import fs from 'node:fs'
import path from 'node:path'

const [, , input, outputArg] = process.argv

if (!input) {
  console.error('Usage: node scripts/captures/map-fixture-to-stages.mjs <fixture.json> [mapping-output.json]')
  process.exit(1)
}

if (!fs.existsSync(input)) {
  console.error(`Fixture not found: ${input}`)
  process.exit(1)
}

const fixture = JSON.parse(fs.readFileSync(input, 'utf8'))
const output = outputArg ?? input.replace(/\.json$/, '.mapping.json')

function includes(frame, layer) {
  return (frame.protocolStack ?? []).includes(layer)
}

function port(frame, name) {
  return String(frame.summary?.[name] ?? '')
}

function suggest(frame) {
  if (includes(frame, 'arp')) {
    return { stageId: 'arp-gateway', confidence: 'high', reason: 'ARP layer present.' }
  }

  if (includes(frame, 'dns')) {
    if (port(frame, 'dstPort') === '53') {
      return { stageId: 'dns-query', confidence: 'high', reason: 'DNS frame addressed to destination port 53.' }
    }
    if (port(frame, 'srcPort') === '53') {
      return { stageId: 'dns-response', confidence: 'high', reason: 'DNS frame sourced from port 53.' }
    }
    return { stageId: 'dns-query', confidence: 'medium', reason: 'DNS layer present but direction is unclear.' }
  }

  if (includes(frame, 'tls')) {
    return { stageId: 'tls-handshake', confidence: 'medium', reason: 'TLS layer present; inspect handshake type manually.' }
  }

  if (includes(frame, 'http')) {
    return { stageId: 'http-request', confidence: 'low', reason: 'HTTP layer present; confirm request/response direction manually.' }
  }

  if (includes(frame, 'tcp') && (port(frame, 'dstPort') === '443' || port(frame, 'srcPort') === '443')) {
    return { stageId: 'tcp-handshake', confidence: 'medium', reason: 'TCP/443 frame; inspect flags manually.' }
  }

  return { stageId: null, confidence: 'none', reason: 'No safe stage suggestion.' }
}

const mappings = (fixture.frames ?? []).map((frame) => ({
  frameNumber: frame.frameNumber,
  protocolStack: frame.protocolStack ?? [],
  summary: frame.summary ?? {},
  suggestion: suggest(frame),
}))

const result = {
  fixtureId: fixture.id ?? path.basename(input),
  generatedAt: new Date().toISOString(),
  warning: 'Suggestions are heuristics. Review every mapping before attaching it to a scenario.',
  mappings,
}

fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n')
console.log(`✅ capture stage mapping suggestions written: ${output}`)
console.log(`⚠️ review manually before using captureRef`)
MJS

node <<'NODE'
const fs = require('fs')
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
pkg.scripts = pkg.scripts || {}
pkg.scripts['capture:map'] = 'node scripts/captures/map-fixture-to-stages.mjs'
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
NODE

cat > docs/captures/capture-stage-mapper.md <<'MD'
# Capture Stage Mapper

The mapper produces suggestions, not truth.

Run:

```bash
npm run capture:map -- src/data/fixtures/https-example.synthetic.fixture.json
```

It uses conservative heuristics such as:

- ARP layer → `arp-gateway`
- DNS to port 53 → `dns-query`
- DNS from port 53 → `dns-response`
- TLS layer → possible `tls-handshake`
- TCP/443 → possible `tcp-handshake`

Every suggestion must be reviewed before attaching it to a scenario.
MD

cat > tests/unit/captureStageMapperScript.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('capture stage mapper', () => {
  it('uses conservative mapping heuristics', () => {
    const path = 'scripts/captures/map-fixture-to-stages.mjs'
    expect(existsSync(path)).toBe(true)
    const script = readFileSync(path, 'utf8')
    expect(script).toContain('Suggestions are heuristics')
    expect(script).toContain('arp-gateway')
    expect(script).toContain('dns-query')
  })
})
TS

python3 <<'PY'
from pathlib import Path
import re
p = Path('src/features/packet-atlas/PacketAtlasPage.tsx')
if p.exists():
    p.write_text(re.sub(r'Packet Atlas v\d+\.\d+', 'Packet Atlas v5.6', p.read_text(), count=1))
PY

echo "✅ v5.6 applied."
echo "🗺️ Example: npm run capture:map -- src/data/fixtures/https-example.synthetic.fixture.json"
