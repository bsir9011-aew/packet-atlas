import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)

function readArg(name, fallback) {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}

const interfaceName = readArg('--interface', 'eth0')
const host = readArg('--host', 'example.com')
const capturePath = readArg('--pcap', 'captures/https-basic.pcapng')
const rawFixturePath = readArg('--raw', 'src/data/fixtures/https-basic.raw.json')
const normalizedFixturePath = readArg(
  '--fixture',
  'src/data/fixtures/https-basic.real.fixture.json',
)
const output = readArg('--output', 'reports/capture-command-plan.sh')

const commands = [
  '#!/usr/bin/env bash',
  'set -euo pipefail',
  '',
  '# Packet Atlas controlled capture command plan',
  '# Review interface, authorization and assumptions before running.',
  '',
  'mkdir -p captures src/data/fixtures reports',
  '',
  'echo "1) Inspect available interfaces"',
  'tshark -D',
  '',
  'echo "2) Start capture in a separate terminal"',
  `echo 'tshark -i ${interfaceName} -f "udp port 53 or tcp port 443" -w ${capturePath}'`,
  '',
  'echo "3) Generate controlled client traffic in another terminal"',
  `echo 'curl --http1.1 --tlsv1.3 --no-keepalive --connect-timeout 10 --max-time 20 https://${host}/ -o /dev/null -v'`,
  '',
  'echo "4) Stop capture manually after the request finishes"',
  '',
  'echo "5) Inspect capture summary"',
  `capinfos ${capturePath} || true`,
  '',
  'echo "6) Export and normalize after review"',
  `npm run capture:export -- ${capturePath} ${rawFixturePath}`,
  `npm run capture:normalize -- ${rawFixturePath} ${normalizedFixturePath}`,
  `npm run capture:profile -- ${capturePath}`,
  `npm run capture:map -- ${normalizedFixturePath}`,
  '',
  'echo "7) Readiness checks"',
  `npm run capture:readiness:strict -- ${normalizedFixturePath}`,
  '',
]

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, commands.join('\n') + '\n')
fs.chmodSync(output, 0o755)

console.log('🧾 Packet Atlas capture command generator')
console.log(`Host: ${host}`)
console.log(`Interface: ${interfaceName}`)
console.log(`PCAP: ${capturePath}`)
console.log(`Plan written: ${output}`)
console.log('')
console.log('Important:')
console.log('- The generated file prints commands; it does not automatically capture traffic.')
console.log('- Run capture only on networks and systems you are authorized to inspect.')
console.log('- Keep the trace small and stop capture immediately after the controlled request.')
