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
