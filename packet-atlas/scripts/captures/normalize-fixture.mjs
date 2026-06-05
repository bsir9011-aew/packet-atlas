import fs from 'node:fs'
import path from 'node:path'

const [, , input = 'src/data/fixtures/tshark-export.raw.json', output = 'src/data/fixtures/https-example.fixture.json'] = process.argv

if (!fs.existsSync(input)) {
  console.error(`Input TShark JSON not found: ${input}`)
  process.exit(1)
}

const raw = JSON.parse(fs.readFileSync(input, 'utf8'))

const frames = raw.map((packet, index) => {
  const layers = packet?._source?.layers ?? {}
  const frame = layers.frame ?? {}
  const ip = layers.ip ?? layers.ipv6 ?? {}
  const tcp = layers.tcp ?? {}
  const udp = layers.udp ?? {}
  const dns = layers.dns ?? {}
  const tls = layers.tls ?? {}
  const http = layers.http ?? {}

  return {
    frameNumber: Number(frame['frame.number'] ?? index + 1),
    timeRelative: frame['frame.time_relative'] ?? null,
    protocolStack: Object.keys(layers).filter((key) => !key.startsWith('frame_raw')),
    summary: {
      srcIp: ip['ip.src'] ?? ip['ipv6.src'] ?? null,
      dstIp: ip['ip.dst'] ?? ip['ipv6.dst'] ?? null,
      srcPort: tcp['tcp.srcport'] ?? udp['udp.srcport'] ?? null,
      dstPort: tcp['tcp.dstport'] ?? udp['udp.dstport'] ?? null,
      highestProtocol: Object.keys(layers).filter((key) => !key.endsWith('_raw')).at(-1) ?? null,
    },
    fields: { frame, ip, tcp, udp, dns, tls, http },
  }
})

const fixture = {
  id: 'https-example-fixture',
  source: path.basename(input),
  generatedAt: new Date().toISOString(),
  note: 'Normalized from TShark JSON. Attach frameNumber values to scenario stage captureRef later.',
  frames,
}

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, JSON.stringify(fixture, null, 2) + '\n')
console.log(`✅ normalized fixture: ${output}`)
