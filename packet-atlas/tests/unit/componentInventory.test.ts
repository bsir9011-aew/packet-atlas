import { describe, expect, it } from 'vitest'
import {
  componentInventory,
  groupInventoryByArea,
} from '../../src/features/packet-atlas/component-lab/componentInventory'

describe('component inventory', () => {
  it('catalogs core atlas components by area', () => {
    expect(componentInventory.length).toBeGreaterThan(5)
    expect(
      componentInventory.some((item) => item.name === 'GlobalJourneyMap'),
    ).toBe(true)
    expect(
      componentInventory.some((item) => item.area === 'diagnostics'),
    ).toBe(true)
    expect(groupInventoryByArea().journey.length).toBeGreaterThan(0)
  })
})
