import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const input =
  process.argv[2] ?? 'src/data/fixtures/http-local.real.fixture.candidate.json'
const output =
  process.argv[3] ?? 'src/data/fixtures/http-local.real.fixture.json'

const validation = spawnSync(
  process.execPath,
  ['scripts/captures/validate-http-local-candidate.mjs', input],
  { stdio: 'inherit' },
)

if (validation.status !== 0) {
  process.exit(validation.status ?? 1)
}

const candidate = JSON.parse(fs.readFileSync(input, 'utf8'))

const promoted = {
  ...candidate,
  id: 'http-local-real-fixture',
  status: 'attached',
  promotedAt: new Date().toISOString(),
}

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, JSON.stringify(promoted, null, 2) + '\n')

console.log(`🚀 promoted HTTP local fixture to: ${output}`)
