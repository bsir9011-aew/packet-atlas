import { describe, expect, it } from 'vitest'
import { getNeighborFlow, getNeighborModeSummary } from '../../src/features/packet-atlas/ipv6/neighborDiscoveryModel'

describe('neighbor discovery model', () => {
  it('keeps IPv4 ARP and IPv6 ND distinct', () => {
    expect(getNeighborFlow('ipv4-arp')[0].title).toContain('ARP')
    expect(getNeighborFlow('ipv6-nd')[0].title).toContain('Neighbor Solicitation')
  })

  it('warns that IPv6 does not use ARP', () => {
    expect(getNeighborModeSummary('ipv6-nd').warning.toLowerCase()).toContain('not')
    expect(getNeighborModeSummary('ipv6-nd').warning).toContain('ARP')
  })
})
