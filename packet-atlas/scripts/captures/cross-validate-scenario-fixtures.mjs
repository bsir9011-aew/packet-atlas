import fs from 'node:fs'
import path from 'node:path'

const scenarioDir = 'src/features/packet-atlas/scenarios'
const fixtureDir = 'src/data/fixtures'
const failures = []
const warnings = []

const manifestFiles = fs
  .readdirSync(scenarioDir)
  .filter((file) => file.endsWith('.manifest.v2.json'))

const fixturesById = new Map()

for (const file of fs.readdirSync(fixtureDir).filter((name) => name.endsWith('.json'))) {
  const full = path.join(fixtureDir, file)
  try {
    const fixture = JSON.parse(fs.readFileSync(full, 'utf8'))
    if (fixture.id) fixturesById.set(fixture.id, { file, fixture })
  } catch {
    warnings.push(`${file}: skipped non-JSON or malformed fixture candidate`)
  }
}

for (const manifestFile of manifestFiles) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(scenarioDir, manifestFile), 'utf8'),
  )

  if (!manifest.qualityProfile?.requiresCaptureCrossValidation) continue

  const scenarioText = fs.readFileSync(manifest.scenarioModule, 'utf8')
  const stagesStart = scenarioText.indexOf('stages:')
  const stageText =
    stagesStart >= 0 ? scenarioText.slice(stagesStart) : scenarioText
  const stageIds = new Set(
    [...stageText.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(
      (match) => match[1],
    ),
  )

  for (const fixtureId of manifest.fixtureIds ?? []) {
    const entry = fixturesById.get(fixtureId)

    if (!entry) {
      failures.push(`${manifestFile}: fixture id not found: ${fixtureId}`)
      continue
    }

    const seenFrameNumbers = new Set()

    for (const frame of entry.fixture.frames ?? []) {
      if (typeof frame.frameNumber === 'number') {
        if (seenFrameNumbers.has(frame.frameNumber)) {
          failures.push(
            `${entry.file}: duplicate frameNumber ${frame.frameNumber}`,
          )
        }
        seenFrameNumbers.add(frame.frameNumber)
      }

      if (frame.stageHint && !stageIds.has(frame.stageHint)) {
        failures.push(`${entry.file}: unknown stageHint ${frame.stageHint}`)
      }
    }

    for (const plan of entry.fixture.stageFramePlan ?? []) {
      if (!stageIds.has(plan.stageId)) {
        failures.push(
          `${entry.file}: unknown stageFramePlan stageId ${plan.stageId}`,
        )
      }

      if (
        !Array.isArray(plan.requiredLayers) ||
        plan.requiredLayers.length === 0
      ) {
        failures.push(
          `${entry.file}: ${plan.stageId} requires at least one layer`,
        )
      }
    }
  }
}

for (const warning of warnings) console.log(`⚠️ ${warning}`)

if (failures.length > 0) {
  for (const failure of failures) console.error(`❌ ${failure}`)
  process.exit(1)
}

console.log(
  `✅ manifest-driven scenario ↔ capture cross-validation ok (${manifestFiles.length} manifest file(s))`,
)
