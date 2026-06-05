import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('TShark fixture pipeline', () => {
  it('ships offline capture scripts and a synthetic fixture', () => {
    expect(existsSync('scripts/captures/tshark-export.mjs')).toBe(true)
    expect(existsSync('scripts/captures/normalize-fixture.mjs')).toBe(true)
    expect(existsSync('scripts/captures/validate-fixtures.mjs')).toBe(true)
    expect(existsSync('src/data/fixtures/https-example.synthetic.fixture.json')).toBe(true)

    const doc = readFileSync('docs/capture-fixture-pipeline.md', 'utf8')
    expect(doc).toContain('should not parse PCAP/PCAPNG in the browser')
  })
})
