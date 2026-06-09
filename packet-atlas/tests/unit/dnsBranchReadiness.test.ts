import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

describe('DNS branch readiness report', () => {
  it('generates a readiness snapshot from fixture and capture plan artifacts', () => {
    execFileSync('node', ['scripts/project/dns-branch-readiness.mjs'], {
      stdio: 'pipe',
    })

    const report = 'reports/dns-branch-readiness.md'
    expect(existsSync(report)).toBe(true)

    const text = readFileSync(report, 'utf8')
    expect(text).toContain('Status: READY')
    expect(text).toContain('DNS query frame exists')
    expect(text).toContain('TCP/443 absent')
    expect(text).toContain('controlled real capture candidate')
  })
})
