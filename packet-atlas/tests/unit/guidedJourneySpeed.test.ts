import { describe, expect, it } from 'vitest'
import { traceSpeedMs } from '../../src/features/packet-atlas/cinematic/cinematicTraceModel'
import { useAtlasStore } from '../../src/features/packet-atlas/store/atlasStore'

describe('guided journey speed reset', () => {
  it('makes autoplay slow enough to read', () => {
    expect(traceSpeedMs.slow).toBeGreaterThanOrEqual(8000)
    expect(traceSpeedMs.normal).toBeGreaterThanOrEqual(5000)
    expect(traceSpeedMs.fast).toBeGreaterThanOrEqual(3000)
  })

  it('uses slow speed as the default', () => {
    expect(useAtlasStore.getState().animatedJourneySpeed).toBe('slow')
  })
})
