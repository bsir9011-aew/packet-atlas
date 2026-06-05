#!/usr/bin/env bash
set -euo pipefail
echo "🔗 Applying Packet Atlas v5.3 — Scenario ↔ Capture Cross-Validator..."
if [ ! -f package.json ] || [ ! -d src/data/fixtures ]; then echo "❌ Run this from /workspaces/packet-atlas/packet-atlas"; exit 1; fi
mkdir -p scripts/captures tests/unit patches/backups
cp package.json patches/backups/package.before-v5.3.json

cat > scripts/captures/cross-validate-scenario-fixtures.mjs <<'MJS'
import fs from 'node:fs'
import path from 'node:path'

const scenarioPath = 'src/features/packet-atlas/scenarios/httpsExample.ts'
const fixtureDir = 'src/data/fixtures'
const failures = []
const warnings = []

if (!fs.existsSync(scenarioPath)) {
  console.error(`❌ missing scenario file: ${scenarioPath}`)
  process.exit(1)
}

const scenarioText = fs.readFileSync(scenarioPath, 'utf8')
const stagesStart = scenarioText.indexOf('stages:')
const stageText = stagesStart >= 0 ? scenarioText.slice(stagesStart) : scenarioText
const stageIds = new Set([...stageText.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]))

const files = fs.readdirSync(fixtureDir).filter((file) => file.includes('.fixture') && file.endsWith('.json'))

for (const file of files) {
  const full = path.join(fixtureDir, file)
  const fixture = JSON.parse(fs.readFileSync(full, 'utf8'))
  const seenFrameNumbers = new Set()

  for (const frame of fixture.frames ?? []) {
    if (typeof frame.frameNumber === 'number') {
      if (seenFrameNumbers.has(frame.frameNumber)) failures.push(`${file}: duplicate frameNumber ${frame.frameNumber}`)
      seenFrameNumbers.add(frame.frameNumber)
    }
    if (frame.stageHint && !stageIds.has(frame.stageHint)) failures.push(`${file}: unknown stageHint ${frame.stageHint}`)
    if (!Array.isArray(frame.protocolStack)) warnings.push(`${file}: frame ${frame.frameNumber ?? '?'} has no protocolStack`)
  }

  for (const plan of fixture.stageFramePlan ?? []) {
    if (!stageIds.has(plan.stageId)) failures.push(`${file}: unknown stageFramePlan stageId ${plan.stageId}`)
    if (!Array.isArray(plan.requiredLayers) || plan.requiredLayers.length === 0) {
      failures.push(`${file}: ${plan.stageId} requires at least one layer`)
    }
  }
}

for (const warning of warnings) console.log(`⚠️ ${warning}`)
if (failures.length > 0) {
  for (const failure of failures) console.error(`❌ ${failure}`)
  process.exit(1)
}

console.log(`✅ scenario ↔ capture cross-validation ok (${files.length} fixture file(s), ${stageIds.size} scenario stage id(s))`)
MJS

node <<'NODE'
const fs = require('fs')
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
pkg.scripts = pkg.scripts || {}
pkg.scripts['capture:cross-validate'] = 'node scripts/captures/cross-validate-scenario-fixtures.mjs'
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
NODE

python3 <<'PY'
from pathlib import Path
p = Path('scripts/verify-packet-atlas.mjs')
if p.exists():
    text = p.read_text()
    line = "  ['Capture fixtures', 'npm', ['run', 'capture:validate']],"
    addition = line + "\n  ['Scenario/capture cross-validation', 'npm', ['run', 'capture:cross-validate']],"
    if 'Scenario/capture cross-validation' not in text and line in text:
        text = text.replace(line, addition, 1)
        p.write_text(text)
PY

cat > tests/unit/scenarioCaptureCrossValidator.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('scenario capture cross-validator', () => {
  it('checks stage hints and frame plans against scenario stage ids', () => {
    const path = 'scripts/captures/cross-validate-scenario-fixtures.mjs'
    expect(existsSync(path)).toBe(true)
    const script = readFileSync(path, 'utf8')
    expect(script).toContain('unknown stageHint')
    expect(script).toContain('unknown stageFramePlan stageId')
  })
})
TS

python3 <<'PY'
from pathlib import Path
import re
p = Path('src/features/packet-atlas/PacketAtlasPage.tsx')
if p.exists():
    p.write_text(re.sub(r'Packet Atlas v\d+\.\d+', 'Packet Atlas v5.3', p.read_text(), count=1))
PY
echo "✅ v5.3 applied. Run: npm run build && npm test && npm run capture:cross-validate"
