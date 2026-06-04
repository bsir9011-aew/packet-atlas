import { describe, expect, it } from 'vitest'
import { scenarioVariants } from '../../src/features/packet-atlas/variants/scenarioVariants'

describe('variant impact overlay data', () => {
  it('marks every non-baseline variant with affected stages', () => {
    const failureVariants = scenarioVariants.filter(
      (variant) => variant.id !== 'happy-path',
    )

    expect(failureVariants.length).toBeGreaterThan(0)

    for (const variant of failureVariants) {
      expect(variant.affectedStageIds.length).toBeGreaterThan(0)
    }
  })

  it('has a diagnostic angle for every variant', () => {
    for (const variant of scenarioVariants) {
      expect(variant.diagnosticAngle.length).toBeGreaterThan(12)
    }
  })
})
