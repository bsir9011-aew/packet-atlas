import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('clean capture slicer', () => {
  it('uses DNS and TLS SNI to slice a noisy PCAP', () => {
    const script = 'scripts/captures/slice-clean-capture.mjs'
    expect(existsSync(script)).toBe(true)

    const text = readFileSync(script, 'utf8')
    expect(text).toContain('tls.handshake.extensions_server_name')
    expect(text).toContain('dns.qry.name contains')
    expect(text).toContain('tcp.stream in')
  })
})
