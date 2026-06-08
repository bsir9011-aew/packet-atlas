import { spawnSync } from 'node:child_process'

const result = spawnSync('git', ['status', '--short', 'tests/visual'], {
  encoding: 'utf8',
})

if (result.error) {
  console.error(`❌ git status failed: ${result.error.message}`)
  process.exit(1)
}

const changed = result.stdout.split('\n').map((line) => line.trim()).filter(Boolean)

if (changed.length === 0) {
  console.log('✅ visual baselines unchanged')
  process.exit(0)
}

console.log('⚠️ visual baseline files changed:')
for (const line of changed) console.log(`  ${line}`)

console.log('')
console.log('Next step:')
console.log('  git add tests/visual')
console.log('  git commit -m "Update visual baselines"')
console.log('')
console.log('Do not commit playwright-report/, test-results/ or dist/.')
process.exit(2)
