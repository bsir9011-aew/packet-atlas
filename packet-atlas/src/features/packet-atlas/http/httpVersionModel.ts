import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
export type HttpVersionId = 'http11' | 'http2'
export type HttpVersionProfile = { id: HttpVersionId; label: string; alpn: string; transport: string; requestShape: string; responseShape: string; multiplexing: string; visibleChange: string; sequence: string[] }
export const httpVersionProfiles: HttpVersionProfile[] = [
  { id:'http11', label:'HTTP/1.1 baseline', alpn:'http/1.1', transport:'TCP + TLS 1.3', requestShape:'Text-like request model: GET / + Host header', responseShape:'Status line + headers + body', multiplexing:'No multiplexing in this simplified baseline', visibleChange:'Matches the current frozen scenario.', sequence:['TLS ALPN offers http/1.1','Client sends GET /','Server returns 200 OK','Connection can close or be reused later'] },
  { id:'http2', label:'HTTP/2 variant', alpn:'h2', transport:'TCP + TLS 1.3', requestShape:'Binary HTTP/2 HEADERS/DATA frames inside one connection', responseShape:'HEADERS + DATA frames, with stream identifiers', multiplexing:'Multiple streams can share one TCP/TLS connection', visibleChange:'The map is similar, but HTTP becomes framed and multiplexed after TLS.', sequence:['TLS ALPN negotiates h2','Client opens stream 1 with HEADERS','Server responds with HEADERS and DATA','Other streams could share the same connection'] },
]
export function getHttpStages(scenario: JourneyScenario): JourneyStage[] { return scenario.stages.filter((stage)=>stage.layerFocus.includes('application') || stage.stageKind.includes('http') || stage.stageKind.includes('proxy')) }
export function getHttpProfile(id: string): HttpVersionProfile { return httpVersionProfiles.find((profile)=>profile.id===id) ?? httpVersionProfiles[0] }
export function http2ChangesStage(stage: JourneyStage): boolean { return ['tls-handshake','http-request','http-response','reverse-proxy'].includes(stage.id) || stage.stageKind.includes('http') }
