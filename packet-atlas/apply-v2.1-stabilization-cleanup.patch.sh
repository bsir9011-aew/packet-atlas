#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' '🧹 Applying Packet Atlas v2.1 — Stabilization & Project Cleanup...'
if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then echo '❌ Run this script from the inner Packet Atlas app folder.'; exit 1; fi
mkdir -p patches/backups/v2.1 scripts docs tests/unit
cp src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/v2.1/PacketAtlasPage.tsx 2>/dev/null || true
cp package.json patches/backups/v2.1/package.json 2>/dev/null || true
cp README.md patches/backups/v2.1/README.md 2>/dev/null || true

cat > README.md <<'MD'
# Packet Atlas

**Packet Atlas** is an interactive client-side atlas for following one data journey across many lenses: user intent, application protocol, TLS, transport, IP, link layer, devices, failure variants and capture fixtures.

It is not a course platform, quiz app or Cyber Career clone. The product model is: **one journey, many observers, many layers**.

## Current baseline scenario

`https://example.com` with frozen assumptions: IPv4, classic DNS over UDP/53, TCP, TLS 1.3, HTTP/1.1, no cache, no service worker, no connection reuse, NAT enabled, Ethernet access medium.

## Main UI areas

- Scenario Variant panel
- Flow Diff & Failure Trace
- Failure Trace Navigator
- Layer Highlight Mode
- Global Journey Map
- Route Timeline
- Side Panel tabs: Inspector / Device / Stack
- Observer Mode
- Stage Deep Dive
- Protocol Mini Diagrams
- Packet Field Explorer
- Device Visibility Matrix
- Encapsulation Transform View
- Protocol Sequence Boards
- Wireshark-style Field Tree
- Capture Fixture Panel

## Commands

```bash
npm run build
npm test
npm run capture:validate
npm run validate:project
npm run atlas:health
npm run validate:all
npm run dev -- --host 0.0.0.0
```

## Design guardrails

- Keep Packet Atlas as an atlas/simulator, not a learning habit platform.
- Add protocol/device/flow visibility before adding generic study features.
- Keep PCAP parsing offline; runtime consumes normalized fixtures.
- Be explicit about scenario assumptions.
- Treat colors as helpful, not as the only meaning carrier.
MD

cat > CHANGELOG.md <<'MD'
# Changelog

## v2.1 — Stabilization & Project Cleanup

- Added project health scripts.
- Added project validation script.
- Added README, changelog and roadmap.
- Kept the app direction focused on atlas/simulator behavior.

## v2.0 — Offline Capture Fixture Pipeline

- Added normalized capture fixture model.
- Added synthetic fixture sample and validation command.

## v1.6–v1.9

- Added Observer Mode, Encapsulation Transform View, Protocol Sequence Boards and Wireshark-style Field Tree.

## v1.1–v1.5

- Added scenario variants, failure impact, visibility matrix, flow diff and failure trace navigator.
MD

cat > ROADMAP.md <<'MD'
# Packet Atlas Roadmap

## Near term

- v2.2 Scenario Authoring System
- v2.3 SSH Connection Journey
- v2.4 Failure Variant Builder UI
- v2.5 NAT State Table View
- v2.6 Stateful Firewall View

## Later

- DNS resolution modes
- HTTP/1.1 vs HTTP/2 variant
- Cinematic Trace Mode
- Packet bytes / hex pane lite
- Real TShark fixture import workflow

## Not in scope

- quizzes
- daily missions
- progress accounts
- backend user profiles
- generic certification training modes
MD

cat > scripts/validate-project-structure.mjs <<'JS'
import fs from 'node:fs'
import path from 'node:path'

const required = [
  'src/features/packet-atlas/PacketAtlasPage.tsx',
  'src/features/packet-atlas/schema/journeyScenarioSchema.ts',
  'src/features/packet-atlas/scenarios/httpsExample.ts',
  'src/features/packet-atlas/store/atlasStore.ts',
  'src/features/packet-atlas/map/GlobalJourneyMap.tsx',
  'src/features/packet-atlas/timeline/RouteTimeline.tsx',
  'src/features/packet-atlas/inspector/PacketInspector.tsx',
  'src/features/packet-atlas/packetAtlas.css',
  'README.md',
  'CHANGELOG.md',
  'ROADMAP.md',
]

const missing = required.filter((file) => !fs.existsSync(path.join(process.cwd(), file)))
if (missing.length) {
  console.error('❌ Missing required project files:')
  for (const file of missing) console.error(`- ${file}`)
  process.exit(1)
}

const css = fs.readFileSync(path.join(process.cwd(), 'src/features/packet-atlas/packetAtlas.css'), 'utf8')
const page = fs.readFileSync(path.join(process.cwd(), 'src/features/packet-atlas/PacketAtlasPage.tsx'), 'utf8')
const checks = [
  ['Packet Atlas page exports UI', page.includes('PacketAtlasPage')],
  ['CSS contains atlas shell', css.includes('atlas-shell')],
  ['CSS contains panels', css.includes('panel-heading')],
]
const failed = checks.filter(([, ok]) => !ok)
if (failed.length) {
  console.error('❌ Project structure checks failed:')
  for (const [label] of failed) console.error(`- ${label}`)
  process.exit(1)
}
console.log('✅ project structure ok')
JS

cat > scripts/atlas-health.mjs <<'JS'
import fs from 'node:fs'
import path from 'node:path'
function exists(p) { return fs.existsSync(path.join(process.cwd(), p)) }
const features = [
  ['Core scenario', 'src/features/packet-atlas/scenarios/httpsExample.ts'],
  ['Variants', 'src/features/packet-atlas/variants/scenarioVariants.ts'],
  ['Failure trace', 'src/features/packet-atlas/flow-diff/VariantFlowDiff.tsx'],
  ['Observer mode', 'src/features/packet-atlas/observer/ObserverModePanel.tsx'],
  ['Encapsulation transform', 'src/features/packet-atlas/encapsulation/EncapsulationTransformView.tsx'],
  ['Protocol sequences', 'src/features/packet-atlas/sequences/ProtocolSequenceBoard.tsx'],
  ['Field tree', 'src/features/packet-atlas/field-tree/WiresharkFieldTree.tsx'],
  ['Capture fixture pipeline', 'src/features/packet-atlas/captures/CaptureFixturePanel.tsx'],
]
console.log('🧭 Packet Atlas health')
for (const [label, file] of features) console.log(`${exists(file) ? '✅' : '⚠️'} ${label}: ${file}`)
JS

python3 <<'PY2'
from pathlib import Path
import json, re
pkg=Path('package.json')
data=json.loads(pkg.read_text())
s=data.setdefault('scripts',{})
s['validate:project']='node scripts/validate-project-structure.mjs'
s['atlas:health']='node scripts/atlas-health.mjs'
s['validate:all']='npm run build && npm test && npm run capture:validate && npm run validate:project'
pkg.write_text(json.dumps(data,indent=2)+'\n')
page=Path('src/features/packet-atlas/PacketAtlasPage.tsx')
text=page.read_text()
text=re.sub(r'Packet Atlas v[0-9.]+','Packet Atlas v2.1',text)
page.write_text(text)
PY2

cat > tests/unit/projectMetadata.test.ts <<'TS'
import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('project metadata', () => {
  it('has roadmap and changelog documents', () => {
    expect(fs.existsSync('README.md')).toBe(true)
    expect(fs.existsSync('CHANGELOG.md')).toBe(true)
    expect(fs.existsSync('ROADMAP.md')).toBe(true)
  })

  it('keeps Packet Atlas scoped as an atlas', () => {
    const readme = fs.readFileSync('README.md', 'utf8')
    expect(readme).toContain('one journey')
    expect(readme).toContain('not a course platform')
  })
})
TS

printf '%s\n' '✅ v2.1 applied — Stabilization & Project Cleanup.'
printf '%s\n' '🧪 Now run: npm run build && npm test && npm run validate:project && npm run atlas:health'
