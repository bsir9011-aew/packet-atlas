import type { JourneyStage, LayerLens } from '../schema/journeyScenarioSchema'
export type TransformStep = { id: LayerLens; icon: string; label: string; wrapper: string; visible: boolean; example: string; action: string }
const order: Omit<TransformStep,'visible'>[] = [
  { id:'human', icon:'👤', label:'Human intent', wrapper:'Goal', example:'open https://example.com', action:'starts as intention' },
  { id:'application', icon:'🌐', label:'Application meaning', wrapper:'HTTP/DNS/App', example:'GET / or DNS question', action:'turns goal into protocol semantics' },
  { id:'tls', icon:'🔐', label:'TLS protection', wrapper:'Security wrapper', example:'TLS records / encrypted data', action:'protects application bytes' },
  { id:'transport', icon:'🚚', label:'Transport wrapper', wrapper:'TCP/UDP', example:'ports, stream, flags', action:'identifies endpoint process/flow' },
  { id:'network', icon:'🧭', label:'Network wrapper', wrapper:'IP packet', example:'src IP → dst IP', action:'makes routing possible' },
  { id:'link', icon:'🔌', label:'Local delivery wrapper', wrapper:'Ethernet/Wi‑Fi frame', example:'src MAC → dst MAC', action:'moves across one local hop' },
  { id:'physical', icon:'〰️', label:'Signal view', wrapper:'Bits / symbols', example:'medium-dependent signal', action:'serializes frame into the medium' },
]
export function getTransformSteps(stage: JourneyStage): TransformStep[] { const visible=new Set(stage.layerFocus); const steps=order.map(s=>({...s, visible: visible.has(s.id)})); return stage.direction==='response' ? [...steps].reverse() : steps }
export function getTransformMode(stage: JourneyStage): 'wrap'|'unwrap'|'internal' { if(stage.direction==='response') return 'unwrap'; if(stage.direction==='internal') return 'internal'; return 'wrap' }
export function getTransformHeadline(stage: JourneyStage): string { const mode=getTransformMode(stage); if(mode==='unwrap') return 'Response travels upward: signal becomes useful content again.'; if(mode==='internal') return 'Internal processing: payload changes meaning inside infrastructure.'; return 'Request travels downward: intent gets wrapped for transport.' }
export function getNatTransformNote(stage: JourneyStage): string | null { const a=stage.addresses; if(!a?.natSrcIp && !a?.natSrcPort) return null; return `NAT transform: ${a.srcIp ?? 'source IP'}:${a.srcPort ?? 'source port'} → ${a.natSrcIp ?? 'public IP'}:${a.natSrcPort ?? 'public port'}` }
