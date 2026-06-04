#!/usr/bin/env bash
set -euo pipefail

echo "🛠️ Repairing Packet Atlas v3.2 — Performance & Bundle Budget..."

if [ ! -f package.json ]; then
  echo "❌ Run this script from the app root directory, where package.json exists."
  exit 1
fi

mkdir -p patches/backups scripts src/features/packet-atlas/performance

# Safe backups: previous v3.2 patch had a broken cp command. This one always passes source + destination.
if [ -f src/App.tsx ]; then
  cp src/App.tsx "patches/backups/App.before-v3.2-repair.$(date +%Y%m%d%H%M%S).tsx"
fi
if [ -f src/features/packet-atlas/PacketAtlasPage.tsx ]; then
  cp src/features/packet-atlas/PacketAtlasPage.tsx "patches/backups/PacketAtlasPage.before-v3.2-repair.$(date +%Y%m%d%H%M%S).tsx"
fi
if [ -f src/features/packet-atlas/packetAtlas.css ]; then
  cp src/features/packet-atlas/packetAtlas.css "patches/backups/packetAtlas.before-v3.2-repair.$(date +%Y%m%d%H%M%S).css"
fi

cat > src/features/packet-atlas/performance/AtlasLoadingFallback.tsx <<'TSX'
export function AtlasLoadingFallback() {
  return (
    <main className="atlas-loading-fallback" aria-live="polite">
      <div className="atlas-loading-fallback__card">
        <p className="eyebrow">Packet Atlas</p>
        <h1>Loading atlas…</h1>
        <p>Preparing the interactive journey map, inspectors and diagnostic overlays.</p>
      </div>
    </main>
  )
}
TSX

cat > src/App.tsx <<'TSX'
import { Suspense, lazy } from 'react'
import { AtlasLoadingFallback } from './features/packet-atlas/performance/AtlasLoadingFallback'

const PacketAtlasPage = lazy(() =>
  import('./features/packet-atlas/PacketAtlasPage').then((module) => ({
    default: module.PacketAtlasPage,
  })),
)

function App() {
  return (
    <Suspense fallback={<AtlasLoadingFallback />}>
      <PacketAtlasPage />
    </Suspense>
  )
}

export default App
TSX

python3 <<'PY'
from pathlib import Path

page = Path('src/features/packet-atlas/PacketAtlasPage.tsx')
if page.exists():
    text = page.read_text()
    import re
    text = re.sub(r'Packet Atlas v\d+\.\d+', 'Packet Atlas v3.2', text)
    page.write_text(text)

css_path = Path('src/features/packet-atlas/packetAtlas.css')
if css_path.exists():
    css = css_path.read_text()
    marker = '/* === Packet Atlas v3.2 Performance Repair START === */'
    if marker not in css:
        css += r'''

/* === Packet Atlas v3.2 Performance Repair START === */
.atlas-loading-fallback {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.16), transparent 32rem),
    radial-gradient(circle at top right, rgba(124, 58, 237, 0.14), transparent 28rem),
    #020617;
  color: #e5e7eb;
}

.atlas-loading-fallback__card {
  width: min(620px, 100%);
  border: 1px solid #1e293b;
  border-radius: 24px;
  padding: 28px;
  background: rgba(15, 23, 42, 0.78);
  box-shadow: 0 18px 80px rgba(0, 0, 0, 0.28);
}

.atlas-loading-fallback__card h1 {
  margin: 0 0 10px;
  font-size: clamp(2rem, 4vw, 3.6rem);
}

.atlas-loading-fallback__card p:last-child {
  margin: 0;
  color: #94a3b8;
  line-height: 1.55;
}
/* === Packet Atlas v3.2 Performance Repair END === */
'''
        css_path.write_text(css)
PY

cat > scripts/bundle-budget.mjs <<'MJS'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const distDir = 'dist'
const assetsDir = join(distDir, 'assets')
const kib = (bytes) => bytes / 1024
const fmt = (bytes) => `${kib(bytes).toFixed(1)} KiB`

if (!existsSync(distDir) || !existsSync(assetsDir)) {
  console.error('❌ dist/assets not found. Run npm run build first.')
  process.exit(1)
}

const files = readdirSync(assetsDir)
  .map((name) => {
    const path = join(assetsDir, name)
    return { name, path, size: statSync(path).size }
  })
  .sort((a, b) => b.size - a.size)

const jsFiles = files.filter((file) => file.name.endsWith('.js'))
const cssFiles = files.filter((file) => file.name.endsWith('.css'))
const totalJs = jsFiles.reduce((sum, file) => sum + file.size, 0)
const totalCss = cssFiles.reduce((sum, file) => sum + file.size, 0)
const largestJs = jsFiles[0]

console.log('📦 Packet Atlas bundle budget')
console.log(`JS files: ${jsFiles.length} • total JS: ${fmt(totalJs)}`)
console.log(`CSS files: ${cssFiles.length} • total CSS: ${fmt(totalCss)}`)
if (largestJs) console.log(`Largest JS chunk: ${largestJs.name} • ${fmt(largestJs.size)}`)

// Soft budget: fail only if the bundle becomes clearly out of control.
// Vite may warn above 500 KiB; this project is visualization-heavy, so the hard CI limit is higher.
const maxLargestJs = 900 * 1024
const maxTotalJs = 1500 * 1024

let failed = false
if (largestJs && largestJs.size > maxLargestJs) {
  console.error(`❌ Largest JS chunk exceeds ${fmt(maxLargestJs)}.`)
  failed = true
}
if (totalJs > maxTotalJs) {
  console.error(`❌ Total JS exceeds ${fmt(maxTotalJs)}.`)
  failed = true
}

if (failed) {
  process.exit(1)
}

console.log('✅ bundle budget ok')
MJS

npm pkg set "scripts.bundle:budget=node scripts/bundle-budget.mjs" >/dev/null

cat > tests/unit/performanceLazyLoading.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

describe('performance lazy loading repair', () => {
  it('lazy-loads the main PacketAtlasPage from App.tsx', () => {
    const app = readFileSync('src/App.tsx', 'utf8')
    expect(app).toContain('lazy(() =>')
    expect(app).toContain('PacketAtlasPage')
    expect(app).toContain('Suspense')
  })

  it('defines bundle:budget script', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(pkg.scripts['bundle:budget']).toBe('node scripts/bundle-budget.mjs')
  })
})
TS

echo "✅ v3.2 repair applied."
echo "🧪 Run: npm run build && npm test && npm run bundle:budget"
