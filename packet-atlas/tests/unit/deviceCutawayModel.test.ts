import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { buildDeviceCutaway } from '../../src/features/packet-atlas/device-cutaway/deviceCutawayModel'

describe('device cutaway model', () => {
  it('creates internal parts for active stage device role', () => {
    const stage = httpsExampleScenario.stages.find((item)=>item.id === 'lan-frame')!
    const parts = buildDeviceCutaway(stage)
    expect(parts.length).toBeGreaterThan(0)
    expect(parts.some((part)=>part.cannotAssume.length > 0)).toBe(true)
  })
})
