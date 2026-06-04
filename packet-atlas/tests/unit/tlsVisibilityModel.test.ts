import { describe, expect, it } from 'vitest'
import { countVisibleTlsFacts, getTlsVisibilityMode } from '../../src/features/packet-atlas/tls-visibility/tlsVisibilityModel'

describe('tls visibility model', () => {
  it('shows that TLS hides HTTP but not all metadata', () => {
    const tls = getTlsVisibilityMode('tls13-no-ech')
    expect(tls.facts.find((fact) => fact.id === 'http-content')?.visible).toBe(false)
    expect(tls.facts.find((fact) => fact.id === 'ip-port')?.visible).toBe(true)
    expect(countVisibleTlsFacts('tls13-ech-preview')).toBeGreaterThan(0)
  })
})
