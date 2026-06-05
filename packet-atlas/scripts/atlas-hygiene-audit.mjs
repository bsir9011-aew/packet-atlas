import fs from 'node:fs'
import path from 'node:path'
const root = 'src/features/packet-atlas'
const reportDir = 'reports'
const reportPath = path.join(reportDir, 'atlas-hygiene-report.md')
const files = []
function walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.(ts|tsx|css)$/.test(entry.name)) files.push(full)
  }
}
walk(root)
const tsxFiles = files.filter((file) => file.endsWith('.tsx'))
const tsFiles = files.filter((file) => file.endsWith('.ts'))
const cssFiles = files.filter((file) => file.endsWith('.css'))
const allText = files.filter((file) => !file.endsWith('.css')).map((file) => fs.readFileSync(file, 'utf8')).join('\n')
function componentName(file) { return path.basename(file, '.tsx') }
const componentRefs = tsxFiles.map((file) => {
  const name = componentName(file)
  const importCount = (allText.match(new RegExp(`\\b${name}\\b`, 'g')) ?? []).length
  return { file, name, importCount, status: file.endsWith('PacketAtlasPage.tsx') || importCount > 1 ? 'keep' : 'review' }
})
const duplicateBasenames = Object.entries(files.reduce((map, file) => {
  const base = path.basename(file); map[base] ??= []; map[base].push(file); return map
}, {})).filter(([, list]) => list.length > 1)
const learningFiles = files.filter((file) => /learning/i.test(file))
const cssTotalBytes = cssFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0)
const lines = []
lines.push('# Packet Atlas hygiene audit', '', `Generated: ${new Date().toISOString()}`, '', '## Summary', '')
lines.push(`- TSX component files: ${tsxFiles.length}`)
lines.push(`- TS model/helper files: ${tsFiles.length}`)
lines.push(`- CSS files: ${cssFiles.length}`)
lines.push(`- CSS total size: ${cssTotalBytes} bytes`)
lines.push(`- Duplicate basenames: ${duplicateBasenames.length}`)
lines.push(`- Learning-related leftovers: ${learningFiles.length}`, '', '## Component inventory', '')
lines.push('| Status | Component | File | Reference count |', '|---|---:|---|---:|')
for (const item of componentRefs.sort((a, b) => a.file.localeCompare(b.file))) lines.push(`| ${item.status} | ${item.name} | \`${item.file}\` | ${item.importCount} |`)
lines.push('', '## Duplicate basenames', '')
if (duplicateBasenames.length === 0) lines.push('- None detected.')
else for (const [base, list] of duplicateBasenames) { lines.push(`- **${base}**`); for (const file of list) lines.push(`  - \`${file}\``) }
lines.push('', '## Learning leftovers', '')
if (learningFiles.length === 0) lines.push('- None detected.')
else for (const file of learningFiles) lines.push(`- \`${file}\``)
lines.push('', '## Recommendation', '', 'Do not delete automatically unless a file is clearly unused and covered by tests. Use this report as a map for manual cleanup.')
fs.mkdirSync(reportDir, { recursive: true })
fs.writeFileSync(reportPath, lines.join('\n') + '\n')
console.log(`✅ hygiene report written: ${reportPath}`)
