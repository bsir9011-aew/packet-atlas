import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const [, , input, output] = process.argv

if (!input || !output) {
  console.error('Usage: npm run capture:export -- <input.pcapng> <output.raw.json>')
  process.exit(1)
}

if (!fs.existsSync(input)) {
  console.error(`Input capture not found: ${input}`)
  process.exit(1)
}

fs.mkdirSync(path.dirname(output), { recursive: true })

// Important: do not capture TShark JSON in Node stdout memory.
// Even a small PCAP can expand into tens or hundreds of MB of JSON.
// Piping stdout directly to a file avoids spawnSync ENOBUFS.
const outFd = fs.openSync(output, 'w')

try {
  const result = spawnSync(
    'tshark',
    [
      '-r',
      input,
      '-T',
      'json',
    ],
    {
      stdio: ['ignore', outFd, 'pipe'],
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      timeout: 120_000,
    },
  )

  if (result.error) {
    console.error('Could not run tshark. Install Wireshark/TShark in the environment first.')
    console.error(result.error.message)
    process.exit(1)
  }

  if (result.status !== 0) {
    console.error(result.stderr || `tshark exited with status ${result.status}`)
    process.exit(result.status ?? 1)
  }
} finally {
  fs.closeSync(outFd)
}

const stats = fs.statSync(output)

if (stats.size === 0) {
  console.error(`TShark export produced an empty file: ${output}`)
  process.exit(1)
}

console.log(`✅ TShark JSON exported: ${output}`)
console.log(`📦 size: ${(stats.size / 1024 / 1024).toFixed(2)} MiB`)
