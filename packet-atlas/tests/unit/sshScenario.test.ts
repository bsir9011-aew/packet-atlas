import { describe, expect, it } from 'vitest'
import { sshConnectionScenario } from '../../src/features/packet-atlas/scenarios/sshConnectionScenario'
import { scenarioRegistry } from '../../src/features/packet-atlas/scenarios/scenarioRegistry'

describe('SSH connection scenario', () => {
  it('is registered as a ready scenario', () => {
    expect(scenarioRegistry.some((item) => item.id === 'ssh-connection-basic' && item.status === 'ready')).toBe(true)
  })
  it('models an SSH TCP/22 journey', () => {
    expect(sshConnectionScenario.stages.some((stage) => stage.id === 'ssh-tcp-handshake')).toBe(true)
    const tcp = sshConnectionScenario.stages.find((stage) => stage.id === 'ssh-tcp-handshake')
    expect(tcp?.addresses?.dstPort).toBe(22)
  })
})
