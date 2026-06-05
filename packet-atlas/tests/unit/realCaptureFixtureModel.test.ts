import { describe, expect, it } from 'vitest'
import {
  getPendingRealCaptureStages,
  hasRealFrames,
  type RealCapturePlaceholder,
} from '../../src/features/packet-atlas/captures/realCaptureFixtureModel'

describe('real capture fixture scaffold', () => {
  it('tracks pending real capture stages', () => {
    const fixture: RealCapturePlaceholder = {
      id: 'x',
      kind: 'real-capture-placeholder',
      status: 'pending-real-capture',
      note: 'pending',
      stageFramePlan: [
        {
          stageId: 'dns-query',
          expectedFrameKind: 'dns-query',
          requiredLayers: ['dns'],
        },
      ],
      frames: [],
    }

    expect(getPendingRealCaptureStages(fixture)).toEqual(['dns-query'])
    expect(hasRealFrames(fixture)).toBe(false)
  })
})
