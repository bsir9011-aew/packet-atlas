import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildByteGroups, flattenBytes } from '../../src/features/packet-atlas/bytes/packetBytesModel'

describe('packet bytes model', () => {
  it('builds synthetic byte groups for packet-like stages', () => {
    const stage = httpsExampleScenario.stages.find((item)=>item.id === 'tcp-handshake')!
    const groups = buildByteGroups(stage)
    expect(groups.length).toBeGreaterThan(0)
    expect(flattenBytes(groups).length).toBeGreaterThan(0)
  })
})
