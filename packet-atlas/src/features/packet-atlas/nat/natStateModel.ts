import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'

export type NatStateRow = {
  stageId: string
  stageName: string
  protocol: 'TCP' | 'UDP' | 'unknown'
  insideLocal: string
  insideGlobal: string
  outsideGlobal: string
  state: 'created' | 'used' | 'reverse-translation' | 'none'
  explanation: string
}

function endpoint(ip?: string, port?: number) { return ip ? `${ip}${port ? `:${port}` : ''}` : '—' }
function protocolFor(stage: JourneyStage): NatStateRow['protocol'] {
  if (stage.stageKind.includes('dns')) return 'UDP'
  if (stage.addresses?.dstPort === 443 || stage.addresses?.dstPort === 22 || stage.stageKind.includes('tcp')) return 'TCP'
  return 'unknown'
}

export function buildNatStateRows(scenario: JourneyScenario): NatStateRow[] {
  return scenario.stages
    .filter((stage) => stage.addresses?.natSrcIp || stage.stageKind.includes('nat'))
    .map((stage) => ({
      stageId: stage.id,
      stageName: stage.shortName,
      protocol: protocolFor(stage),
      insideLocal: endpoint(stage.addresses?.srcIp, stage.addresses?.srcPort),
      insideGlobal: endpoint(stage.addresses?.natSrcIp, stage.addresses?.natSrcPort),
      outsideGlobal: endpoint(stage.addresses?.dstIp, stage.addresses?.dstPort),
      state: stage.direction === 'response' ? 'reverse-translation' : stage.addresses?.natSrcIp ? 'created' : 'used',
      explanation: stage.addresses?.natSrcIp
        ? 'The router maps a private source endpoint to a public source endpoint so replies can return.'
        : 'This stage references NAT behavior but has no explicit translated endpoint yet.',
    }))
}

export function getNatRowForStage(scenario: JourneyScenario, stageId: string): NatStateRow | null {
  return buildNatStateRows(scenario).find((row) => row.stageId === stageId) ?? null
}
