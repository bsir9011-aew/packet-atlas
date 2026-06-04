import type {
  JourneyScenario,
  JourneyStage,
} from '../schema/journeyScenarioSchema'

export type ProtocolDiagramStep = {
  id: string
  title: string
  subtitle: string
  detail: string
}

export type ProtocolDiagram = {
  title: string
  subtitle: string
  mentalModel: string
  steps: ProtocolDiagramStep[]
  keyTakeaways: string[]
  addressFacts: string[]
}

function valueOrDash(value: unknown) {
  if (value === undefined || value === null || value === '') return '—'
  return String(value)
}

function getNodeLabel(scenario: JourneyScenario, nodeId: string) {
  return (
    scenario.topology.nodes.find((node) => node.id === nodeId)?.label ?? nodeId
  )
}

function buildAddressFacts(stage: JourneyStage) {
  const addresses = stage.addresses

  if (!addresses) {
    return [
      'No concrete packet addresses exist at this stage yet.',
      'That usually means the journey is still above the packet/transport layers or inside application logic.',
    ]
  }

  const facts = [
    `Source MAC: ${valueOrDash(addresses.srcMac)}`,
    `Destination MAC: ${valueOrDash(addresses.dstMac)}`,
    `Source IP: ${valueOrDash(addresses.srcIp)}`,
    `Destination IP: ${valueOrDash(addresses.dstIp)}`,
    `Source port: ${valueOrDash(addresses.srcPort)}`,
    `Destination port: ${valueOrDash(addresses.dstPort)}`,
  ]

  if (addresses.natSrcIp || addresses.natSrcPort) {
    facts.push(
      `After NAT source: ${valueOrDash(addresses.natSrcIp)}:${valueOrDash(
        addresses.natSrcPort,
      )}`,
    )
  }

  return facts
}

function genericSteps(stage: JourneyStage, deviceLabel: string): ProtocolDiagramStep[] {
  return [
    {
      id: 'input',
      title: 'Input',
      subtitle: 'Previous state',
      detail: stage.relations.previousIds.length
        ? `Comes after: ${stage.relations.previousIds.join(', ')}`
        : 'This is the beginning of the journey.',
    },
    {
      id: 'active',
      title: stage.shortName,
      subtitle: deviceLabel,
      detail: stage.copy.whatReallyHappens,
    },
    {
      id: 'output',
      title: 'Output',
      subtitle: 'Next state',
      detail: stage.relations.nextIds.length
        ? `Goes to: ${stage.relations.nextIds.join(', ')}`
        : 'This is the end of the visible journey.',
    },
  ]
}

export function getProtocolDiagram(
  stage: JourneyStage,
  scenario: JourneyScenario,
): ProtocolDiagram {
  const deviceLabel = getNodeLabel(scenario, stage.device.nodeId)
  const addressFacts = buildAddressFacts(stage)

  const base = {
    title: stage.shortName,
    subtitle: stage.copy.whichLayerLooksAtIt,
    mentalModel: stage.copy.analogy,
    addressFacts,
  }

  switch (stage.stageKind) {
    case 'user-intent':
      return {
        ...base,
        title: 'URL becomes an intention',
        subtitle: 'No packets exist yet — only a goal in the browser UI.',
        steps: [
          {
            id: 'human',
            title: 'Human goal',
            subtitle: 'https://example.com',
            detail: 'The user expresses a destination, not a network packet.',
          },
          {
            id: 'browser',
            title: 'Browser receives the goal',
            subtitle: 'Navigation begins',
            detail: 'The browser parses the URL and prepares the journey.',
          },
          {
            id: 'not-yet-network',
            title: 'Not network yet',
            subtitle: 'No TCP/IP object',
            detail: 'There is no DNS query, TCP segment, IP packet or frame yet.',
          },
        ],
        keyTakeaways: [
          'A URL is not a packet.',
          'Troubleshooting starts by separating human intent from real traffic.',
        ],
      }

    case 'browser-preflight':
      return {
        ...base,
        title: 'Browser decides whether the network is needed',
        subtitle: 'Cache, service worker and connection reuse are disabled in this scenario.',
        steps: [
          {
            id: 'cache',
            title: 'Cache check',
            subtitle: 'Disabled here',
            detail: 'A real browser may answer locally without network traffic.',
          },
          {
            id: 'service-worker',
            title: 'Service worker check',
            subtitle: 'Disabled here',
            detail: 'A service worker can intercept fetches before the network.',
          },
          {
            id: 'network-needed',
            title: 'Network required',
            subtitle: 'Continue to DNS',
            detail: 'Because no local shortcut is used, the browser needs an address.',
          },
        ],
        keyTakeaways: [
          'A page can load without fresh packets when cache or service workers answer.',
          'MVP freezes these shortcuts to keep the journey visible.',
        ],
      }

    case 'dns-query':
      return {
        ...base,
        title: 'DNS asks for an address',
        subtitle: 'Name → IP address question.',
        steps: [
          {
            id: 'name',
            title: 'Name',
            subtitle: 'example.com',
            detail: 'The human-friendly host must be translated into an address.',
          },
          {
            id: 'resolver',
            title: 'Resolver query',
            subtitle: 'UDP/53 in this scenario',
            detail: 'The client asks a DNS resolver for the answer.',
          },
          {
            id: 'waiting',
            title: 'Waiting for answer',
            subtitle: 'No web request yet',
            detail: 'HTTP cannot connect to the target until an IP is known.',
          },
        ],
        keyTakeaways: [
          'DNS finds where to connect; it does not fetch the website.',
          'DNS usually happens before the TCP connection to the web server.',
        ],
      }

    case 'arp-request':
      return {
        ...base,
        title: 'ARP finds the local next-hop MAC',
        subtitle: 'IPv4 local delivery question.',
        steps: [
          {
            id: 'need-next-hop',
            title: 'Need local delivery',
            subtitle: 'Remote IP is not enough',
            detail: 'The host must place the packet into a local frame.',
          },
          {
            id: 'broadcast',
            title: 'ARP broadcast',
            subtitle: 'Who has the gateway IP?',
            detail: 'For Internet destinations, the client seeks the gateway MAC, not the remote server MAC.',
          },
          {
            id: 'gateway-mac',
            title: 'Gateway MAC learned',
            subtitle: 'Frame can be sent',
            detail: 'The next Ethernet frame can now target the router on the LAN.',
          },
        ],
        keyTakeaways: [
          'ARP is local to the IPv4 segment.',
          'Your host usually learns the gateway MAC, not the Internet server MAC.',
        ],
      }

    case 'ethernet-frame':
      return {
        ...base,
        title: 'Packet becomes a local frame',
        subtitle: 'MAC-to-MAC delivery over one local segment.',
        steps: [
          {
            id: 'encapsulate',
            title: 'Encapsulate packet',
            subtitle: 'IP inside Ethernet',
            detail: 'The IP packet is wrapped with source and destination MAC addresses.',
          },
          {
            id: 'switch',
            title: 'Switch forwards frame',
            subtitle: 'MAC table view',
            detail: 'The switch forwards based on link-layer information, not HTTP meaning.',
          },
          {
            id: 'signal',
            title: 'Bits on medium',
            subtitle: 'Simplified PHY view',
            detail: 'The frame is serialized into a medium-dependent signal.',
          },
        ],
        keyTakeaways: [
          'Switches move frames, not URLs.',
          'PHY visualization here is symbolic, not an electrical analyzer trace.',
        ],
      }

    case 'nat-forward':
      return {
        ...base,
        title: 'Router forwards and NAT rewrites',
        subtitle: 'Private tuple becomes public tuple.',
        steps: [
          {
            id: 'private-side',
            title: 'Inside tuple',
            subtitle: 'Private client address',
            detail: 'The packet starts with the internal source IP and source port.',
          },
          {
            id: 'nat-table',
            title: 'NAT state',
            subtitle: 'Mapping created',
            detail: 'The router remembers how to translate return traffic back to the client.',
          },
          {
            id: 'public-side',
            title: 'Outside tuple',
            subtitle: 'Public source address',
            detail: 'The packet leaves with the router public address and translated source port.',
          },
        ],
        keyTakeaways: [
          'NAT changes addressing; it does not equal encryption.',
          'Return traffic works because NAT state remembers the mapping.',
        ],
      }

    case 'dns-response':
      return {
        ...base,
        title: 'DNS returns the destination IP',
        subtitle: 'Name resolution result comes back.',
        steps: [
          {
            id: 'resolver-answer',
            title: 'Resolver answers',
            subtitle: 'example.com → IP',
            detail: 'The resolver returns an address for the web edge in this scenario.',
          },
          {
            id: 'return-path',
            title: 'Return path',
            subtitle: 'NAT/firewall state',
            detail: 'Return traffic is matched back to the original client flow.',
          },
          {
            id: 'client-knows-ip',
            title: 'Client knows IP',
            subtitle: 'Ready for TCP',
            detail: 'The browser can now connect to the HTTPS endpoint.',
          },
        ],
        keyTakeaways: [
          'DNS response provides addressing information, not web content.',
          'After DNS, the journey can move to transport connection setup.',
        ],
      }

    case 'tcp-handshake':
      return {
        ...base,
        title: 'TCP creates a reliable conversation',
        subtitle: 'SYN → SYN/ACK → ACK.',
        steps: [
          {
            id: 'syn',
            title: 'SYN',
            subtitle: 'Client knocks',
            detail: 'The client asks to open a TCP connection to the server port.',
          },
          {
            id: 'synack',
            title: 'SYN/ACK',
            subtitle: 'Server answers',
            detail: 'The server acknowledges and offers its side of the connection.',
          },
          {
            id: 'ack',
            title: 'ACK',
            subtitle: 'Stream ready',
            detail: 'The client acknowledges. TLS can now run over the TCP stream.',
          },
        ],
        keyTakeaways: [
          'TCP setup is not the same as HTTP content.',
          'Port 443 is a logical endpoint for HTTPS service, not a physical socket.',
        ],
      }

    case 'tls-handshake':
      return {
        ...base,
        title: 'TLS negotiates protection',
        subtitle: 'Security before HTTP application data.',
        steps: [
          {
            id: 'clienthello',
            title: 'ClientHello',
            subtitle: 'Client proposes parameters',
            detail: 'The client starts negotiating a secure channel.',
          },
          {
            id: 'server-flight',
            title: 'Server flight',
            subtitle: 'Server proves and agrees',
            detail: 'The server responds with cryptographic material and certificate-related data.',
          },
          {
            id: 'keys-ready',
            title: 'Protected channel',
            subtitle: 'HTTP can be encrypted',
            detail: 'Application data can now travel inside protected TLS records.',
          },
        ],
        keyTakeaways: [
          'TLS is the security wrapper; HTTPS is HTTP over TLS.',
          'A network observer still sees timing, IPs, ports and sizes even when content is protected.',
        ],
      }

    case 'http-request':
      return {
        ...base,
        title: 'HTTP GET asks for the document',
        subtitle: 'Application meaning travels inside TLS.',
        steps: [
          {
            id: 'request-line',
            title: 'GET /',
            subtitle: 'Application request',
            detail: 'The browser asks for the main document path.',
          },
          {
            id: 'tls-record',
            title: 'TLS record',
            subtitle: 'Encrypted on the wire',
            detail: 'The request is readable at endpoints but protected on the network path.',
          },
          {
            id: 'server-edge',
            title: 'Server edge',
            subtitle: 'Reverse proxy receives it',
            detail: 'The request reaches the public entry point of the service.',
          },
        ],
        keyTakeaways: [
          'HTTP meaning exists at the endpoint/application layer.',
          'In HTTPS, the path is not plain text to a normal network observer.',
        ],
      }

    case 'proxy-forward':
      return {
        ...base,
        title: 'Reverse proxy routes the request inward',
        subtitle: 'Public edge → internal application.',
        steps: [
          {
            id: 'edge',
            title: 'Edge receives request',
            subtitle: 'Front door',
            detail: 'The reverse proxy is often the first server-side component the client reaches.',
          },
          {
            id: 'policy',
            title: 'Policy / routing',
            subtitle: 'WAF, TLS, load balancing',
            detail: 'The edge may terminate TLS, apply rules and choose an upstream.',
          },
          {
            id: 'upstream',
            title: 'Forward upstream',
            subtitle: 'Application tier',
            detail: 'The request continues to the internal app service.',
          },
        ],
        keyTakeaways: [
          'The public server is often a proxy, not the final application process.',
          'Proxy logs are critical for SOC and troubleshooting.',
        ],
      }

    case 'app-handler':
      return {
        ...base,
        title: 'Application creates the answer',
        subtitle: 'Business logic, data and response generation.',
        steps: [
          {
            id: 'handler',
            title: 'Handler runs',
            subtitle: 'Application logic',
            detail: 'The app interprets the request and decides what to return.',
          },
          {
            id: 'data',
            title: 'Internal data',
            subtitle: 'DB or service call',
            detail: 'The app may consult internal data before producing the response.',
          },
          {
            id: 'response-build',
            title: 'Response built',
            subtitle: 'Ready to return',
            detail: 'The result becomes an HTTP response for the client journey back.',
          },
        ],
        keyTakeaways: [
          'Networks deliver bytes; applications create meaning.',
          'Real investigations often need both network and application logs.',
        ],
      }

    case 'http-response':
      return {
        ...base,
        title: 'HTTP response travels back',
        subtitle: 'Server answer returns through the layered stack.',
        steps: [
          {
            id: 'status',
            title: '200 OK',
            subtitle: 'Application response',
            detail: 'The server sends a response status and body.',
          },
          {
            id: 'wrapped-return',
            title: 'Wrapped return path',
            subtitle: 'TLS/TCP/IP/frame',
            detail: 'The answer is carried back through the same layered machinery.',
          },
          {
            id: 'client-receive',
            title: 'Client receives bytes',
            subtitle: 'Ready for render',
            detail: 'The browser can decrypt, parse and render the response.',
          },
        ],
        keyTakeaways: [
          'The response is part of the same conversation.',
          'Stateful devices allow return traffic because they remember the flow.',
        ],
      }

    case 'browser-render':
      return {
        ...base,
        title: 'Bytes become a visible page',
        subtitle: 'The journey returns to human perception.',
        steps: [
          {
            id: 'receive',
            title: 'Receive response',
            subtitle: 'HTTP body arrives',
            detail: 'The browser receives the response data from the network stack.',
          },
          {
            id: 'parse',
            title: 'Parse and render',
            subtitle: 'Browser work',
            detail: 'The browser interprets the document and prepares pixels.',
          },
          {
            id: 'human-visible',
            title: 'User sees page',
            subtitle: 'End of this journey',
            detail: 'The network journey becomes visible content again.',
          },
        ],
        keyTakeaways: [
          'The network does not render the page; the browser does.',
          'End-to-end means following data back up the stack, not only across the wire.',
        ],
      }

    default:
      return {
        ...base,
        steps: genericSteps(stage, deviceLabel),
        keyTakeaways: [stage.copy.easyToConfuse, stage.copy.whyItMatters],
      }
  }
}
