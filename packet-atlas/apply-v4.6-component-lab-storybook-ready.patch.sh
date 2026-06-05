#!/usr/bin/env bash
set -euo pipefail

echo "📚 Applying Packet Atlas v4.6 — Component Lab / Storybook-ready Catalog..."

if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then
  echo "❌ Run this from the app root: /workspaces/packet-atlas/packet-atlas"
  exit 1
fi

mkdir -p src/features/packet-atlas/component-lab scripts tests/unit docs

cat > src/features/packet-atlas/component-lab/componentInventory.ts <<'TS'
export type ComponentInventoryItem = {
  name: string
  area: 'journey' | 'diagnostics' | 'protocols' | 'internals' | 'capture' | 'shared'
  purpose: string
  stability: 'core' | 'experimental' | 'needs-review'
}

export const componentInventory: ComponentInventoryItem[] = [
  { name: 'GlobalJourneyMap', area: 'journey', purpose: 'Main semantic map of the request/response journey.', stability: 'core' },
  { name: 'RouteTimeline', area: 'journey', purpose: 'Linear stage navigation and stage selection.', stability: 'core' },
  { name: 'PacketInspector', area: 'journey', purpose: 'Layer-specific view of the active stage and payload projection.', stability: 'core' },
  { name: 'LayerHighlightMode', area: 'journey', purpose: 'Highlights where a selected layer participates in the journey.', stability: 'core' },
  { name: 'ScenarioVariantPanel', area: 'diagnostics', purpose: 'Switches happy path and failure variants.', stability: 'core' },
  { name: 'VariantFlowDiff', area: 'diagnostics', purpose: 'Compares baseline flow with a selected failure variant.', stability: 'core' },
  { name: 'WiresharkFieldTree', area: 'internals', purpose: 'Educational protocol field tree inspired by Wireshark.', stability: 'core' },
  { name: 'CaptureFixturePanel', area: 'capture', purpose: 'Shows whether selected stage is synthetic or capture-backed.', stability: 'experimental' },
  { name: 'SignalStripCanvas', area: 'protocols', purpose: 'Symbolic physical-layer signal visualization.', stability: 'experimental' },
]

export function groupInventoryByArea() {
  return componentInventory.reduce<Record<string, ComponentInventoryItem[]>>((groups, item) => {
    groups[item.area] ??= []
    groups[item.area].push(item)
    return groups
  }, {})
}
TS

cat > src/features/packet-atlas/component-lab/ComponentLab.tsx <<'TSX'
import { componentInventory, groupInventoryByArea } from './componentInventory'

const areaLabels: Record<string, string> = {
  journey: '🧭 Journey',
  diagnostics: '🛠️ Diagnostics',
  protocols: '🔁 Protocols',
  internals: '🔬 Internals',
  capture: '🦈 Capture',
  shared: '🧩 Shared',
}

export function ComponentLab() {
  const groups = groupInventoryByArea()

  return (
    <section className="component-lab">
      <div className="panel-heading">
        <span>Component Lab</span>
        <small>{componentInventory.length} cataloged</small>
      </div>
      <div className="component-lab__intro">
        <strong>Storybook-ready inventory, without pulling Storybook into the app yet.</strong>
        <p>Use this as a lightweight catalog while the atlas stabilizes. Full Storybook can come later if the component API settles.</p>
      </div>
      <div className="component-lab__groups">
        {Object.entries(groups).map(([area, items]) => (
          <article key={area} className="component-lab__group">
            <h3>{areaLabels[area] ?? area}</h3>
            <div className="component-lab__items">
              {items.map((item) => (
                <div key={item.name} className="component-lab__item">
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.purpose}</p>
                  </div>
                  <span>{item.stability}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
TSX

cat > scripts/component-inventory.mjs <<'MJS'
import fs from 'node:fs'
import path from 'node:path'

const root = 'src/features/packet-atlas'
const files = []

function walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.name.endsWith('.tsx')) files.push(full)
  }
}

walk(root)

console.log('📚 Packet Atlas component inventory')
for (const file of files.sort()) console.log(`- ${file}`)
console.log(`✅ ${files.length} TSX component file(s) found`)
MJS

cat > docs/component-lab.md <<'MD'
# Component Lab

v4.6 intentionally does **not** install full Storybook yet.

Reason: Packet Atlas is still stabilizing its domain model and workspace layout.
A lightweight component catalog is safer than a heavy Storybook dependency pass.

Good future Storybook candidates:

- GlobalJourneyMap
- RouteTimeline
- PacketInspector
- LayerHighlightMode
- ScenarioVariantPanel
- VariantFlowDiff
- WiresharkFieldTree
- CaptureFixturePanel
- SignalStripCanvas
MD

node <<'NODE'
const fs = require('fs')
const pkgPath = 'package.json'
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
pkg.scripts = pkg.scripts || {}
pkg.scripts['component:inventory'] = 'node scripts/component-inventory.mjs'
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
NODE

python3 <<'PY'
from pathlib import Path

page = Path('src/features/packet-atlas/PacketAtlasPage.tsx')
if not page.exists():
    raise SystemExit('PacketAtlasPage.tsx not found; cannot integrate ComponentLab safely.')

text = page.read_text()

if "ComponentLab" not in text:
    marker = "import './packetAtlas.css'"
    if marker in text:
        text = text.replace(marker, "import { ComponentLab } from './component-lab/ComponentLab'\n" + marker)
    else:
        text = "import { ComponentLab } from './component-lab/ComponentLab'\n" + text

if "<ComponentLab" not in text:
    insert = "\n          <details className=\"component-lab-details\"><summary>Component Lab</summary><ComponentLab /></details>\n"
    if "</main>" in text:
        text = text.replace("</main>", insert + "        </main>", 1)
    else:
        raise SystemExit('Could not find </main> to insert ComponentLab.')

for old in ['Packet Atlas v4.5', 'Packet Atlas v4.4', 'Packet Atlas v4.3', 'Packet Atlas v4.2', 'Packet Atlas v4.1', 'Packet Atlas v4.0']:
    text = text.replace(old, 'Packet Atlas v4.6')

page.write_text(text)
PY

CSS_FILE="src/features/packet-atlas/packetAtlas.css"
if [ -f "$CSS_FILE" ] && ! grep -q "component-lab-details" "$CSS_FILE"; then
cat >> "$CSS_FILE" <<'CSS'

/* === Packet Atlas v4.6 Component Lab === */

.component-lab-details {
  border: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.76);
  border-radius: 22px;
  overflow: hidden;
}

.component-lab-details > summary {
  cursor: pointer;
  padding: 14px 16px;
  font-weight: 900;
  color: #bae6fd;
  background: rgba(2, 6, 23, 0.5);
}

.component-lab {
  border-top: 1px solid #1e293b;
}

.component-lab__intro {
  padding: 14px 16px;
  color: #cbd5e1;
  border-bottom: 1px solid #1e293b;
}

.component-lab__intro p {
  margin: 6px 0 0;
  color: #94a3b8;
}

.component-lab__groups {
  display: grid;
  gap: 14px;
  padding: 14px;
}

.component-lab__group {
  border: 1px solid #1e293b;
  border-radius: 18px;
  background: rgba(2, 6, 23, 0.45);
  padding: 14px;
}

.component-lab__group h3 {
  margin: 0 0 10px;
}

.component-lab__items {
  display: grid;
  gap: 8px;
}

.component-lab__item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid #1e293b;
  border-radius: 14px;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.6);
}

.component-lab__item p {
  margin: 4px 0 0;
  color: #94a3b8;
}

.component-lab__item span {
  color: #7dd3fc;
  white-space: nowrap;
  font-size: 0.82rem;
}
CSS
fi

cat > tests/unit/componentInventory.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { componentInventory, groupInventoryByArea } from '../../src/features/packet-atlas/component-lab/componentInventory'

describe('component inventory', () => {
  it('catalogs core atlas components by area', () => {
    expect(componentInventory.length).toBeGreaterThan(5)
    expect(componentInventory.some((item) => item.name === 'GlobalJourneyMap')).toBe(true)
    expect(componentInventory.some((item) => item.area === 'diagnostics')).toBe(true)
    expect(groupInventoryByArea().journey.length).toBeGreaterThan(0)
  })
})
TS

echo "✅ v4.6 applied — Component Lab / Storybook-ready Catalog."
echo "🧪 Run: npm run build && npm test && npm run component:inventory"
