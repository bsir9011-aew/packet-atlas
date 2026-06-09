import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { summarizeSyntheticDnsFailureFixture } from '../../src/features/packet-atlas/branching/dnsFailureSyntheticFixtureModel'

const fixture = JSON.parse(
  readFileSync('src/data/fixtures/dns-failure.synthetic.fixture.json', 'utf8'),
)

describe('DNS failure synthetic fixture', () => {
  it('proves a pre-connection DNS failure stop', () => {
    const summary = summarizeSyntheticDnsFailureFixture(fixture)

    expect(summary.hasDnsQuery).toBe(true)
    expect(summary.hasDnsFailureAnswer).toBe(true)
    expect(summary.hasTcp443).toBe(false)
    expect(summary.hasTls).toBe(false)
    expect(summary.hasHttp).toBe(false)
    expect(summary.provesPreConnectionStop).toBe(true)
  })

  it('declares the expected absence of later protocols', () => {
    expect(fixture.expectedAbsence).toContain('tcp/443')
    expect(fixture.expectedAbsence).toContain('tls')
    expect(fixture.expectedAbsence).toContain('http')
  })
})
