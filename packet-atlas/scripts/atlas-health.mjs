import fs from 'node:fs'
import path from 'node:path'

function exists(p) {
  return fs.existsSync(path.join(process.cwd(), p))
}

const features = [
  ['Core HTTPS scenario', 'src/features/packet-atlas/scenarios/httpsExample.ts'],
  ['SSH scenario', 'src/features/packet-atlas/scenarios/sshConnectionScenario.ts'],
  ['Scenario registry', 'src/features/packet-atlas/scenarios/scenarioRegistry.ts'],
  ['Scenario manifest v2', 'src/features/packet-atlas/scenarios/httpsExample.manifest.v2.json'],
  ['Variants', 'src/features/packet-atlas/variants/scenarioVariants.ts'],
  ['Flow diff', 'src/features/packet-atlas/diff/VariantFlowDiff.tsx'],
  ['Observer mode', 'src/features/packet-atlas/observer/ObserverModePanel.tsx'],
  ['Encapsulation transform', 'src/features/packet-atlas/encapsulation/EncapsulationTransformView.tsx'],
  ['Protocol sequences', 'src/features/packet-atlas/sequences/ProtocolSequenceBoard.tsx'],
  ['Field tree', 'src/features/packet-atlas/field-tree/WiresharkFieldTree.tsx'],
  ['Capture fixture panel', 'src/features/packet-atlas/captures/CaptureFixturePanel.tsx'],
  ['Capture-aware inspector', 'src/features/packet-atlas/capture-inspector/CaptureAwareInspector.tsx'],
  ['Capture cross-validator', 'scripts/captures/cross-validate-scenario-fixtures.mjs'],
  ['Capture stage mapper', 'scripts/captures/map-fixture-to-stages.mjs'],
  ['Visual regression config', 'playwright.visual.config.ts'],
  ['Root CI workflow', '../.github/workflows/quality.yml'],
]

let warnings = 0

console.log('🧭 Packet Atlas health')
for (const [label, file] of features) {
  const ok = exists(file)
  if (!ok) warnings += 1
  console.log(`${ok ? '✅' : '⚠️'} ${label}: ${file}`)
}

if (warnings > 0) {
  console.log(`⚠️ health warnings: ${warnings}`)
  process.exitCode = 1
} else {
  console.log('✅ health ok')
}
