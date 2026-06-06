import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const targetDir = args.find((arg) => !arg.startsWith('--')) ?? 'src/data/fixtures'
const reportPath = 'reports/capture-privacy-audit.json'

const findings = []

function isDocumentationIpv4(ip) {
  return (
    ip.startsWith('192.0.2.') ||
    ip.startsWith('198.51.100.') ||
    ip.startsWith('203.0.113.')
  )
}

function isPrivateOrLocalIpv4(ip) {
  return (
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('127.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  )
}

function scanFile(file) {
  const text = fs.readFileSync(file, 'utf8')

  const emails = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []
  for (const email of emails) {
    if (!email.endsWith('@example.invalid')) {
      findings.push({ file, kind: 'email', value: email, severity: 'high' })
    }
  }

  const macs = text.match(/\b([0-9a-f]{2}:){5}[0-9a-f]{2}\b/gi) ?? []
  for (const mac of macs) {
    findings.push({ file, kind: 'mac-address', value: mac, severity: 'medium' })
  }

  const ipv4s = text.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) ?? []
  for (const ip of ipv4s) {
    if (isDocumentationIpv4(ip)) continue

    findings.push({
      file,
      kind: isPrivateOrLocalIpv4(ip) ? 'private-or-local-ipv4' : 'public-ipv4',
      value: ip,
      severity: isPrivateOrLocalIpv4(ip) ? 'medium' : 'review',
    })
  }

  const likelyTokens = text.match(/\b(?:Bearer\s+)?[A-Za-z0-9_-]{32,}\b/g) ?? []
  for (const token of likelyTokens.slice(0, 20)) {
    findings.push({
      file,
      kind: 'long-token-like-string',
      value: `${token.slice(0, 8)}…`,
      severity: 'review',
    })
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.name.endsWith('.json')) scanFile(full)
  }
}

if (!fs.existsSync(targetDir)) {
  console.error(`❌ target not found: ${targetDir}`)
  process.exit(1)
}

walk(targetDir)

const report = {
  generatedAt: new Date().toISOString(),
  targetDir,
  strict,
  findingCount: findings.length,
  findings,
  status:
    findings.some((finding) => finding.severity === 'high') ||
    (strict && findings.length > 0)
      ? 'review-required'
      : 'ok',
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')

console.log(`🔐 capture privacy audit: ${report.status}`)
console.log(`Findings: ${findings.length}`)
console.log(`📄 report: ${reportPath}`)

if (report.status === 'review-required') {
  for (const finding of findings.slice(0, 20)) {
    console.log(`⚠️ ${finding.kind} in ${finding.file}: ${finding.value}`)
  }
}

if (report.status === 'review-required' && strict) process.exit(1)
