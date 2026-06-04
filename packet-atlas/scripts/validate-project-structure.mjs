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
