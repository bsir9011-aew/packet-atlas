import fs from 'node:fs'
import path from 'node:path'

const fixtureDir = 'src/data/fixtures'
const required = ['https-example.synthetic.fixture.json', 'https-basic.real.fixture.json']
const localOnlyPatterns = [/\.pcapng$/i, /\.pcap$/i, /\.raw\.json$/i, /\.candidate\.json$/i, /\.candidate\.redacted\.json$/i, /\.mapping\.json$/i]
const failures = []
const warnings = []

if (!fs.existsSync(fixtureDir)) {
  failures.push(`Missing fixture directory: ${fixtureDir}`)
} else {
  for (const name of required) {
    const full = path.join(fixtureDir, name)
    if (!fs.existsSync(full)) failures.push(`Missing required tracked fixture: ${full}`)
  }

  const fixtureFiles = fs.readdirSync(fixtureDir)
    .filter((file) => file.endsWith('.fixture.json'))
    .map((file) => path.join(fixtureDir, file))

  const ids = new Map()

  for (const file of fixtureFiles) {
    try {
      const fixture = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (!fixture.id) failures.push(`${file}: missing id`)
      if (!Array.isArray(fixture.frames)) failures.push(`${file}: missing frames[]`)
      if (fixture.id) {
        const prev = ids.get(fixture.id)
        if (prev) failures.push(`Duplicate fixture id ${fixture.id}: ${prev} and ${file}`)
        ids.set(fixture.id, file)
      }
      if (fixture.kind === 'real-capture-fixture') {
        if (fixture.status !== 'attached') failures.push(`${file}: real fixture must have status attached`)
        if (!fixture.redaction) failures.push(`${file}: real fixture must contain redaction metadata`)
        if ((fixture.frames ?? []).length === 0) failures.push(`${file}: real fixture has no frames`)
      }
    } catch (error) {
      failures.push(`${file}: ${error.message}`)
    }
  }

  const localOnly = fs.readdirSync(fixtureDir)
    .map((file) => path.join(fixtureDir, file))
    .filter((file) => localOnlyPatterns.some((pattern) => pattern.test(file)))

  if (localOnly.length > 0) {
    warnings.push(`Local-only fixture artifacts present: ${localOnly.length}`)
    for (const file of localOnly.slice(0, 12)) warnings.push(`local-only: ${file}`)
  }
}

console.log('🗂️ Packet Atlas fixture registry audit')
for (const warning of warnings) console.log(`⚠️ ${warning}`)

if (failures.length > 0) {
  for (const failure of failures) console.error(`❌ ${failure}`)
  process.exit(1)
}

console.log('✅ fixture registry ok')
