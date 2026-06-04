import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
export type CaptureFrameFixture = { stageId: string; frameNumber: number; protocolStack: string[]; summary: string; fields: Record<string, string> }
export const captureFixtures: CaptureFrameFixture[] = [
  { stageId:'dns-query', frameNumber:3, protocolStack:['eth','ip','udp','dns'], summary:'DNS query example.com A', fields:{'ip.src':'192.168.1.10','ip.dst':'198.51.100.53','udp.srcport':'53001','udp.dstport':'53','dns.qry.name':'example.com'} },
  { stageId:'tcp-handshake', frameNumber:8, protocolStack:['eth','ip','tcp'], summary:'TCP SYN to 203.0.113.10:443', fields:{'ip.src':'192.168.1.10','ip.dst':'203.0.113.10','tcp.srcport':'51514','tcp.dstport':'443','tcp.flags.syn':'1'} },
  { stageId:'tls-handshake', frameNumber:14, protocolStack:['eth','ip','tcp','tls'], summary:'TLS ClientHello with SNI example.com', fields:{'tls.handshake.type':'client_hello','tls.handshake.extensions_server_name':'example.com','tcp.dstport':'443'} },
  { stageId:'http-request', frameNumber:18, protocolStack:['eth','ip','tcp','tls','http'], summary:'HTTP GET / inside protected channel', fields:{'http.request.method':'GET','http.host':'example.com','http.request.uri':'/'} },
]
export function getFixtureForStage(stageId: string): CaptureFrameFixture | null { return captureFixtures.find(f=>f.stageId===stageId) ?? null }
export function summarizeFixtureCoverage(scenario: JourneyScenario): { attached: number; missing: number; total: number } { const attached=scenario.stages.filter(s=>getFixtureForStage(s.id)).length; return {attached, missing:scenario.stages.length-attached, total:scenario.stages.length} }
export function isFixtureRelevantToStage(stage: JourneyStage): boolean { return Boolean(getFixtureForStage(stage.id)) }
