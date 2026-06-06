import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const [, , inputArg, hostArg, outputArg] = process.argv

const input = inputArg ?? 'captures/https-basic.pcapng'
const host = hostArg ?? 'example.com'
const output = outputArg ?? 'captures/https-basic.clean.pcapng'
const reportPath = output.replace(/\.pcapng$/i, '.slice-report.json')

if (!fs.existsSync(input)) {
  console.error(`❌ capture file not found: ${input}`)
  console.error('Usage: npm run capture:slice -- captures/https-basic.pcapng example.com captures/https-basic.clean.pcapng')
  process.exit(1)
}

function runTshark(args) {
  const result = spawnSync('tshark', args, {
    encoding: 'utf8',
    timeout: 60_000,
    maxBuffer: 32 * 1024 * 1024,
  })

  if (result.error) {
    console.error(`❌ tshark failed: ${result.error.message}`)
    process.exit(1)
  }

  if (result.status !== 0) {
    console.error(result.stderr || `tshark exited with status ${result.status}`)
    process.exit(result.status ?? 1)
  }

  return result.stdout
}

function uniqueNonEmpty(lines) {
  return [...new Set(lines.map((line) => line.trim()).filter(Boolean))]
}

const streamOutput = runTshark([
  '-r',
  input,
  '-Y',
  `tls.handshake.extensions_server_name == "${host}"`,
  '-T',
  'fields',
  '-e',
  'tcp.stream',
])

const streams = uniqueNonEmpty(streamOutput.split('\n'))

const dnsOutput = runTshark([
  '-r',
  input,
  '-Y',
  `dns.qry.name contains "${host}" or dns.resp.name contains "${host}"`,
  '-T',
  'fields',
  '-e',
  'dns.a',
  '-e',
  'dns.aaaa',
])

const resolvedAddresses = uniqueNonEmpty(
  dnsOutput
    .split(/\s+/)
    .flatMap((item) => item.split(','))
    .filter((item) => item && item !== '<MISSING>'),
)

const filterParts = [
  `(dns.qry.name contains "${host}" or dns.resp.name contains "${host}")`,
]

if (streams.length > 0) {
  filterParts.push(`tcp.stream in {${streams.join(' ')}}`)
}

if (streams.length === 0 && resolvedAddresses.length > 0) {
  filterParts.push(`ip.addr in {${resolvedAddresses.join(' ')}}`)
}

const displayFilter = filterParts.join(' or ')

fs.mkdirSync(path.dirname(output), { recursive: true })

const sliceResult = spawnSync(
  'tshark',
  ['-r', input, '-Y', displayFilter, '-w', output],
  {
    encoding: 'utf8',
    timeout: 120_000,
  },
)

if (sliceResult.error) {
  console.error(`❌ tshark slice failed: ${sliceResult.error.message}`)
  process.exit(1)
}

if (sliceResult.status !== 0) {
  console.error(sliceResult.stderr || `tshark exited with status ${sliceResult.status}`)
  process.exit(sliceResult.status ?? 1)
}

const stats = fs.statSync(output)

const countOutput = runTshark([
  '-r',
  output,
  '-T',
  'fields',
  '-e',
  'frame.number',
])
const frameCount = uniqueNonEmpty(countOutput.split('\n')).length

const report = {
  generatedAt: new Date().toISOString(),
  input,
  output,
  host,
  displayFilter,
  streams,
  resolvedAddresses,
  frameCount,
  sizeBytes: stats.size,
}

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')

console.log(`🧼 clean capture written: ${output}`)
console.log(`Frames: ${frameCount} • size: ${(stats.size / 1024).toFixed(1)} KiB`)
console.log(`SNI streams: ${streams.length ? streams.join(', ') : 'none found'}`)
console.log(`DNS addresses: ${resolvedAddresses.length ? resolvedAddresses.join(', ') : 'none found'}`)
console.log(`📄 report: ${reportPath}`)
