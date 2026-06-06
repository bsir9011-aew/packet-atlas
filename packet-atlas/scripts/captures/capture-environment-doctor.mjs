import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const reportPath = 'reports/capture-environment-report.json'

function commandProbe(command, args = ['--version']) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    timeout: 10_000,
  })

  if (result.error) {
    return {
      command,
      available: false,
      detail: result.error.message,
    }
  }

  return {
    command,
    available: result.status === 0,
    detail: (result.stdout || result.stderr || '').split('\n')[0].trim(),
    status: result.status,
  }
}

const tools = {
  tshark: commandProbe('tshark', ['--version']),
  dumpcap: commandProbe('dumpcap', ['--version']),
  capinfos: commandProbe('capinfos', ['--version']),
  editcap: commandProbe('editcap', ['--version']),
}

let interfaces = []
if (tools.tshark.available) {
  const result = spawnSync('tshark', ['-D'], {
    encoding: 'utf8',
    timeout: 10_000,
  })
  if (result.status === 0) {
    interfaces = result.stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  }
}

const checks = [
  {
    id: 'tshark',
    status: tools.tshark.available ? 'pass' : 'fail',
    message: tools.tshark.available
      ? 'TShark can read and export capture files.'
      : 'TShark is missing. Install Wireshark/TShark before real capture work.',
  },
  {
    id: 'interfaces',
    status: interfaces.length > 0 ? 'pass' : 'warn',
    message:
      interfaces.length > 0
        ? `${interfaces.length} capture interface(s) visible.`
        : 'No capture interfaces listed. Reading an existing PCAP can still work.',
  },
  {
    id: 'fixture-dir',
    status: fs.existsSync('src/data/fixtures') ? 'pass' : 'fail',
    message: 'Normalized fixture directory exists.',
  },
  {
    id: 'capture-docs',
    status: fs.existsSync('docs/captures') ? 'pass' : 'warn',
    message: 'Capture documentation directory exists.',
  },
]

const report = {
  generatedAt: new Date().toISOString(),
  cwd: process.cwd(),
  platform: process.platform,
  node: process.version,
  tools,
  interfaces,
  checks,
  warnings: [
    'A browser may use cache, DoH, HTTP/2 or HTTP/3 and invalidate the frozen baseline assumptions.',
    'Capture only traffic and systems you are authorized to inspect.',
    'The doctor checks readiness; it does not start packet capture.',
  ],
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')

console.log('🩺 Packet Atlas capture environment doctor')
for (const check of checks) {
  const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌'
  console.log(`${icon} ${check.id}: ${check.message}`)
}

console.log(`📄 report: ${reportPath}`)

if (!tools.tshark.available) {
  console.log('⚠️ Capture pipeline is not locally ready, but the application itself remains healthy.')
}
