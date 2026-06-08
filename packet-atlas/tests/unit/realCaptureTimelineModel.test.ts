import { describe, expect, it } from 'vitest'
import { buildRealCaptureTimelineSummary } from '../../src/features/packet-atlas/real-capture/realCaptureTimelineModel'

describe('real capture timeline model', () => {
  it('groups the real capture into evidence phases', () => {
    const summary = buildRealCaptureTimelineSummary()

    expect(summary.frameCount).toBe(23)
    expect(summary.groupCount).toBeGreaterThanOrEqual(3)
    expect(summary.groups.map((group) => group.id)).toContain('dns')
    expect(summary.groups.map((group) => group.id)).toContain('tcp')
    expect(summary.groups.map((group) => group.id)).toContain('tls')
    expect(summary.story).toContain('name lookup')
  })

  it('keeps frame references for every group', () => {
    const summary = buildRealCaptureTimelineSummary()
    const totalGroupedFrames = summary.groups.reduce((sum, group) => sum + group.frameCount, 0)

    expect(totalGroupedFrames).toBe(23)
    expect(summary.groups.every((group) => group.frameNumbers.length === group.frameCount)).toBe(true)
  })
})
