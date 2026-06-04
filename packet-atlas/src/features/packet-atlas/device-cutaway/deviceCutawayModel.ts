import type { JourneyStage } from '../schema/journeyScenarioSchema'
export type CutawayPart = { name: string; sees: string; action: string; cannotAssume: string }
export function buildDeviceCutaway(stage: JourneyStage): CutawayPart[] {
  const role = stage.device.role
  if (role === 'browser') return [
    { name:'URL/navigation layer', sees:'URL, scheme, host and document intent', action:'Decides what resource should be requested', cannotAssume:'It does not directly forward Ethernet frames' },
    { name:'HTTP/TLS stack', sees:'HTTP meaning and TLS session APIs', action:'Builds request and asks for a protected channel', cannotAssume:'Network observers see the same plain HTTP' },
  ]
  if (role === 'os') return [
    { name:'Resolver/routing layer', sees:'names, destination IPs, routes and sockets', action:'Chooses resolver, gateway and local ports', cannotAssume:'It knows the remote server MAC address' },
    { name:'NIC boundary', sees:'local frames and next-hop MAC', action:'Hands packets to local medium', cannotAssume:'It understands website business logic' },
  ]
  if (role === 'switch') return [
    { name:'Ingress port', sees:'source MAC and frame arrival port', action:'Learns MAC table entries', cannotAssume:'It knows the URL or HTTP status' },
    { name:'Forwarding table', sees:'destination MAC and VLAN/local segment', action:'Selects egress port or floods unknown destination', cannotAssume:'It routes across the Internet' },
  ]
  if (role === 'router' || role === 'firewall') return [
    { name:'Routing/NAT engine', sees:'IP addresses, ports and next hop', action:'Routes, translates and tracks state', cannotAssume:'It can read encrypted HTTP body' },
    { name:'Policy/state table', sees:'5-tuple, direction and connection state', action:'Allows, drops or reverse-translates traffic', cannotAssume:'Return traffic is random inbound traffic' },
  ]
  if (role === 'dns') return [{ name:'Resolver logic', sees:'domain question and answer data', action:'Returns address information or failure', cannotAssume:'It fetches the web page content' }]
  if (role === 'proxy') return [{ name:'Edge/proxy layer', sees:'connection, TLS termination point and HTTP if decrypted here', action:'Routes request to upstream app', cannotAssume:'Backend and public edge are always the same machine' }]
  if (role === 'app') return [{ name:'Application handler', sees:'business/application request', action:'Builds response or calls internal services', cannotAssume:'It sees the client LAN MAC address' }]
  if (role === 'db') return [{ name:'Database engine', sees:'query/data operation', action:'Returns internal data to app', cannotAssume:'It sees browser URL bar or TCP handshake' }]
  return [{ name:'Human interface', sees:'visible URL, loading state and rendered response', action:'Creates the original intent', cannotAssume:'It sees packets, ports or TLS records directly' }]
}
export function summarizeCutaway(stage: JourneyStage): string { return `${stage.device.role} view during ${stage.shortName}` }
