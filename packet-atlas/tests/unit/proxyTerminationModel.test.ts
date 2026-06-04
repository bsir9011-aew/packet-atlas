import { describe, expect, it } from 'vitest'
import { getProxyTerminationMode, observerCanSeeHttp } from '../../src/features/packet-atlas/proxy-termination/proxyTerminationModel'

describe('proxy termination model', () => {
  it('distinguishes proxy termination from pass-through', () => {
    expect(observerCanSeeHttp('terminate-at-proxy', 'reverse-proxy')).toBe(true)
    expect(observerCanSeeHttp('tls-pass-through', 'reverse-proxy')).toBe(false)
    expect(getProxyTerminationMode('re-encrypt-upstream').boundary).toContain('Two TLS')
  })
})
