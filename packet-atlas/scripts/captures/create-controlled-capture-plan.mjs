import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)

function readArg(name, fallback) {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}

const interfaceName = readArg('--interface', '<choose-interface>')
const host = readArg('--host', 'example.com')
const output = readArg(
  '--output',
  'src/data/capture-plans/https-basic.controlled-capture-plan.json',
)

const manifest = JSON.parse(
  fs.readFileSync(
    'src/features/packet-atlas/scenarios/httpsExample.manifest.v2.json',
    'utf8',
  ),
)

const plan = {
  id: 'https-basic-controlled-capture-plan',
  generatedAt: new Date().toISOString(),
  manifestId: manifest.id,
  targetHost: host,
  interface: interfaceName,
  goal: 'Produce a small authorized DNS + TCP + TLS fixture compatible with the frozen HTTPS baseline.',
  assumptions: {
    ipVersion: 'IPv4',
    dns: 'classic UDP/53',
    transport: 'TCP',
    tls: 'TLS 1.3 preferred',
    http: 'HTTP application content may be encrypted on the wire',
    nat: 'may be visible only at the gateway perspective',
  },
  preflight: [
    'Run npm run capture:doctor.',
    'Use only a network/interface you are authorized to inspect.',
    'Disable or avoid browser cache and service workers.',
    'Avoid DoH/DoT if the goal is a visible classic DNS query.',
    'Avoid HTTP/3/QUIC if the goal is the TCP/TLS baseline.',
    'Prefer a controlled CLI request over a complex browser session.',
  ],
  recommendedCaptureFilter: 'udp port 53 or tcp port 443',
  recommendedDisplayFilter: 'dns or tcp.port == 443 or tls',
  commands: {
    inspectInterfaces: 'tshark -D',
    captureTemplate: `tshark -i ${interfaceName} -f "udp port 53 or tcp port 443" -w captures/https-basic.pcapng`,
    exportTemplate:
      'npm run capture:export -- captures/https-basic.pcapng src/data/fixtures/https-basic.raw.json',
    normalizeTemplate:
      'npm run capture:normalize -- src/data/fixtures/https-basic.raw.json src/data/fixtures/https-basic.real.fixture.json',
    mapTemplate:
      'npm run capture:map -- src/data/fixtures/https-basic.real.fixture.json',
  },
  stopConditions: [
    'Capture contains unrelated/private traffic beyond the controlled test.',
    'The expected DNS/TCP/TLS sequence is absent.',
    'Traffic used HTTP/3/QUIC or encrypted DNS and no longer matches the baseline.',
  ],
}

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, JSON.stringify(plan, null, 2) + '\n')

console.log(`✅ controlled capture plan written: ${output}`)
console.log('⚠️ Review interface, authorization and assumptions before running any capture command.')
