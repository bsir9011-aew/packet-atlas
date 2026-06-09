import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

describe('DNS failure capture plan', () => {
  it('generates an operator-safe capture plan', () => {
    execFileSync('node', ['scripts/captures/dns-failure-capture-plan.mjs'], {
      stdio: 'pipe',
    })

    const report = 'reports/dns-failure-capture-plan.md'
    expect(existsSync(report)).toBe(true)

    const text = readFileSync(report, 'utf8')
    expect(text).toContain('.invalid')
    expect(text).toContain('TCP/443 is absent')
    expect(text).toContain('Do not commit raw PCAP/PCAPNG files')
    expect(text).toContain('curl -v')
  })
})
