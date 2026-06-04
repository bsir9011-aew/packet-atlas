import type { JourneyStage } from '../schema/journeyScenarioSchema'
export type ByteGroup = { layer: string; label: string; bytes: string[]; meaning: string; synthetic: boolean }
function pseudoBytes(seed: string, count: number): string[] { let hash = 17; for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) % 255; return Array.from({length:count}, (_,i)=>((hash + i*29) % 256).toString(16).padStart(2,'0').toUpperCase()) }
export function buildByteGroups(stage: JourneyStage): ByteGroup[] {
  const groups: ByteGroup[] = []
  if (stage.representations.ethernet || stage.addresses?.srcMac) groups.push({ layer:'Ethernet', label:'Frame header', bytes:pseudoBytes(stage.id+'eth',14), meaning:'Local delivery wrapper: source/destination MAC and EtherType.', synthetic:true })
  if (stage.representations.ip || stage.addresses?.srcIp) groups.push({ layer:'IPv4', label:'IP packet header', bytes:pseudoBytes(stage.id+'ip',20), meaning:'Routing wrapper: source/destination IP, TTL and protocol number.', synthetic:true })
  if (stage.representations.tcp || stage.addresses?.srcPort) groups.push({ layer: stage.stageKind.includes('dns') ? 'UDP' : 'TCP', label:'Transport header', bytes:pseudoBytes(stage.id+'tcp', stage.stageKind.includes('dns') ? 8 : 20), meaning:'Transport metadata: ports, flags or datagram length.', synthetic:true })
  if (stage.representations.tls) groups.push({ layer:'TLS', label:'TLS record / handshake', bytes:pseudoBytes(stage.id+'tls',24), meaning:'Security wrapper or encrypted application record.', synthetic:true })
  if (stage.representations.http) groups.push({ layer:'HTTP', label:'Application payload', bytes:pseudoBytes(stage.id+'http',32), meaning:'Application meaning at endpoints; often encrypted on the path.', synthetic:true })
  if (stage.representations.human && groups.length === 0) groups.push({ layer:'Human', label:'No packet bytes yet', bytes:[], meaning:'This stage is still above packet representation.', synthetic:true })
  return groups
}
export function flattenBytes(groups: ByteGroup[]): string[] { return groups.flatMap((group)=>group.bytes) }
