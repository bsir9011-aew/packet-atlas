import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const [, , input, output = 'src/data/fixtures/tshark-export.raw.json'] = process.argv

if (!input) {
  console.error('Usage: node scripts/captures/tshark-export.mjs <capture.pcapng> [output.json]')
  process.exit(1)
}

if (!fs.existsSync(input)) {
  console.error(`Capture file not found: ${input}`)
  process.exit(1)
}

fs.mkdirSync(path.dirname(output), { recursive: true })

const result = spawnSync('tshark', ['-r', input, '-T', 'json', '-x'], {
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 64,
})

if (result.error) {
  console.error('Could not run tshark. Install Wireshark/TShark in the environment first.')
  console.error(result.error.message)
  process.exit(1)
}

if (result.status !== 0) {
  console.error(result.stderr)
  process.exit(result.status ?? 1)
}

fs.writeFileSync(output, result.stdout)
console.log(`✅ exported TShark JSON: ${output}`)
