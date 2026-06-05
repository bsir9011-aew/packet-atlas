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
