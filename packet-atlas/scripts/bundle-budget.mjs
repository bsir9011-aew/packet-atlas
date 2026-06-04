import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const distDir = 'dist'
const assetsDir = join(distDir, 'assets')
const kib = (bytes) => bytes / 1024
const fmt = (bytes) => `${kib(bytes).toFixed(1)} KiB`

if (!existsSync(distDir) || !existsSync(assetsDir)) {
  console.error('❌ dist/assets not found. Run npm run build first.')
  process.exit(1)
}

const files = readdirSync(assetsDir)
  .map((name) => {
    const path = join(assetsDir, name)
    return { name, path, size: statSync(path).size }
  })
  .sort((a, b) => b.size - a.size)

const jsFiles = files.filter((file) => file.name.endsWith('.js'))
const cssFiles = files.filter((file) => file.name.endsWith('.css'))
const totalJs = jsFiles.reduce((sum, file) => sum + file.size, 0)
const totalCss = cssFiles.reduce((sum, file) => sum + file.size, 0)
const largestJs = jsFiles[0]

console.log('📦 Packet Atlas bundle budget')
console.log(`JS files: ${jsFiles.length} • total JS: ${fmt(totalJs)}`)
console.log(`CSS files: ${cssFiles.length} • total CSS: ${fmt(totalCss)}`)
if (largestJs) console.log(`Largest JS chunk: ${largestJs.name} • ${fmt(largestJs.size)}`)

// Soft budget: fail only if the bundle becomes clearly out of control.
// Vite may warn above 500 KiB; this project is visualization-heavy, so the hard CI limit is higher.
const maxLargestJs = 900 * 1024
const maxTotalJs = 1500 * 1024

let failed = false
if (largestJs && largestJs.size > maxLargestJs) {
  console.error(`❌ Largest JS chunk exceeds ${fmt(maxLargestJs)}.`)
  failed = true
}
if (totalJs > maxTotalJs) {
  console.error(`❌ Total JS exceeds ${fmt(maxTotalJs)}.`)
  failed = true
}

if (failed) {
  process.exit(1)
}

console.log('✅ bundle budget ok')
