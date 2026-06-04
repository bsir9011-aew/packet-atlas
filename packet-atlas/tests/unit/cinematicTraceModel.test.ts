import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'
import { getNextStageId, getPreviousStageId, getTraceProgress } from '../../src/features/packet-atlas/cinematic/cinematicTraceModel'

describe('cinematic trace model', () => {
  it('moves between stages safely', () => {
    expect(getNextStageId(httpsExampleScenario, 'url-intent')).toBe('browser-checks')
    expect(getPreviousStageId(httpsExampleScenario, 'url-intent')).toBe('url-intent')
  })
  it('computes progress percentage', () => {
    expect(getTraceProgress(httpsExampleScenario, 'url-intent')).toBeGreaterThan(0)
  })
})
