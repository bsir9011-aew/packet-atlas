import { describe, expect, it } from 'vitest'
import { buildAtlasInventorySummary, listAtlasInventoryItems } from '../../src/features/packet-atlas/inventory/atlasInventoryModel'

describe('atlas inventory model', () => {
  it('summarizes visible features, evidence and tooling', () => {
    const summary = buildAtlasInventorySummary()
    expect(summary.title).toContain('What exists')
    expect(summary.itemCount).toBeGreaterThanOrEqual(8)
    expect(summary.groups.Capture.map((item) => item.id)).toContain('contrast-workspace')
    expect(summary.strongestProof).toContain('HTTPS vs HTTP contrast')
  })
  it('contains evidence and tooling items', () => {
    const items = listAtlasInventoryItems()
    expect(items.some((item) => item.status === 'evidence')).toBe(true)
    expect(items.some((item) => item.status === 'tooling')).toBe(true)
  })
})
