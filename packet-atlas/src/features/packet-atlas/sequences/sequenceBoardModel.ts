import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { getScenarioVariant } from '../variants/scenarioVariants'
export type SequenceItemStatus = 'done' | 'active' | 'future' | 'break' | 'cut-off'
export type SequenceItem = { id: string; label: string; from: string; to: string; payload: string; stageId: string; status: SequenceItemStatus }
const baseSequences: Record<string, Omit<SequenceItem,'status'>[]> = {
  dns:[{id:'dns-1',label:'Query',from:'Client OS',to:'DNS resolver',payload:'Who is example.com?',stageId:'dns-query'},{id:'dns-2',label:'Answer',from:'DNS resolver',to:'Client OS',payload:'203.0.113.10',stageId:'dns-response'}],
  arp:[{id:'arp-1',label:'Who-has',from:'Client OS',to:'LAN broadcast',payload:'Who has gateway IP?',stageId:'arp-gateway'},{id:'arp-2',label:'Local frame',from:'Client NIC',to:'Switch',payload:'Frame to gateway MAC',stageId:'lan-frame'}],
  tcp:[{id:'tcp-1',label:'SYN',from:'Client',to:'Server:443',payload:'Open connection',stageId:'tcp-handshake'},{id:'tcp-2',label:'SYN/ACK',from:'Server:443',to:'Client',payload:'I hear you',stageId:'tcp-handshake'},{id:'tcp-3',label:'ACK',from:'Client',to:'Server:443',payload:'Connection established',stageId:'tcp-handshake'}],
  tls:[{id:'tls-1',label:'ClientHello',from:'Browser',to:'Server edge',payload:'TLS options + SNI/ALPN',stageId:'tls-handshake'},{id:'tls-2',label:'Server flight',from:'Server edge',to:'Browser',payload:'TLS parameters + certificate',stageId:'tls-handshake'},{id:'tls-3',label:'Protected channel',from:'Both endpoints',to:'Both endpoints',payload:'Encrypted application data can begin',stageId:'http-request'}],
  http:[{id:'http-1',label:'GET /',from:'Browser',to:'Reverse proxy',payload:'Request main document',stageId:'http-request'},{id:'http-2',label:'Forward',from:'Reverse proxy',to:'App server',payload:'Route to upstream/app',stageId:'reverse-proxy'},{id:'http-3',label:'Handle',from:'App server',to:'DB/internal',payload:'Create response',stageId:'app-db'},{id:'http-4',label:'200/500 response',from:'Server side',to:'Browser',payload:'Response body/status',stageId:'http-response'}],
}
export function getSequenceKind(stage: JourneyStage): keyof typeof baseSequences { if(stage.stageKind.includes('dns')) return 'dns'; if(stage.stageKind.includes('arp')||stage.stageKind.includes('ethernet')) return 'arp'; if(stage.stageKind.includes('tcp')) return 'tcp'; if(stage.stageKind.includes('tls')) return 'tls'; return 'http' }
function stageIndex(scenario: JourneyScenario, stageId: string) { return scenario.stages.findIndex(s=>s.id===stageId) }
export function buildSequenceBoard(scenario: JourneyScenario, activeStage: JourneyStage, variantId: string): { kind: string; items: SequenceItem[]; breakStageId: string | null } {
  const variant=getScenarioVariant(variantId); const kind=getSequenceKind(activeStage); const activeIndex=stageIndex(scenario,activeStage.id); const breakIndex=variant.breakStageId?stageIndex(scenario,variant.breakStageId):-1
  const items=baseSequences[kind].map(item=>{ const itemIndex=stageIndex(scenario,item.stageId); let status: SequenceItemStatus=item.stageId===activeStage.id?'active':itemIndex<activeIndex?'done':'future'; if(variant.breakStageId===item.stageId) status='break'; else if(breakIndex>=0 && itemIndex>breakIndex) status='cut-off'; return {...item,status} })
  return { kind, items, breakStageId: variant.breakStageId ?? null }
}
