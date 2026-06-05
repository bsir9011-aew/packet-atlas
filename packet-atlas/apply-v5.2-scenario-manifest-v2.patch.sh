#!/usr/bin/env bash
set -euo pipefail
echo "🧱 Applying Packet Atlas v5.2 — Scenario Manifest v2 Groundwork..."
if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then echo "❌ Run this from /workspaces/packet-atlas/packet-atlas"; exit 1; fi
mkdir -p src/features/packet-atlas/schema src/features/packet-atlas/scenarios scripts tests/unit docs patches/backups
cp package.json patches/backups/package.before-v5.2.json

cat > src/features/packet-atlas/schema/scenarioManifestV2.ts <<'TS'
import { z } from 'zod'

export const ScenarioManifestV2Schema = z.object({
  schemaVersion: z.literal(2),
  id: z.string().min(1),
  title: z.string().min(1),
  scenarioModule: z.string().min(1),
  capabilities: z.array(
    z.enum([
      'journey',
      'diagnostics',
      'protocols',
      'internals',
      'capture',
    ]),
  ),
  fixtureIds: z.array(z.string()).default([]),
  qualityProfile: z.object({
    requiresScenarioLint: z.boolean(),
    requiresCaptureCrossValidation: z.boolean(),
    supportsRealCapture: z.boolean(),
  }),
})

export type ScenarioManifestV2 = z.infer<typeof ScenarioManifestV2Schema>
TS

cat > src/features/packet-atlas/scenarios/httpsExample.manifest.v2.json <<'JSON'
{
  "schemaVersion": 2,
  "id": "https-example-basic",
  "title": "Opening https://example.com",
  "scenarioModule": "src/features/packet-atlas/scenarios/httpsExample.ts",
  "capabilities": [
    "journey",
    "diagnostics",
    "protocols",
    "internals",
    "capture"
  ],
  "fixtureIds": [
    "https-example-synthetic-fixture",
    "https-basic-real-placeholder"
  ],
  "qualityProfile": {
    "requiresScenarioLint": true,
    "requiresCaptureCrossValidation": true,
    "supportsRealCapture": true
  }
}
JSON

cat > scripts/validate-scenario-manifests.mjs <<'MJS'
import fs from 'node:fs'
import path from 'node:path'

const dir = 'src/features/packet-atlas/scenarios'
const files = fs.readdirSync(dir).filter((file) => file.endsWith('.manifest.v2.json'))
const failures = []
const allowedCapabilities = new Set(['journey', 'diagnostics', 'protocols', 'internals', 'capture'])

for (const file of files) {
  const full = path.join(dir, file)
  try {
    const manifest = JSON.parse(fs.readFileSync(full, 'utf8'))
    if (manifest.schemaVersion !== 2) failures.push(`${file}: schemaVersion must equal 2`)
    if (!manifest.id) failures.push(`${file}: missing id`)
    if (!manifest.title) failures.push(`${file}: missing title`)
    if (!manifest.scenarioModule || !fs.existsSync(manifest.scenarioModule)) {
      failures.push(`${file}: scenarioModule does not exist: ${manifest.scenarioModule}`)
    }
    if (!Array.isArray(manifest.capabilities)) failures.push(`${file}: capabilities must be an array`)
    for (const capability of manifest.capabilities ?? []) {
      if (!allowedCapabilities.has(capability)) failures.push(`${file}: unsupported capability ${capability}`)
    }
    if (!Array.isArray(manifest.fixtureIds)) failures.push(`${file}: fixtureIds must be an array`)
    if (!manifest.qualityProfile) failures.push(`${file}: missing qualityProfile`)
  } catch (error) {
    failures.push(`${file}: ${error.message}`)
  }
}

if (files.length === 0) failures.push('No scenario manifest v2 files found.')

if (failures.length > 0) {
  for (const failure of failures) console.error(`❌ ${failure}`)
  process.exit(1)
}

console.log(`✅ scenario manifest v2 validation ok (${files.length} manifest file(s))`)
MJS

node <<'NODE'
const fs = require('fs')
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
pkg.scripts = pkg.scripts || {}
pkg.scripts['scenario:manifest:validate'] = 'node scripts/validate-scenario-manifests.mjs'
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
NODE

cat > docs/scenario-manifest-v2.md <<'MD'
# Scenario Manifest v2

v5.2 adds a versioned manifest around the existing TypeScript scenario.

This is deliberately a safe groundwork step, not a risky full migration of the baseline scenario to JSON.

The manifest declares:

- scenario identity,
- source module,
- supported workspaces,
- fixture relationships,
- required quality checks.

Run:

```bash
npm run scenario:manifest:validate
```
MD

cat > tests/unit/scenarioManifestV2.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import manifest from '../../src/features/packet-atlas/scenarios/httpsExample.manifest.v2.json'
import { ScenarioManifestV2Schema } from '../../src/features/packet-atlas/schema/scenarioManifestV2'

describe('scenario manifest v2', () => {
  it('validates the baseline HTTPS manifest', () => {
    const result = ScenarioManifestV2Schema.safeParse(manifest)
    expect(result.success).toBe(true)
  })
})
TS

python3 <<'PY'
from pathlib import Path
import re
p = Path('src/features/packet-atlas/PacketAtlasPage.tsx')
if p.exists():
    text = re.sub(r'Packet Atlas v\d+\.\d+', 'Packet Atlas v5.2', p.read_text(), count=1)
    p.write_text(text)
PY
echo "✅ v5.2 applied. Run: npm run build && npm test && npm run scenario:manifest:validate"
