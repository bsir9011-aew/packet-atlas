import { describe, expect, it } from 'vitest'
import { getAccessMediumFlow, getAccessMediumSummary } from '../../src/features/packet-atlas/wifi/wifiAccessModel'

describe('wifi access model', () => {
  it('contrasts ethernet and wifi access media', () => {
    expect(getAccessMediumFlow('ethernet')).toHaveLength(3)
    expect(getAccessMediumFlow('wifi').some((step) => step.title.includes('Access') || step.title.includes('802.11'))).toBe(true)
    expect(getAccessMediumSummary('wifi').trap).toContain('Ethernet')
  })
})
