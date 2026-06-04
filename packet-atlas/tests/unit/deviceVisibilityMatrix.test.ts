import { describe, expect, it } from 'vitest'
import { visibilityActors } from '../../src/features/packet-atlas/visibility/deviceVisibilityModel'

describe('device visibility model', () => {
  it('contains the main observer roles', () => {
    const ids = new Set(visibilityActors.map((actor) => actor.id))
    expect(ids.has('browser')).toBe(true)
    expect(ids.has('switch')).toBe(true)
    expect(ids.has('router')).toBe(true)
    expect(ids.has('proxy')).toBe(true)
    expect(ids.has('app')).toBe(true)
  })

  it('does not pretend that every actor sees everything', () => {
    for (const actor of visibilityActors) {
      expect(actor.canSee.length).toBeGreaterThan(0)
      expect(actor.cannotSee.length).toBeGreaterThan(0)
      expect(actor.typicalLogs.length).toBeGreaterThan(0)
    }
  })
})
