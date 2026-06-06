import fs from 'node:fs'
import path from 'node:path'

const [
  ,
  ,
  fixtureArg,
  mappingArg,
  outputArg,
] = process.argv

const fixturePath = fixtureArg ?? 'src/data/fixtures/https-basic.real.fixture.json'
const mappingPath = mappingArg ?? fixturePath.replace(/\.json$/, '.mapping.json')
const outputPath = outputArg ?? 'src/data/fixtures/https-basic.real.fixture.candidate.json'
const placeholderPath = 'src/data/fixtures/https-basic.real.fixture.placeholder.json'

if (!fs.existsSync(fixturePath)) {
  console.error(`❌ normalized fixture not found: ${fixturePath}`)
  process.exit(1)
}

if (!fs.existsSync(mappingPath)) {
  console.error(`❌ mapping file not found: ${mappingPath}`)
  console.error('Create it with: npm run capture:map -- <normalized-fixture.json>')
  process.exit(1)
}

const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'))
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'))
const placeholder = fs.existsSync(placeholderPath)
  ? JSON.parse(fs.readFileSync(placeholderPath, 'utf8'))
  : {}

const suggestionsByFrameNumber = new Map(
  (mapping.mappings ?? [])
    .filter((item) => item.suggestion?.stageId)
    .map((item) => [Number(item.frameNumber), item.suggestion]),
)

const frames = (fixture.frames ?? []).map((frame) => {
  const suggestion = suggestionsByFrameNumber.get(Number(frame.frameNumber))
  if (!suggestion) return frame

  return {
    ...frame,
    stageHint: suggestion.stageId,
    stageHintConfidence: suggestion.confidence,
    stageHintReason: suggestion.reason,
  }
})

const candidate = {
  ...fixture,
  id: fixture.id?.includes('candidate')
    ? fixture.id
    : 'https-basic-real-candidate',
  kind: 'real-capture-candidate',
  status: 'candidate-real-capture',
  generatedAt: new Date().toISOString(),
  sourceFixture: fixturePath,
  sourceMapping: mappingPath,
  reviewRequired: true,
  note:
    'Candidate generated from normalized fixture and mapping suggestions. Review every stageHint before promotion.',
  baselineAssumptions:
    fixture.baselineAssumptions ?? placeholder.baselineAssumptions ?? {},
  stageFramePlan:
    fixture.stageFramePlan ?? placeholder.stageFramePlan ?? [],
  frames,
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify(candidate, null, 2) + '\n')

const mappedCount = frames.filter((frame) => frame.stageHint).length
console.log(`🧩 real fixture candidate written: ${outputPath}`)
console.log(`Frames: ${frames.length} • mapped stage hints: ${mappedCount}`)
console.log('⚠️ Review stageHint values before promotion.')
