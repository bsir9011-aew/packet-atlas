import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'

export type PathScopeId =
  | 'all'
  | 'request'
  | 'response'
  | 'internal'
  | 'client-side'
  | 'local-lan'
  | 'internet-edge'
  | 'server-side'

export type PathScope = {
  id: PathScopeId
  label: string
  description: string
}

export const pathScopes: PathScope[] = [
  { id: 'all', label: 'All', description: 'Full request/response journey.' },
  { id: 'request', label: 'Request only', description: 'Outbound path from user intent to server edge.' },
  { id: 'response', label: 'Response only', description: 'Return path from server response to browser render.' },
  { id: 'internal', label: 'Internal', description: 'Server-side hops behind the public edge.' },
  { id: 'client-side', label: 'Client side', description: 'User, browser and client operating system stages.' },
  { id: 'local-lan', label: 'Local LAN', description: 'ARP, Ethernet, switch and local gateway context.' },
  { id: 'internet-edge', label: 'Internet edge', description: 'Router/NAT, DNS resolver and public proxy boundary.' },
  { id: 'server-side', label: 'Server side', description: 'Proxy, application and database work.' },
]

export function stageMatchesPathScope(stage: JourneyStage, scopeId: PathScopeId) {
  if (scopeId === 'all') return true
  if (scopeId === 'request') return stage.direction === 'request'
  if (scopeId === 'response') return stage.direction === 'response'
  if (scopeId === 'internal') return stage.direction === 'internal'
  if (scopeId === 'client-side') return ['user', 'browser', 'os', 'nic'].includes(stage.device.role)
  if (scopeId === 'local-lan') return ['arp-request', 'arp-response', 'ethernet-frame'].includes(stage.stageKind) || ['switch'].includes(stage.device.role)
  if (scopeId === 'internet-edge') return ['router', 'firewall', 'dns', 'proxy'].includes(stage.device.role)
  if (scopeId === 'server-side') return ['proxy', 'app', 'db'].includes(stage.device.role)
  return true
}

export function getStagesForPathScope(scenario: JourneyScenario, scopeId: PathScopeId) {
  return scenario.stages.filter((stage) => stageMatchesPathScope(stage, scopeId))
}
