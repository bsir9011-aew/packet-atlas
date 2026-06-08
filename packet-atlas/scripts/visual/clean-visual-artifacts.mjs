import fs from 'node:fs'

const targets = ['test-results', 'playwright-report', 'dist']

for (const target of targets) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true })
    console.log(`🧹 removed ${target}`)
  }
}

console.log('✅ visual artifacts cleaned')
