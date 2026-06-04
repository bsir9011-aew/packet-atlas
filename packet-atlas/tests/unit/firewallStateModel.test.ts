import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildFirewallRows, summarizeFirewallRows } from '../../src/features/packet-atlas/firewall/firewallStateModel'

describe('stateful firewall model', () => {
  it('builds firewall rows from network or transport stages', () => {
    const rows = buildFirewallRows(httpsExampleScenario, 'happy-path')
    expect(rows.length).toBeGreaterThan(0)
    expect(summarizeFirewallRows(rows).tracked).toBeGreaterThan(0)
  })
  it('marks TCP blocked variant as dropped when available', () => {
    const rows = buildFirewallRows(httpsExampleScenario, 'tcp-blocked')
    expect(rows.some((row) => row.decision === 'drop')).toBe(true)
  })
})
