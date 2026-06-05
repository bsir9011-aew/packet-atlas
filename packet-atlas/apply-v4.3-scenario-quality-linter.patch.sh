#!/usr/bin/env bash
set -euo pipefail

echo "🧪 Applying Packet Atlas v4.3 — Scenario Quality Linter..."

if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then
  echo "❌ Run this from the app root: /workspaces/packet-atlas/packet-atlas"
  exit 1
fi

mkdir -p scripts tests/unit

cat > scripts/scenario-quality-lint.mjs <<'MJS'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const scenarioPath = path.join(root, 'src/features/packet-atlas/scenarios/httpsExample.ts')
const failures = []
const warnings = []

function fail(message) { failures.push(message) }
function warn(message) { warnings.push(message) }
function has(text, needle) { return text.includes(needle) }

if (!fs.existsSync(scenarioPath)) {
  fail(`Missing baseline scenario file: ${scenarioPath}`)
} else {
  const text = fs.readFileSync(scenarioPath, 'utf8')

  const requiredStageIds = [
    'url-intent',
    'browser-checks',
    'dns-query',
    'arp-gateway',
    'lan-frame',
    'router-nat-dns',
    'dns-response',
    'tcp-handshake',
    'tls-handshake',
    'http-request',
    'reverse-proxy',
    'app-db',
    'http-response',
    'browser-render',
  ]

  for (const id of requiredStageIds) {
    if (!has(text, `id: '${id}'`) && !has(text, `id: "${id}"`) && !has(text, `"id": "${id}"`)) {
      fail(`Baseline HTTPS scenario should contain stage id: ${id}`)
    }
  }

  const orderChecks = [
    ['dns-query', 'tcp-handshake', 'DNS should happen before TCP connection setup in the baseline HTTPS path.'],
    ['tcp-handshake', 'tls-handshake', 'TCP handshake should happen before TLS handshake.'],
    ['tls-handshake', 'http-request', 'TLS should happen before HTTP request in HTTPS baseline.'],
    ['arp-gateway', 'lan-frame', 'ARP/default-gateway resolution should happen before the first LAN frame.'],
    ['http-request', 'reverse-proxy', 'HTTP request should reach edge/proxy before app handling.'],
    ['app-db', 'http-response', 'Application handling should happen before HTTP response.'],
  ]

  for (const [before, after, message] of orderChecks) {
    const a = text.indexOf(before)
    const b = text.indexOf(after)
    if (a === -1 || b === -1) warn(`Could not verify order: ${before} -> ${after}`)
    else if (a > b) fail(message)
  }

  for (const needle of ['payloadRef','layerFocus','relations','whatUserSees','whatReallyHappens','easyToConfuse','whyItMatters','analogy','mapPosition']) {
    if (!has(text, needle)) fail(`Scenario should include educational/model field: ${needle}`)
  }

  if ((has(text, "ipVersion: 'ipv4'") || has(text, 'ipVersion: "ipv4"')) && !has(text, 'arp-gateway')) {
    fail('IPv4 baseline should include ARP/default-gateway neighbor resolution.')
  }

  if ((has(text, "ipVersion: 'ipv6'") || has(text, 'ipVersion: "ipv6"')) && has(text, 'arp-gateway')) {
    fail('IPv6 scenario should not use ARP as its neighbor discovery model.')
  }
}

const variantPath = path.join(root, 'src/features/packet-atlas/variants/scenarioVariants.ts')
if (fs.existsSync(variantPath)) {
  const variantText = fs.readFileSync(variantPath, 'utf8')
  for (const required of ['breakStageId', 'affectedStageIds', 'diagnosticAngle']) {
    if (!variantText.includes(required)) warn(`Variant model does not obviously include ${required}`)
  }
} else {
  warn('Variant file not found; skipping variant quality checks.')
}

console.log('🧭 Packet Atlas scenario quality lint')
for (const warning of warnings) console.log(`⚠️ ${warning}`)
if (failures.length > 0) {
  for (const failure of failures) console.error(`❌ ${failure}`)
  process.exit(1)
}
console.log('✅ scenario quality ok')
MJS

node <<'NODE'
const fs = require('fs')
const pkgPath = 'package.json'
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
pkg.scripts = pkg.scripts || {}
pkg.scripts['scenario:lint'] = 'node scripts/scenario-quality-lint.mjs'
pkg.scripts['atlas:quality'] = 'npm run validate:project && npm run scenario:lint'
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
NODE

cat > tests/unit/scenarioQualityLintScript.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('scenario quality linter script', () => {
  it('exists and checks protocol ordering', () => {
    expect(existsSync('scripts/scenario-quality-lint.mjs')).toBe(true)
    const script = readFileSync('scripts/scenario-quality-lint.mjs', 'utf8')
    expect(script).toContain('DNS should happen before TCP')
    expect(script).toContain('TLS should happen before HTTP request')
    expect(script).toContain('scenario quality ok')
  })
})
TS

python3 <<'PY'
from pathlib import Path
p = Path('src/features/packet-atlas/PacketAtlasPage.tsx')
if p.exists():
    text = p.read_text()
    for old in ['Packet Atlas v4.2', 'Packet Atlas v4.1', 'Packet Atlas v4.0']:
        text = text.replace(old, 'Packet Atlas v4.3')
    p.write_text(text)
PY

echo "✅ v4.3 applied — Scenario Quality Linter."
echo "🧪 Run: npm run build && npm test && npm run scenario:lint"
