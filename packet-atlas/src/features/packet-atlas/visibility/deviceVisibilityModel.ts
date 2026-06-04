import type { JourneyStage, LayerLens } from '../schema/journeyScenarioSchema'

export type VisibilityActorId =
  | 'user'
  | 'browser'
  | 'client-os'
  | 'switch'
  | 'router'
  | 'dns'
  | 'proxy'
  | 'app'
  | 'db'

export type VisibilityActor = {
  id: VisibilityActorId
  title: string
  icon: string
  seesLayers: LayerLens[]
  canSee: string[]
  cannotSee: string[]
  typicalLogs: string[]
}

export const visibilityActors: VisibilityActor[] = [
  {
    id: 'user',
    title: 'User',
    icon: '👤',
    seesLayers: ['human'],
    canSee: ['URL text', 'waiting/loading state', 'browser error page', 'rendered content'],
    cannotSee: ['DNS packets', 'TCP flags', 'TLS records', 'MAC addresses', 'NAT table'],
    typicalLogs: ['none — user reports symptoms, not packets'],
  },
  {
    id: 'browser',
    title: 'Browser',
    icon: '🌐',
    seesLayers: ['human', 'application', 'tls'],
    canSee: ['URL', 'HTTP request/response', 'TLS certificate status', 'render timing'],
    cannotSee: ['switch MAC table', 'router NAT internals', 'raw PHY signal'],
    typicalLogs: ['DevTools Network tab', 'browser console', 'certificate/security UI'],
  },
  {
    id: 'client-os',
    title: 'Client OS',
    icon: '💻',
    seesLayers: ['transport', 'network', 'link'],
    canSee: ['sockets', 'ports', 'routes', 'ARP/neighbor table', 'local interface counters'],
    cannotSee: ['remote app logs', 'reverse proxy upstream state', 'database query result'],
    typicalLogs: ['ss/netstat', 'ip route', 'ip neigh', 'tcpdump on client'],
  },
  {
    id: 'switch',
    title: 'Switch',
    icon: '🔀',
    seesLayers: ['link', 'physical'],
    canSee: ['Ethernet frames', 'source/destination MAC', 'port/VLAN behavior'],
    cannotSee: ['HTTP method', 'TLS certificate reason', 'database error'],
    typicalLogs: ['MAC address table', 'interface counters', 'VLAN/port status'],
  },
  {
    id: 'router',
    title: 'Router / NAT / Firewall',
    icon: '🧭',
    seesLayers: ['transport', 'network', 'link'],
    canSee: ['source/destination IP', 'ports', 'NAT mapping', 'firewall state', 'TTL/routing'],
    cannotSee: ['HTTPS body', 'browser DOM', 'database rows'],
    typicalLogs: ['NAT table', 'firewall logs', 'conntrack', 'routing table'],
  },
  {
    id: 'dns',
    title: 'DNS Resolver',
    icon: '📘',
    seesLayers: ['application', 'transport', 'network'],
    canSee: ['queried name', 'record type', 'answer', 'client resolver address'],
    cannotSee: ['HTTP GET body', 'TLS encrypted app data', 'browser render result'],
    typicalLogs: ['resolver query log', 'cache hit/miss', 'rcode/NXDOMAIN/SERVFAIL'],
  },
  {
    id: 'proxy',
    title: 'Reverse Proxy',
    icon: '🚪',
    seesLayers: ['application', 'tls', 'transport', 'network'],
    canSee: ['TLS termination', 'HTTP method/path/host after decrypt', 'upstream target', 'status code'],
    cannotSee: ['client local MAC', 'home switch port', 'database internals unless logged'],
    typicalLogs: ['nginx/access log', 'TLS handshake/cert logs', 'upstream timing'],
  },
  {
    id: 'app',
    title: 'App Server',
    icon: '🧩',
    seesLayers: ['application'],
    canSee: ['route/controller', 'business logic', 'request context', 'app exceptions'],
    cannotSee: ['original Wi‑Fi signal', 'client ARP', 'switch forwarding decision'],
    typicalLogs: ['application logs', 'trace id', 'exception stack', 'request handler timing'],
  },
  {
    id: 'db',
    title: 'Database',
    icon: '🗄️',
    seesLayers: ['application'],
    canSee: ['SQL query', 'transaction state', 'locks', 'query time'],
    cannotSee: ['DNS lookup', 'TLS ClientHello', 'client MAC', 'browser URL bar'],
    typicalLogs: ['slow query log', 'query plan', 'lock waits', 'connection pool symptoms'],
  },
]

export function actorMatchesStage(actor: VisibilityActor, stage: JourneyStage): boolean {
  return (
    actor.id === stage.device.nodeId ||
    actor.seesLayers.some((layer) => stage.layerFocus.includes(layer))
  )
}

export function actorMatchesLens(actor: VisibilityActor, lens: LayerLens): boolean {
  return actor.seesLayers.includes(lens)
}

export function getStageVisibilitySummary(stage: JourneyStage): string {
  const role = stage.device.role

  if (role === 'switch') return 'This is mostly a local delivery view: frames, MACs, ports and medium behavior.'
  if (role === 'router' || role === 'firewall') return 'This is a forwarding/state view: IPs, ports, NAT and route decisions.'
  if (role === 'dns') return 'This is a name-resolution view: question, answer and resolver behavior.'
  if (role === 'proxy') return 'This is the edge-server view: TLS termination, HTTP routing and upstream behavior.'
  if (role === 'app') return 'This is the application view: request handling and internal dependency logic.'
  if (role === 'db') return 'This is the data dependency view: query, transaction and storage behavior.'
  if (role === 'browser') return 'This is the browser view: URL, cache, TLS status, HTTP semantics and rendering.'
  if (role === 'os' || role === 'nic') return 'This is the host networking view: sockets, routes, ARP and interface behavior.'
  return 'This is the human-visible view: intent, waiting, errors and rendered result.'
}
