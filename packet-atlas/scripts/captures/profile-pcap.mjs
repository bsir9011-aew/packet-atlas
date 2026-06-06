import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const [, , inputArg, outputArg] = process.argv
const input = inputArg ?? 'captures/https-basic.pcapng'
const output = outputArg ?? 'reports/pcap-profile.json'

if (!fs.existsSync(input)) {
  console.error(`❌ capture file not found: ${input}`)
  console.error('Usage: npm run capture:profile -- captures/https-basic.pcapng [reports/pcap-profile.json]')
  process.exit(1)
}

const fields = [
  'frame.number',
  'frame.time_relative',
  'frame.protocols',
  'ip.src',
  'ip.dst',
  'tcp.srcport',
  'tcp.dstport',
  'udp.srcport',
  'udp.dstport',
  'dns.qry.name',
  'tls.handshake.type',
  'http.request.method',
  'http.response.code',
]

const args = [
  '-r',
  input,
  '-T',
  'fields',
  '-E',
  'header=y',
  '-E',
  'separator=\t',
  ...fields.flatMap((field) => ['-e', field]),
]

const result = spawnSync('tshark', args, {
  encoding: 'utf8',
  timeout: 30_000,
})

if (result.error) {
  console.error(`❌ tshark failed: ${result.error.message}`)
  process.exit(1)
}

if (result.status !== 0) {
  console.error(result.stderr)
  process.exit(result.status ?? 1)
}

const [headerLine, ...dataLines] = result.stdout
  .split('\n')
  .filter((line) => line.trim().length > 0)

const headers = headerLine.split('\t')
const rows = dataLines.map((line) => {
  const values = line.split('\t')
  return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
})

function countBy(predicate) {
  return rows.filter(predicate).length
}

const profile = {
  generatedAt: new Date().toISOString(),
  input,
  frameCount: rows.length,
  counts: {
    dns: countBy((row) => row['frame.protocols']?.includes('dns')),
    udp53: countBy(
      (row) => row['udp.srcport'] === '53' || row['udp.dstport'] === '53',
    ),
    tcp443: countBy(
      (row) => row['tcp.srcport'] === '443' || row['tcp.dstport'] === '443',
    ),
    tls: countBy((row) => row['frame.protocols']?.includes('tls')),
    http: countBy((row) => row['frame.protocols']?.includes('http')),
    quicOrHttp3: countBy((row) =>
      /quic|http3|http\/3/i.test(row['frame.protocols'] ?? ''),
    ),
  },
  baselineFit: {
    hasClassicDns: false,
    hasTcp443: false,
    hasTls: false,
    likelyHttp3Mismatch: false,
  },
  warnings: [],
  sampleFrames: rows.slice(0, 20),
}

profile.baselineFit.hasClassicDns = profile.counts.dns > 0 || profile.counts.udp53 > 0
profile.baselineFit.hasTcp443 = profile.counts.tcp443 > 0
profile.baselineFit.hasTls = profile.counts.tls > 0
profile.baselineFit.likelyHttp3Mismatch = profile.counts.quicOrHttp3 > 0

if (!profile.baselineFit.hasClassicDns) profile.warnings.push('No classic visible DNS/UDP53 evidence found.')
if (!profile.baselineFit.hasTcp443) profile.warnings.push('No TCP/443 evidence found.')
if (!profile.baselineFit.hasTls) profile.warnings.push('No TLS evidence found.')
if (profile.baselineFit.likelyHttp3Mismatch) profile.warnings.push('QUIC/HTTP3 evidence found; this may not match the TCP/TLS baseline.')

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, JSON.stringify(profile, null, 2) + '\n')

console.log(`🔎 PCAP profile written: ${output}`)
console.log(`Frames: ${profile.frameCount}`)
console.log(`DNS: ${profile.counts.dns} • TCP/443: ${profile.counts.tcp443} • TLS: ${profile.counts.tls} • HTTP: ${profile.counts.http}`)
for (const warning of profile.warnings) console.log(`⚠️ ${warning}`)
