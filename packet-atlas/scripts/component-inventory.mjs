import fs from 'node:fs'
import path from 'node:path'

const root = 'src/features/packet-atlas'
const files = []

function walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.name.endsWith('.tsx')) files.push(full)
  }
}

walk(root)

console.log('📚 Packet Atlas component inventory')
for (const file of files.sort()) console.log(`- ${file}`)
console.log(`✅ ${files.length} TSX component file(s) found`)
