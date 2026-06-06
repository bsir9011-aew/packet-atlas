import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('pcap profile analyzer', () => {
  it('profiles DNS, TCP, TLS and possible HTTP3 mismatch', () => {
    const script = 'scripts/captures/profile-pcap.mjs'
    expect(existsSync(script)).toBe(true)
    const text = readFileSync(script, 'utf8')
    expect(text).toContain('quicOrHttp3')
    expect(text).toContain('hasClassicDns')
    expect(text).toContain('tcp.dstport')
  })
})
