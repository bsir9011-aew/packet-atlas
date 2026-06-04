import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildNatStateRows } from '../../src/features/packet-atlas/nat/natStateModel'

describe('NAT state model', () => {
  it('finds translated endpoints in HTTPS baseline', () => {
    const rows = buildNatStateRows(httpsExampleScenario)
    expect(rows.some((row) => row.insideGlobal.includes('198.51.100.2'))).toBe(true)
  })
})
