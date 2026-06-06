import fs from 'node:fs'
import path from 'node:path'

const dir = 'src/features/packet-atlas/scenarios'
const files = fs
  .readdirSync(dir)
  .filter((file) => file.endsWith('.manifest.v2.json'))

const failures = []
const ids = new Set()
const allowedCapabilities = new Set([
  'journey',
  'diagnostics',
  'protocols',
  'internals',
  'capture',
])

for (const file of files) {
  const full = path.join(dir, file)

  try {
    const manifest = JSON.parse(fs.readFileSync(full, 'utf8'))

    for (const required of [
      'id',
      'title',
      'shortTitle',
      'status',
      'protocolFamily',
      'description',
      'scenarioModule',
      'qualityProfile',
    ]) {
      if (!manifest[required]) failures.push(`${file}: missing ${required}`)
    }

    if (manifest.schemaVersion !== 2) {
      failures.push(`${file}: schemaVersion must equal 2`)
    }

    if (ids.has(manifest.id)) failures.push(`${file}: duplicate id ${manifest.id}`)
    ids.add(manifest.id)

    if (!fs.existsSync(manifest.scenarioModule)) {
      failures.push(
        `${file}: scenarioModule does not exist: ${manifest.scenarioModule}`,
      )
    }

    if (!Array.isArray(manifest.capabilities)) {
      failures.push(`${file}: capabilities must be an array`)
    }

    for (const capability of manifest.capabilities ?? []) {
      if (!allowedCapabilities.has(capability)) {
        failures.push(`${file}: unsupported capability ${capability}`)
      }
    }

    if (!Array.isArray(manifest.fixtureIds)) {
      failures.push(`${file}: fixtureIds must be an array`)
    }
  } catch (error) {
    failures.push(`${file}: ${error.message}`)
  }
}

if (files.length === 0) failures.push('No scenario manifest v2 files found.')

if (failures.length > 0) {
  for (const failure of failures) console.error(`❌ ${failure}`)
  process.exit(1)
}

console.log(
  `✅ scenario manifest v2 validation ok (${files.length} manifest file(s))`,
)
