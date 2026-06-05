import fs from 'node:fs'
import path from 'node:path'

const fixtureDir = 'src/data/fixtures'
const failures = []

if (!fs.existsSync(fixtureDir)) {
  console.log('⚠️ no fixture directory yet')
  process.exit(0)
}

const files = fs.readdirSync(fixtureDir).filter((file) => file.endsWith('.fixture.json'))

for (const file of files) {
  const full = path.join(fixtureDir, file)
  try {
    const fixture = JSON.parse(fs.readFileSync(full, 'utf8'))
    if (!fixture.id) failures.push(`${file}: missing id`)
    if (!Array.isArray(fixture.frames)) failures.push(`${file}: missing frames[]`)
    for (const frame of fixture.frames ?? []) {
      if (typeof frame.frameNumber !== 'number') failures.push(`${file}: frame without numeric frameNumber`)
      if (!Array.isArray(frame.protocolStack)) failures.push(`${file}: frame ${frame.frameNumber} missing protocolStack[]`)
    }
  } catch (err) {
    failures.push(`${file}: ${err.message}`)
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`❌ ${failure}`)
  process.exit(1)
}

console.log(`✅ fixture validation ok (${files.length} fixture file(s))`)
