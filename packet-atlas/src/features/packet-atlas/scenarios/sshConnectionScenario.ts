import { JourneyScenarioSchema, type JourneyScenario } from '../schema/journeyScenarioSchema'

type StageInput = {
  id: string
  shortName: string
  direction: 'request' | 'response' | 'internal'
  stageKind: string
  layerFocus: Array<'human' | 'application' | 'tls' | 'transport' | 'network' | 'link' | 'physical'>
  role: 'user' | 'browser' | 'os' | 'nic' | 'switch' | 'router' | 'firewall' | 'dns' | 'proxy' | 'app' | 'db'
  nodeId: string
  payloadRef?: string
  x: number
  y: number
  previousIds: string[]
  nextIds: string[]
  summary: string
  same: string
  trap: string
  matters: string
  analogy: string
  representations?: Record<string, Record<string, unknown>>
  addresses?: JourneyScenario['stages'][number]['addresses']
}

function makeStage(input: StageInput): JourneyScenario['stages'][number] {
  return {
    id: input.id,
    shortName: input.shortName,
    direction: input.direction,
    stageKind: input.stageKind,
    layerFocus: input.layerFocus,
    device: { nodeId: input.nodeId, role: input.role },
    payloadRef: input.payloadRef ?? 'ssh-session-request',
    addresses: input.addresses,
    representations: {
      human: input.representations?.human,
      http: input.representations?.http,
      tls: input.representations?.tls,
      tcp: input.representations?.tcp,
      ip: input.representations?.ip,
      ethernet: input.representations?.ethernet,
      bits: input.representations?.bits,
      signal: input.representations?.signal,
    },
    copy: {
      whatUserSees: input.summary,
      whatReallyHappens: input.summary,
      whichLayerLooksAtIt: input.layerFocus.join(' / '),
      samePayloadHereLooksLike: input.same,
      easyToConfuse: input.trap,
      whyItMatters: input.matters,
      analogy: input.analogy,
    },
    relations: { previousIds: input.previousIds, nextIds: input.nextIds },
    mapPosition: { x: input.x, y: input.y, lane: input.direction },
  }
}

const rawScenario = {
  id: 'ssh-connection-basic',
  title: 'Opening an SSH session to example.com',
  description: 'A frozen educational path: terminal command + DNS UDP/53 + TCP/22 + SSH handshake + host key check + user authentication + encrypted terminal session.',
  assumptions: {
    ipVersion: 'ipv4', dnsMode: 'udp53', transportMode: 'tcp', tlsVersion: 'none', httpMode: '1.1',
    connectionReuse: false, cacheEnabled: false, serviceWorkerEnabled: false, echEnabled: false, natEnabled: true, accessMedium: 'ethernet',
  },
  topology: {
    nodes: [
      { id:'user', label:'User', kind:'human' }, { id:'terminal', label:'Terminal / SSH client', kind:'application' }, { id:'client-os', label:'Client OS', kind:'host' },
      { id:'switch', label:'LAN Switch', kind:'switch' }, { id:'router', label:'Router / NAT / Firewall', kind:'router' }, { id:'dns-resolver', label:'DNS Resolver', kind:'dns' },
      { id:'ssh-server', label:'SSH Server', kind:'server' },
    ],
    links: [
      { id:'terminal-os', source:'terminal', target:'client-os' }, { id:'os-switch', source:'client-os', target:'switch' }, { id:'switch-router', source:'switch', target:'router' },
      { id:'router-dns', source:'router', target:'dns-resolver' }, { id:'router-ssh', source:'router', target:'ssh-server' },
    ],
  },
  payloads: [{ id:'ssh-session-request', label:'SSH session request', description:'The same intention represented as a terminal command, address lookup, TCP connection and encrypted SSH channel.' }],
  stages: [
    makeStage({ id:'ssh-command', shortName:'SSH command', direction:'request', stageKind:'ssh-command', layerFocus:['human','application'], role:'user', nodeId:'user', x:0, y:80, previousIds:[], nextIds:['ssh-dns-query'], summary:'User runs ssh user@example.com in a terminal.', same:'A human/admin intention to open a remote shell.', trap:'The SSH command is not yet a network packet.', matters:'It separates local CLI intent from network behavior.', analogy:'Like deciding to open a locked remote workshop.' , representations:{human:{command:'ssh user@example.com'}} }),
    makeStage({ id:'ssh-dns-query', shortName:'DNS for SSH host', direction:'request', stageKind:'dns-query', layerFocus:['application','transport','network','link'], role:'os', nodeId:'client-os', x:230, y:80, previousIds:['ssh-command'], nextIds:['ssh-arp-gateway'], summary:'The client resolves example.com before connecting to SSH.', same:'A name-to-address question.', trap:'DNS does not authenticate the SSH server.', matters:'Wrong DNS can send SSH to the wrong IP.', analogy:'Like checking the street address of the workshop.', addresses:{srcIp:'192.168.1.10',dstIp:'198.51.100.53',srcPort:53002,dstPort:53}, representations:{human:{label:'Find IP for example.com'}, tcp:{protocol:'UDP',dstPort:53}, ip:{srcIp:'192.168.1.10',dstIp:'198.51.100.53'}} }),
    makeStage({ id:'ssh-arp-gateway', shortName:'ARP for gateway', direction:'request', stageKind:'arp-request', layerFocus:['network','link'], role:'os', nodeId:'client-os', x:460, y:80, previousIds:['ssh-dns-query'], nextIds:['ssh-tcp-handshake'], summary:'The host learns the MAC address of the default gateway.', same:'The local next-hop address needed to leave the LAN.', trap:'The client does not learn the remote SSH server MAC.', matters:'Local L2 failure breaks SSH before port 22 matters.', analogy:'Like finding the local exit door.', addresses:{srcMac:'02:00:00:00:01:10',dstMac:'ff:ff:ff:ff:ff:ff',srcIp:'192.168.1.10',dstIp:'192.168.1.1'}, representations:{ethernet:{question:'Who has 192.168.1.1?'}} }),
    makeStage({ id:'ssh-tcp-handshake', shortName:'TCP to port 22', direction:'request', stageKind:'tcp-handshake', layerFocus:['transport','network','link'], role:'os', nodeId:'client-os', x:690, y:80, previousIds:['ssh-arp-gateway'], nextIds:['ssh-protocol-banner'], summary:'The client opens a TCP connection to destination port 22.', same:'A reliable byte stream setup for SSH.', trap:'Port 22 is logical, not a physical socket.', matters:'Firewall drops often appear here.', analogy:'Like opening a phone call before speaking SSH.', addresses:{srcIp:'192.168.1.10',dstIp:'203.0.113.22',srcPort:52222,dstPort:22,natSrcIp:'198.51.100.2',natSrcPort:41022}, representations:{tcp:{sequence:['SYN','SYN/ACK','ACK'],dstPort:22},ip:{dstIp:'203.0.113.22'}} }),
    makeStage({ id:'ssh-protocol-banner', shortName:'SSH banner', direction:'request', stageKind:'ssh-banner', layerFocus:['application','transport'], role:'os', nodeId:'terminal', x:920, y:80, previousIds:['ssh-tcp-handshake'], nextIds:['ssh-key-exchange'], summary:'Client and server exchange SSH protocol identification strings.', same:'SSH starts speaking its own protocol over TCP.', trap:'SSH is not TLS and does not use HTTPS semantics.', matters:'Banner mismatch can reveal wrong service or middlebox.', analogy:'Like both sides saying which language they speak.', addresses:{srcIp:'192.168.1.10',dstIp:'203.0.113.22',srcPort:52222,dstPort:22}, representations:{http:{protocol:'SSH, not HTTP'}, tcp:{stream:'existing TCP/22 stream'}} }),
    makeStage({ id:'ssh-key-exchange', shortName:'Key exchange', direction:'request', stageKind:'ssh-kex', layerFocus:['application','transport'], role:'os', nodeId:'terminal', x:920, y:300, previousIds:['ssh-protocol-banner'], nextIds:['ssh-host-key-check'], summary:'SSH negotiates algorithms and creates session keys.', same:'Security setup for the encrypted SSH channel.', trap:'Key exchange is not the same as user login.', matters:'Algorithm mismatch or MITM concerns live here.', analogy:'Like agreeing on a temporary secret language.', addresses:{srcIp:'192.168.1.10',dstIp:'203.0.113.22',srcPort:52222,dstPort:22}, representations:{tls:{notTls:'SSH has its own key exchange'}, tcp:{stream:'TCP/22'}} }),
    makeStage({ id:'ssh-host-key-check', shortName:'Host key check', direction:'request', stageKind:'ssh-host-key', layerFocus:['application'], role:'os', nodeId:'terminal', x:690, y:300, previousIds:['ssh-key-exchange'], nextIds:['ssh-user-auth'], summary:'The client verifies the server host key against known_hosts.', same:'Server identity check before trusting the remote host.', trap:'Host key is not your user password or private key.', matters:'This is the SSH anti-impostor checkpoint.', analogy:'Like recognizing the workshop owner’s official seal.', representations:{human:{knownHosts:'check server fingerprint'}, http:{notHttp:'SSH host identity check'}} }),
    makeStage({ id:'ssh-user-auth', shortName:'User auth', direction:'request', stageKind:'ssh-user-auth', layerFocus:['application','transport'], role:'os', nodeId:'terminal', x:460, y:300, previousIds:['ssh-host-key-check'], nextIds:['ssh-encrypted-session'], summary:'The user authenticates, for example with a public key or password.', same:'Proof that the user may open the session.', trap:'User key authentication is separate from host key verification.', matters:'Failed auth is different from network failure.', analogy:'Like showing your personal badge at the locked door.', representations:{human:{method:'public key or password'}, tcp:{carriedOver:'encrypted SSH stream'}} }),
    makeStage({ id:'ssh-encrypted-session', shortName:'Encrypted session', direction:'internal', stageKind:'ssh-session', layerFocus:['application','transport','network'], role:'os', nodeId:'terminal', x:230, y:520, previousIds:['ssh-user-auth'], nextIds:['ssh-terminal-response'], summary:'Commands and output now move inside the encrypted SSH channel.', same:'A remote shell stream protected by SSH.', trap:'Network observers see timing and sizes, not typed commands.', matters:'Explains endpoint visibility vs network visibility.', analogy:'Like working through a locked speaking tube.', addresses:{srcIp:'192.168.1.10',dstIp:'203.0.113.22',srcPort:52222,dstPort:22}, representations:{tcp:{stream:'encrypted SSH application bytes'}, ip:{flow:'client ↔ server'}} }),
    makeStage({ id:'ssh-terminal-response', shortName:'Terminal response', direction:'response', stageKind:'ssh-response', layerFocus:['human','application','transport'], role:'os', nodeId:'terminal', x:0, y:520, previousIds:['ssh-encrypted-session'], nextIds:[], summary:'The user sees remote command output in the local terminal.', same:'Remote execution becomes local-looking text.', trap:'The text appears local but was generated remotely.', matters:'This is why SSH is central for admin operations.', analogy:'Like hearing the remote workshop answer through the tube.', representations:{human:{label:'remote output appears in terminal'}} }),
  ],
}

export const sshConnectionScenario: JourneyScenario = JourneyScenarioSchema.parse(rawScenario)
