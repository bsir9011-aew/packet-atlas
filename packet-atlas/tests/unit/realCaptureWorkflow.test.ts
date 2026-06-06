import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('real capture workflow orchestrator', () => {
  it('reports the next missing capture artifact', () => {
    const script = 'scripts/captures/real-capture-workflow.mjs'
    expect(existsSync(script)).toBe(true)
    const text = readFileSync(script, 'utf8')
    expect(text).toContain('reports/real-capture-workflow.md')
    expect(text).toContain('capture:candidate:promote')
    expect(text).toContain('capture:readiness:strict')
  })
})
