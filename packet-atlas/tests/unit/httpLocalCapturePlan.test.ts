import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import plan from '../../src/data/capture-plans/http-local.controlled-capture-plan.json'

describe('HTTP local capture plan', () => {
  it('keeps the plaintext contrast capture scoped to localhost', () => {
    expect(plan.id).toBe('http-local-plaintext-contrast')
    expect(plan.safety.scope).toBe('localhost only')
    expect(plan.safety.recommendedInterface).toBe('lo')
    expect(plan.commands.request).toContain('127.0.0.1:8080')
    expect(plan.expectedEvidence).toContain('Readable HTTP GET /')
  })

  it('has an operator report generator script', () => {
    const script = 'scripts/captures/http-local-capture-plan.mjs'
    expect(existsSync(script)).toBe(true)
    expect(readFileSync(script, 'utf8')).toContain('Raw PCAP and raw JSON exports remain local-only')
  })
})
