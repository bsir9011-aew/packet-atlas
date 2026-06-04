import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { dnsResolutionModes, getDnsStages } from '../../src/features/packet-atlas/dns/dnsResolutionModeModel'

describe('DNS resolution modes', () => {
  it('contains failure and non-packet cache variants', () => {
    expect(dnsResolutionModes.some((mode) => mode.id === 'cache-hit')).toBe(true)
    expect(dnsResolutionModes.some((mode) => mode.id === 'nxdomain')).toBe(true)
  })
  it('finds DNS stages in the baseline scenario', () => {
    expect(getDnsStages(httpsExampleScenario).length).toBeGreaterThanOrEqual(2)
  })
})
