import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { getScenarioVariant } from '../variants/scenarioVariants'

export type FirewallDecision = 'allow-new' | 'allow-established' | 'drop' | 'not-applicable'
export type FirewallFlowRow = { stageId: string; stageName: string; tuple: string; direction: string; state: 'NEW' | 'SYN_SENT' | 'ESTABLISHED' | 'DROPPED' | 'N/A'; decision: FirewallDecision; explanation: string }
function tuple(stage: JourneyStage) { const a=stage.addresses; return a?.srcIp && a?.dstIp ? `${a.srcIp}:${a.srcPort ?? '*'} → ${a.dstIp}:${a.dstPort ?? '*'}` : 'no 5-tuple yet' }
export function buildFirewallRows(scenario: JourneyScenario, variantId: string): FirewallFlowRow[] {
  const variant = getScenarioVariant(variantId)
  const tcpBlocked = variant.id === 'tcp-blocked'
  return scenario.stages
    .filter((stage) => stage.layerFocus.includes('transport') || stage.layerFocus.includes('network'))
    .map((stage) => {
      const isBreak = tcpBlocked && stage.id === 'tcp-handshake'
      const isResponse = stage.direction === 'response'
      return {
        stageId: stage.id,
        stageName: stage.shortName,
        tuple: tuple(stage),
        direction: stage.direction,
        state: isBreak ? 'DROPPED' : stage.stageKind.includes('tcp') ? 'SYN_SENT' : isResponse ? 'ESTABLISHED' : stage.addresses?.srcPort ? 'NEW' : 'N/A',
        decision: isBreak ? 'drop' : isResponse ? 'allow-established' : stage.addresses?.srcPort ? 'allow-new' : 'not-applicable',
        explanation: isBreak ? 'Selected variant blocks the TCP setup, so no established flow is created.' : isResponse ? 'Return traffic is allowed because it belongs to an existing tracked conversation.' : 'Firewall can evaluate tuple, direction and policy at this point.',
      }
    })
}
export function summarizeFirewallRows(rows: FirewallFlowRow[]) { return { allowed: rows.filter(r=>r.decision.startsWith('allow')).length, dropped: rows.filter(r=>r.decision==='drop').length, tracked: rows.filter(r=>r.state !== 'N/A').length } }
