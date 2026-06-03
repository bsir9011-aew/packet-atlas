import {
  JourneyScenarioSchema,
  type JourneyScenario,
} from '../schema/journeyScenarioSchema'

const rawScenario = {
  id: 'https-example-basic',
  title: 'Opening https://example.com',
  description:
    'A frozen educational path: IPv4 + DNS UDP/53 + TCP + TLS 1.3 + HTTP/1.1 + no cache + no service worker + NAT enabled.',
  assumptions: {
    ipVersion: 'ipv4',
    dnsMode: 'udp53',
    transportMode: 'tcp',
    tlsVersion: '1.3',
    httpMode: '1.1',
    connectionReuse: false,
    cacheEnabled: false,
    serviceWorkerEnabled: false,
    echEnabled: false,
    natEnabled: true,
    accessMedium: 'ethernet',
  },
  topology: {
    nodes: [
      { id: 'user', label: 'User', kind: 'human' },
      { id: 'browser', label: 'Browser', kind: 'application' },
      { id: 'client-os', label: 'Client OS', kind: 'host' },
      { id: 'switch', label: 'LAN Switch', kind: 'switch' },
      { id: 'router', label: 'Router / NAT / Firewall', kind: 'router' },
      { id: 'dns-resolver', label: 'DNS Resolver', kind: 'dns' },
      { id: 'reverse-proxy', label: 'Reverse Proxy', kind: 'proxy' },
      { id: 'app-server', label: 'App Server', kind: 'app' },
      { id: 'database', label: 'Database', kind: 'db' },
    ],
    links: [
      { id: 'browser-os', source: 'browser', target: 'client-os' },
      { id: 'os-switch', source: 'client-os', target: 'switch' },
      { id: 'switch-router', source: 'switch', target: 'router' },
      { id: 'router-dns', source: 'router', target: 'dns-resolver' },
      { id: 'router-proxy', source: 'router', target: 'reverse-proxy' },
      { id: 'proxy-app', source: 'reverse-proxy', target: 'app-server' },
      { id: 'app-db', source: 'app-server', target: 'database' },
    ],
  },
  payloads: [
    {
      id: 'main-document-request',
      label: 'Main document request',
      description:
        'The same user intention represented as URL navigation, DNS lookup, TCP connection, TLS session and HTTP request.',
    },
  ],
  stages: [
    {
      id: 'url-intent',
      shortName: 'URL intent',
      direction: 'request',
      stageKind: 'user-intent',
      layerFocus: ['human', 'application'],
      device: { nodeId: 'user', role: 'user' },
      payloadRef: 'main-document-request',
      representations: {
        human: {
          label: 'User types https://example.com and presses Enter.',
        },
        http: {
          notYet: 'No HTTP request exists yet. Only human intent exists.',
        },
      },
      copy: {
        whatUserSees: 'A URL in the address bar.',
        whatReallyHappens:
          'The journey starts as a human intention: open this secure web page.',
        whichLayerLooksAtIt: 'Human / browser UI',
        samePayloadHereLooksLike: 'A simple URL.',
        easyToConfuse:
          'The URL is not the packet. It is the intention that will later become many network objects.',
        whyItMatters:
          'Good troubleshooting starts by separating user intent from actual network traffic.',
        analogy: 'Like deciding to send a letter before the envelope exists.',
      },
      relations: { previousIds: [], nextIds: ['browser-checks'] },
      mapPosition: { x: 0, y: 80, lane: 'request' },
    },
    {
      id: 'browser-checks',
      shortName: 'Browser checks',
      direction: 'request',
      stageKind: 'browser-preflight',
      layerFocus: ['application'],
      device: { nodeId: 'browser', role: 'browser' },
      payloadRef: 'main-document-request',
      representations: {
        human: {
          label: 'The browser decides whether it must go to the network.',
        },
        http: {
          cache: 'disabled in this scenario',
          serviceWorker: 'disabled in this scenario',
          connectionReuse: 'disabled in this scenario',
        },
      },
      copy: {
        whatUserSees: 'Usually nothing, only a short wait.',
        whatReallyHappens:
          'The browser checks whether cache, service worker or an existing connection can answer the request.',
        whichLayerLooksAtIt: 'Application / browser',
        samePayloadHereLooksLike:
          'Still a navigation request, not yet a packet on the wire.',
        easyToConfuse:
          'Sometimes a page loads without network traffic because cache or service worker handled it.',
        whyItMatters:
          'In SOC and debugging, no packet does not always mean no action.',
        analogy: 'Like checking whether the answer is already in your notebook.',
      },
      relations: { previousIds: ['url-intent'], nextIds: ['dns-query'] },
      mapPosition: { x: 220, y: 80, lane: 'request' },
    },
    {
      id: 'dns-query',
      shortName: 'DNS query',
      direction: 'request',
      stageKind: 'dns-query',
      layerFocus: ['application', 'transport', 'network', 'link'],
      device: { nodeId: 'client-os', role: 'os' },
      payloadRef: 'main-document-request',
      addresses: {
        srcIp: '192.168.1.10',
        dstIp: '198.51.100.53',
        srcPort: 53001,
        dstPort: 53,
      },
      representations: {
        human: {
          label: 'What IP address belongs to example.com?',
        },
        http: {
          notYet: 'No HTTP GET yet. DNS happens first.',
        },
        tcp: {
          protocol: 'UDP in this frozen scenario',
          srcPort: 53001,
          dstPort: 53,
        },
        ip: {
          srcIp: '192.168.1.10',
          dstIp: '198.51.100.53',
        },
      },
      copy: {
        whatUserSees: 'Still waiting for the page.',
        whatReallyHappens:
          'The client asks a DNS resolver for the address of example.com.',
        whichLayerLooksAtIt: 'Application protocol over UDP/IP',
        samePayloadHereLooksLike: 'A name-to-address question.',
        easyToConfuse:
          'DNS does not fetch the website. DNS only helps find where to connect.',
        whyItMatters:
          'Many outages are DNS problems before they are web problems.',
        analogy: 'Like asking for the street address before sending a courier.',
      },
      relations: { previousIds: ['browser-checks'], nextIds: ['arp-gateway'] },
      mapPosition: { x: 440, y: 80, lane: 'request' },
    },
    {
      id: 'arp-gateway',
      shortName: 'ARP for gateway',
      direction: 'request',
      stageKind: 'arp-request',
      layerFocus: ['network', 'link'],
      device: { nodeId: 'client-os', role: 'os' },
      payloadRef: 'main-document-request',
      addresses: {
        srcMac: '02:00:00:00:01:10',
        dstMac: 'ff:ff:ff:ff:ff:ff',
        srcIp: '192.168.1.10',
        dstIp: '192.168.1.1',
      },
      representations: {
        ethernet: {
          question: 'Who has 192.168.1.1? Tell 192.168.1.10.',
        },
        ip: {
          target: 'default gateway, not the remote web server',
        },
      },
      copy: {
        whatUserSees: 'Nothing visible.',
        whatReallyHappens:
          'Because the resolver is outside the local network, the client needs the MAC address of the default gateway.',
        whichLayerLooksAtIt: 'Link layer on local LAN',
        samePayloadHereLooksLike:
          'The same journey now needs a local next-hop address.',
        easyToConfuse:
          'The client does not learn the MAC address of the server on the Internet.',
        whyItMatters:
          'This explains why local LAN problems can break Internet access.',
        analogy:
          'You do not know every city courier. You only need the local post office door.',
      },
      relations: { previousIds: ['dns-query'], nextIds: ['lan-frame'] },
      mapPosition: { x: 660, y: 80, lane: 'request' },
    },
    {
      id: 'lan-frame',
      shortName: 'LAN frame',
      direction: 'request',
      stageKind: 'ethernet-frame',
      layerFocus: ['link', 'physical'],
      device: { nodeId: 'switch', role: 'switch' },
      payloadRef: 'main-document-request',
      addresses: {
        srcMac: '02:00:00:00:01:10',
        dstMac: '02:00:00:00:01:01',
      },
      representations: {
        ethernet: {
          srcMac: '02:00:00:00:01:10',
          dstMac: '02:00:00:00:01:01',
          carriedInside: 'IPv4 packet carrying UDP DNS query',
        },
        bits: {
          simplified: 'Frame serialized into bits on Ethernet medium.',
        },
      },
      copy: {
        whatUserSees: 'Nothing visible.',
        whatReallyHappens:
          'The packet is placed inside an Ethernet frame and crosses the local switch.',
        whichLayerLooksAtIt: 'Switch / link layer',
        samePayloadHereLooksLike:
          'A frame with source MAC, destination MAC and payload.',
        easyToConfuse:
          'A switch does not care that this is example.com. It forwards frames.',
        whyItMatters:
          'MAC tables, VLANs and switch ports live at this level.',
        analogy: 'Like putting the letter into a local delivery tray.',
      },
      relations: { previousIds: ['arp-gateway'], nextIds: ['router-nat-dns'] },
      mapPosition: { x: 880, y: 80, lane: 'request' },
    },
    {
      id: 'router-nat-dns',
      shortName: 'Router / NAT',
      direction: 'request',
      stageKind: 'nat-forward',
      layerFocus: ['network', 'transport'],
      device: { nodeId: 'router', role: 'router' },
      payloadRef: 'main-document-request',
      addresses: {
        srcIp: '192.168.1.10',
        dstIp: '198.51.100.53',
        srcPort: 53001,
        dstPort: 53,
        natSrcIp: '198.51.100.2',
        natSrcPort: 40001,
      },
      representations: {
        ip: {
          beforeNat: '192.168.1.10 -> 198.51.100.53',
          afterNat: '198.51.100.2 -> 198.51.100.53',
        },
        tcp: {
          transport: 'UDP/53 in this DNS step',
          sourcePortTranslated: '53001 -> 40001',
        },
      },
      copy: {
        whatUserSees: 'Still just waiting.',
        whatReallyHappens:
          'The router forwards the packet and translates the private source address to its public address.',
        whichLayerLooksAtIt: 'Network / transport tuple',
        samePayloadHereLooksLike:
          'Same DNS query, but with translated source IP and port outside the LAN.',
        easyToConfuse:
          'NAT changes addressing; it does not magically encrypt traffic.',
        whyItMatters:
          'NAT explains why many internal devices can share one public IP.',
        analogy: 'Like a company mailroom replacing your room number with the company address.',
      },
      relations: { previousIds: ['lan-frame'], nextIds: ['dns-response'] },
      mapPosition: { x: 1100, y: 80, lane: 'request' },
    },
    {
      id: 'dns-response',
      shortName: 'DNS response',
      direction: 'response',
      stageKind: 'dns-response',
      layerFocus: ['application', 'network'],
      device: { nodeId: 'dns-resolver', role: 'dns' },
      payloadRef: 'main-document-request',
      addresses: {
        srcIp: '198.51.100.53',
        dstIp: '198.51.100.2',
        srcPort: 53,
        dstPort: 40001,
      },
      representations: {
        human: {
          label: 'example.com resolves to 203.0.113.10 in this scenario.',
        },
        ip: {
          answer: '203.0.113.10',
        },
      },
      copy: {
        whatUserSees: 'Still waiting.',
        whatReallyHappens:
          'The DNS resolver returns an address for the web edge.',
        whichLayerLooksAtIt: 'DNS application data over IP',
        samePayloadHereLooksLike:
          'The name example.com becomes a routable IP destination.',
        easyToConfuse:
          'The DNS server did not return the website content.',
        whyItMatters:
          'This is the bridge between human names and network addresses.',
        analogy: 'Like receiving the address card for your destination.',
      },
      relations: { previousIds: ['router-nat-dns'], nextIds: ['tcp-handshake'] },
      mapPosition: { x: 1100, y: 300, lane: 'response' },
    },
    {
      id: 'tcp-handshake',
      shortName: 'TCP handshake',
      direction: 'request',
      stageKind: 'tcp-handshake',
      layerFocus: ['transport', 'network'],
      device: { nodeId: 'client-os', role: 'os' },
      payloadRef: 'main-document-request',
      addresses: {
        srcIp: '192.168.1.10',
        dstIp: '203.0.113.10',
        srcPort: 51514,
        dstPort: 443,
        natSrcIp: '198.51.100.2',
        natSrcPort: 40002,
      },
      representations: {
        tcp: {
          sequence: ['SYN', 'SYN/ACK', 'ACK'],
          dstPort: 443,
          meaning: 'Create a reliable byte stream to the HTTPS service.',
        },
        ip: {
          dstIp: '203.0.113.10',
        },
      },
      copy: {
        whatUserSees: 'The browser is connecting.',
        whatReallyHappens:
          'Client and server establish a TCP connection to port 443.',
        whichLayerLooksAtIt: 'Transport layer',
        samePayloadHereLooksLike:
          'Not HTTP yet. This is a connection setup conversation.',
        easyToConfuse:
          'Port 443 identifies the service endpoint, not a physical hole.',
        whyItMatters:
          'TCP state, ports and retransmissions are core troubleshooting concepts.',
        analogy: 'Like opening a phone call before saying the actual message.',
      },
      relations: { previousIds: ['dns-response'], nextIds: ['tls-handshake'] },
      mapPosition: { x: 880, y: 300, lane: 'request' },
    },
    {
      id: 'tls-handshake',
      shortName: 'TLS handshake',
      direction: 'request',
      stageKind: 'tls-handshake',
      layerFocus: ['tls', 'transport', 'network'],
      device: { nodeId: 'browser', role: 'browser' },
      payloadRef: 'main-document-request',
      addresses: {
        srcIp: '192.168.1.10',
        dstIp: '203.0.113.10',
        srcPort: 51514,
        dstPort: 443,
      },
      representations: {
        tls: {
          version: 'TLS 1.3',
          purpose: 'Negotiate secure channel parameters and keys.',
          ech: 'disabled in this scenario',
          sniVisibility: 'SNI may be visible without ECH',
        },
        tcp: {
          carriedOver: 'existing TCP stream',
        },
      },
      copy: {
        whatUserSees: 'A secure connection is being established.',
        whatReallyHappens:
          'TLS creates a protected channel before HTTP application data is sent.',
        whichLayerLooksAtIt: 'TLS over TCP',
        samePayloadHereLooksLike:
          'Security negotiation, not the final GET request yet.',
        easyToConfuse:
          'TLS is not the same thing as HTTPS. HTTPS is HTTP over TLS.',
        whyItMatters:
          'This explains what observers can and cannot see before encryption.',
        analogy: 'Like agreeing on locks and keys before sending the letter.',
      },
      relations: { previousIds: ['tcp-handshake'], nextIds: ['http-request'] },
      mapPosition: { x: 660, y: 300, lane: 'request' },
    },
    {
      id: 'http-request',
      shortName: 'HTTP GET',
      direction: 'request',
      stageKind: 'http-request',
      layerFocus: ['application', 'tls', 'transport', 'network'],
      device: { nodeId: 'browser', role: 'browser' },
      payloadRef: 'main-document-request',
      addresses: {
        srcIp: '192.168.1.10',
        dstIp: '203.0.113.10',
        srcPort: 51514,
        dstPort: 443,
      },
      representations: {
        http: {
          method: 'GET',
          path: '/',
          host: 'example.com',
        },
        tls: {
          networkObserverSees: 'encrypted application data records',
        },
        tcp: {
          stream: 'bytes carried inside established TCP connection',
        },
      },
      copy: {
        whatUserSees: 'The page is loading.',
        whatReallyHappens:
          'The browser sends an HTTP GET request through the protected TLS channel.',
        whichLayerLooksAtIt: 'HTTP over TLS over TCP',
        samePayloadHereLooksLike:
          'Readable as GET / inside the endpoint, encrypted on the network path.',
        easyToConfuse:
          'A network observer does not see plain HTTP content in HTTPS.',
        whyItMatters:
          'This is the core difference between endpoint visibility and network visibility.',
        analogy: 'Like placing the actual message inside a locked envelope.',
      },
      relations: { previousIds: ['tls-handshake'], nextIds: ['reverse-proxy'] },
      mapPosition: { x: 440, y: 300, lane: 'request' },
    },
    {
      id: 'reverse-proxy',
      shortName: 'Reverse proxy',
      direction: 'internal',
      stageKind: 'proxy-forward',
      layerFocus: ['application', 'tls', 'network'],
      device: { nodeId: 'reverse-proxy', role: 'proxy' },
      payloadRef: 'main-document-request',
      representations: {
        http: {
          receives: 'GET /',
          mayTerminateTls: true,
          forwardsTo: 'app-server',
        },
        tls: {
          boundary: 'TLS may terminate here in many architectures.',
        },
      },
      copy: {
        whatUserSees: 'Still loading.',
        whatReallyHappens:
          'A reverse proxy receives the request and forwards it to the application tier.',
        whichLayerLooksAtIt: 'Application edge / proxy',
        samePayloadHereLooksLike:
          'A web request entering the server-side infrastructure.',
        easyToConfuse:
          'The public web server is often not the final application process.',
        whyItMatters:
          'Reverse proxies are critical in logs, WAFs, TLS termination and load balancing.',
        analogy: 'Like the front desk routing your letter to the right department.',
      },
      relations: { previousIds: ['http-request'], nextIds: ['app-db'] },
      mapPosition: { x: 220, y: 520, lane: 'internal' },
    },
    {
      id: 'app-db',
      shortName: 'App + DB',
      direction: 'internal',
      stageKind: 'app-handler',
      layerFocus: ['application'],
      device: { nodeId: 'app-server', role: 'app' },
      payloadRef: 'main-document-request',
      representations: {
        http: {
          appAction: 'Handle GET / and prepare response body.',
        },
        human: {
          label: 'The server prepares the page.',
        },
      },
      copy: {
        whatUserSees: 'Still loading.',
        whatReallyHappens:
          'The application handles the request and may query internal data sources.',
        whichLayerLooksAtIt: 'Application logic',
        samePayloadHereLooksLike:
          'A business/application operation, not merely a packet.',
        easyToConfuse:
          'A response is not created by the network. It is created by application logic.',
        whyItMatters:
          'SOC investigations often need to correlate network traffic with application logs.',
        analogy: 'Like a department checking files before answering a letter.',
      },
      relations: { previousIds: ['reverse-proxy'], nextIds: ['http-response'] },
      mapPosition: { x: 440, y: 520, lane: 'internal' },
    },
    {
      id: 'http-response',
      shortName: 'HTTP response',
      direction: 'response',
      stageKind: 'http-response',
      layerFocus: ['application', 'tls', 'transport', 'network', 'link'],
      device: { nodeId: 'reverse-proxy', role: 'proxy' },
      payloadRef: 'main-document-request',
      representations: {
        http: {
          status: 200,
          reason: 'OK',
          contentType: 'text/html',
        },
        tls: {
          networkObserverSees: 'encrypted response records',
        },
        tcp: {
          direction: 'server to client byte stream',
        },
      },
      copy: {
        whatUserSees: 'The page begins to appear.',
        whatReallyHappens:
          'The server response travels back through TLS, TCP, IP, NAT and Ethernet.',
        whichLayerLooksAtIt: 'Response path through the same layered stack',
        samePayloadHereLooksLike:
          'HTML at the endpoint, encrypted records on the wire, packets in transit.',
        easyToConfuse:
          'Response traffic is part of the same conversation, not a separate universe.',
        whyItMatters:
          'Firewalls and NAT track state so return traffic can be allowed back.',
        analogy: 'Like the answer letter traveling back through the same postal system.',
      },
      relations: { previousIds: ['app-db'], nextIds: ['browser-render'] },
      mapPosition: { x: 660, y: 520, lane: 'response' },
    },
    {
      id: 'browser-render',
      shortName: 'Browser render',
      direction: 'response',
      stageKind: 'browser-render',
      layerFocus: ['human', 'application'],
      device: { nodeId: 'browser', role: 'browser' },
      payloadRef: 'main-document-request',
      representations: {
        human: {
          label: 'The user sees the rendered page.',
        },
        http: {
          received: 'HTTP response body becomes a document to render.',
        },
      },
      copy: {
        whatUserSees: 'The website is visible.',
        whatReallyHappens:
          'The browser receives, decrypts, parses and renders the response.',
        whichLayerLooksAtIt: 'Browser / application / human',
        samePayloadHereLooksLike:
          'The journey ends as visible content, not as packets.',
        easyToConfuse:
          'The network delivered bytes; the browser created the visible page.',
        whyItMatters:
          'End-to-end understanding requires following the data back up the stack.',
        analogy: 'Like opening the reply letter and reading it.',
      },
      relations: { previousIds: ['http-response'], nextIds: [] },
      mapPosition: { x: 880, y: 520, lane: 'response' },
    },
  ],
}

export const httpsExampleScenario: JourneyScenario =
  JourneyScenarioSchema.parse(rawScenario)
