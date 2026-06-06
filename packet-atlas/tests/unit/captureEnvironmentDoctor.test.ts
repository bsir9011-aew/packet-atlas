import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('capture environment doctor', () => {
  it('checks tools without starting packet capture', () => {
    const script = 'scripts/captures/capture-environment-doctor.mjs'
    expect(existsSync(script)).toBe(true)
    const text = readFileSync(script, 'utf8')
    expect(text).toContain("commandProbe('tshark'")
    expect(text).toContain('does not start packet capture')
  })
})
