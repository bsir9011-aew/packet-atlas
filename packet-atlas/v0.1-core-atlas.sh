set -euo pipefail

echo "📦 Installing Packet Atlas dependencies..."
npm install @xyflow/react zustand zod
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
npm pkg set scripts.test="vitest --run"

echo "🧱 Creating project structure..."
mkdir -p src/features/packet-atlas/{schema,scenarios,store,map,timeline,inspector,layers}
mkdir -p tests/unit

cat > src/features/packet-atlas/schema/journeyScenarioSchema.ts <<'TS'
import { z } from 'zod'

export const LayerLensSchema = z.enum([
  'human',
  'application',
  'tls',
  'transport',
  'network',
  'link',
  'physical',
])

export const DirectionSchema = z.enum(['request', 'response', 'internal'])

export const DeviceRoleSchema = z.enum([
  'user',
  'browser',
  'os',
  'nic',
  'switch',
  'router',
  'firewall',
  'dns',
  'proxy',
  'app',
  'db',
])

const ProjectionSchema = z.record(z.string(), z.unknown())

export const JourneyScenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  assumptions: z.object({
    ipVersion: z.enum(['ipv4', 'ipv6']),
    dnsMode: z.enum(['udp53', 'tcp53', 'dot', 'doh', 'doq']),
    transportMode: z.enum(['tcp', 'quic']),
    tlsVersion: z.enum(['1.3', 'none']),
    httpMode: z.enum(['1.1', '2', '3']),
    connectionReuse: z.boolean(),
    cacheEnabled: z.boolean(),
    serviceWorkerEnabled: z.boolean(),
    echEnabled: z.boolean(),
    natEnabled: z.boolean(),
    accessMedium: z.enum(['ethernet', 'wifi']),
  }),
  topology: z.object({
    nodes: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        kind: z.string(),
      }),
    ),
    links: z.array(
      z.object({
        id: z.string(),
        source: z.string(),
        target: z.string(),
        label: z.string().optional(),
      }),
    ),
  }),
  payloads: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      description: z.string(),
    }),
  ),
  stages: z.array(
    z.object({
      id: z.string(),
      shortName: z.string(),
      direction: DirectionSchema,
      stageKind: z.string(),
      layerFocus: z.array(LayerLensSchema),
      device: z.object({
        nodeId: z.string(),
        role: DeviceRoleSchema,
      }),
      payloadRef: z.string(),
      addresses: z
        .object({
          srcMac: z.string().optional(),
          dstMac: z.string().optional(),
          srcIp: z.string().optional(),
          dstIp: z.string().optional(),
          srcPort: z.number().optional(),
          dstPort: z.number().optional(),
          natSrcIp: z.string().optional(),
          natSrcPort: z.number().optional(),
        })
        .optional(),
      representations: z.object({
        human: ProjectionSchema.optional(),
        http: ProjectionSchema.optional(),
        tls: ProjectionSchema.optional(),
        tcp: ProjectionSchema.optional(),
        ip: ProjectionSchema.optional(),
        ethernet: ProjectionSchema.optional(),
        bits: ProjectionSchema.optional(),
        signal: ProjectionSchema.optional(),
      }),
      copy: z.object({
        whatUserSees: z.string(),
        whatReallyHappens: z.string(),
        whichLayerLooksAtIt: z.string(),
        samePayloadHereLooksLike: z.string(),
        easyToConfuse: z.string(),
        whyItMatters: z.string(),
        analogy: z.string(),
      }),
      relations: z.object({
        previousIds: z.array(z.string()),
        nextIds: z.array(z.string()),
      }),
      mapPosition: z.object({
        x: z.number(),
        y: z.number(),
        lane: z.enum(['request', 'response', 'internal']),
      }),
    }),
  ),
})

export type JourneyScenario = z.infer<typeof JourneyScenarioSchema>
export type JourneyStage = JourneyScenario['stages'][number]
export type LayerLens = z.infer<typeof LayerLensSchema>
TS

cat > src/features/packet-atlas/scenarios/httpsExample.ts <<'TS'
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
TS

cat > src/features/packet-atlas/store/atlasStore.ts <<'TS'
import { create } from 'zustand'
import type { LayerLens } from '../schema/journeyScenarioSchema'

type AtlasState = {
  selectedStageId: string
  selectedLayerLens: LayerLens
  setSelectedStageId: (stageId: string) => void
  setSelectedLayerLens: (lens: LayerLens) => void
}

export const useAtlasStore = create<AtlasState>((set) => ({
  selectedStageId: 'url-intent',
  selectedLayerLens: 'human',
  setSelectedStageId: (stageId) => set({ selectedStageId: stageId }),
  setSelectedLayerLens: (lens) => set({ selectedLayerLens: lens }),
}))
TS

cat > src/features/packet-atlas/map/GlobalJourneyMap.tsx <<'TSX'
import { useMemo } from 'react'
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { JourneyScenario } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'

type Props = {
  scenario: JourneyScenario
}

const laneLabel: Record<string, string> = {
  request: '→ request',
  response: '← response',
  internal: '↔ internal',
}

export function GlobalJourneyMap({ scenario }: Props) {
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)

  const nodes = useMemo<Node[]>(
    () =>
      scenario.stages.map((stage) => {
        const selected = stage.id === selectedStageId

        return {
          id: stage.id,
          position: {
            x: stage.mapPosition.x,
            y: stage.mapPosition.y,
          },
          data: {
            label: (
              <div className="stage-node">
                <div className="stage-node__top">
                  <span>{laneLabel[stage.direction]}</span>
                  <span>{stage.device.role}</span>
                </div>
                <strong>{stage.shortName}</strong>
                <small>{stage.layerFocus.join(' / ')}</small>
              </div>
            ),
          },
          style: {
            width: 190,
            borderRadius: 16,
            border: selected ? '2px solid #7dd3fc' : '1px solid #334155',
            background: selected ? '#0f2a3a' : '#111827',
            color: '#e5e7eb',
            boxShadow: selected
              ? '0 0 0 4px rgba(125, 211, 252, 0.12)'
              : 'none',
          },
        }
      }),
    [scenario.stages, selectedStageId],
  )

  const edges = useMemo<Edge[]>(
    () =>
      scenario.stages.flatMap((stage) =>
        stage.relations.previousIds.map((previousId) => ({
          id: `${previousId}->${stage.id}`,
          source: previousId,
          target: stage.id,
          animated: stage.direction !== 'internal',
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: {
            strokeWidth: 2,
          },
        })),
      ),
    [scenario.stages],
  )

  return (
    <div className="journey-map">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        minZoom={0.35}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        onNodeClick={(_, node) => setSelectedStageId(node.id)}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
TSX

cat > src/features/packet-atlas/timeline/RouteTimeline.tsx <<'TSX'
import type { JourneyScenario } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'

type Props = {
  scenario: JourneyScenario
}

const directionIcon = {
  request: '➡️',
  response: '⬅️',
  internal: '🔁',
}

export function RouteTimeline({ scenario }: Props) {
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)

  return (
    <aside className="route-timeline">
      <div className="panel-heading">
        <span>Route Timeline</span>
        <small>{scenario.stages.length} stages</small>
      </div>

      <div className="timeline-list">
        {scenario.stages.map((stage, index) => (
          <button
            key={stage.id}
            className={
              stage.id === selectedStageId
                ? 'timeline-item timeline-item--active'
                : 'timeline-item'
            }
            onClick={() => setSelectedStageId(stage.id)}
          >
            <span className="timeline-item__index">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="timeline-item__main">
              <strong>
                {directionIcon[stage.direction]} {stage.shortName}
              </strong>
              <small>{stage.copy.whichLayerLooksAtIt}</small>
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
TSX

cat > src/features/packet-atlas/inspector/PacketInspector.tsx <<'TSX'
import type {
  JourneyStage,
  LayerLens,
} from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'

type Props = {
  stage: JourneyStage
}

const lenses: Array<{ id: LayerLens; label: string; icon: string }> = [
  { id: 'human', label: 'Human', icon: '👤' },
  { id: 'application', label: 'App/HTTP', icon: '🌐' },
  { id: 'tls', label: 'TLS', icon: '🔐' },
  { id: 'transport', label: 'TCP/UDP', icon: '🚚' },
  { id: 'network', label: 'IP', icon: '🧭' },
  { id: 'link', label: 'Ethernet', icon: '🔌' },
  { id: 'physical', label: 'Bits/Signal', icon: '〰️' },
]

function getProjection(stage: JourneyStage, lens: LayerLens) {
  if (lens === 'human') return stage.representations.human
  if (lens === 'application') return stage.representations.http
  if (lens === 'tls') return stage.representations.tls
  if (lens === 'transport') return stage.representations.tcp
  if (lens === 'network') return stage.representations.ip
  if (lens === 'link') return stage.representations.ethernet
  return stage.representations.bits ?? stage.representations.signal
}

export function PacketInspector({ stage }: Props) {
  const selectedLayerLens = useAtlasStore((state) => state.selectedLayerLens)
  const setSelectedLayerLens = useAtlasStore((state) => state.setSelectedLayerLens)

  const projection = getProjection(stage, selectedLayerLens)

  return (
    <section className="packet-inspector">
      <div className="panel-heading">
        <span>Packet Inspector</span>
        <small>{stage.shortName}</small>
      </div>

      <div className="lens-tabs" aria-label="Layer lens selector">
        {lenses.map((lens) => (
          <button
            key={lens.id}
            className={
              selectedLayerLens === lens.id
                ? 'lens-tab lens-tab--active'
                : 'lens-tab'
            }
            onClick={() => setSelectedLayerLens(lens.id)}
          >
            <span>{lens.icon}</span>
            {lens.label}
          </button>
        ))}
      </div>

      <div className="inspector-copy">
        <h3>{stage.copy.whichLayerLooksAtIt}</h3>
        <p>{stage.copy.whatReallyHappens}</p>
      </div>

      <div className="projection-box">
        <div className="projection-box__heading">Current projection</div>
        {projection ? (
          <pre>{JSON.stringify(projection, null, 2)}</pre>
        ) : (
          <p className="muted">
            This stage has no dedicated data for this lens yet.
          </p>
        )}
      </div>

      <div className="teaching-grid">
        <div>
          <strong>👁️ User sees</strong>
          <p>{stage.copy.whatUserSees}</p>
        </div>
        <div>
          <strong>🧩 Same payload here</strong>
          <p>{stage.copy.samePayloadHereLooksLike}</p>
        </div>
        <div>
          <strong>⚠️ Easy to confuse</strong>
          <p>{stage.copy.easyToConfuse}</p>
        </div>
        <div>
          <strong>🎯 Why it matters</strong>
          <p>{stage.copy.whyItMatters}</p>
        </div>
        <div className="teaching-grid__wide">
          <strong>🖼️ Analogy</strong>
          <p>{stage.copy.analogy}</p>
        </div>
      </div>
    </section>
  )
}
TSX

cat > src/features/packet-atlas/layers/AssumptionBar.tsx <<'TSX'
import type { JourneyScenario } from '../schema/journeyScenarioSchema'

type Props = {
  scenario: JourneyScenario
}

function formatValue(value: unknown) {
  if (typeof value === 'boolean') return value ? 'on' : 'off'
  return String(value)
}

export function AssumptionBar({ scenario }: Props) {
  return (
    <section className="assumption-bar" aria-label="Scenario assumptions">
      <strong>Frozen scenario:</strong>
      {Object.entries(scenario.assumptions).map(([key, value]) => (
        <span key={key} className="assumption-pill">
          {key}: <b>{formatValue(value)}</b>
        </span>
      ))}
    </section>
  )
}
TSX

cat > src/features/packet-atlas/layers/EncapsulationStack.tsx <<'TSX'
import type { JourneyStage } from '../schema/journeyScenarioSchema'

type Props = {
  stage: JourneyStage
}

const stack = [
  { key: 'human', label: 'Human intent' },
  { key: 'http', label: 'HTTP / application' },
  { key: 'tls', label: 'TLS protection' },
  { key: 'tcp', label: 'TCP / UDP transport' },
  { key: 'ip', label: 'IP packet' },
  { key: 'ethernet', label: 'Ethernet frame' },
  { key: 'bits', label: 'Bits / signal' },
]

export function EncapsulationStack({ stage }: Props) {
  return (
    <section className="encapsulation-stack">
      <div className="panel-heading">
        <span>Encapsulation Stack</span>
        <small>{stage.direction}</small>
      </div>

      <div className="stack-list">
        {stack.map((item) => {
          const hasData =
            item.key === 'human'
              ? Boolean(stage.representations.human)
              : item.key === 'http'
                ? Boolean(stage.representations.http)
                : item.key === 'tls'
                  ? Boolean(stage.representations.tls)
                  : item.key === 'tcp'
                    ? Boolean(stage.representations.tcp)
                    : item.key === 'ip'
                      ? Boolean(stage.representations.ip)
                      : item.key === 'ethernet'
                        ? Boolean(stage.representations.ethernet)
                        : Boolean(
                            stage.representations.bits ??
                              stage.representations.signal,
                          )

          return (
            <div
              key={item.key}
              className={
                hasData ? 'stack-item stack-item--active' : 'stack-item'
              }
            >
              <span>{item.label}</span>
              <small>{hasData ? 'visible in this stage' : 'not focused'}</small>
            </div>
          )
        })}
      </div>
    </section>
  )
}
TSX

cat > src/features/packet-atlas/PacketAtlasPage.tsx <<'TSX'
import { httpsExampleScenario } from './scenarios/httpsExample'
import { useAtlasStore } from './store/atlasStore'
import { GlobalJourneyMap } from './map/GlobalJourneyMap'
import { RouteTimeline } from './timeline/RouteTimeline'
import { PacketInspector } from './inspector/PacketInspector'
import { AssumptionBar } from './layers/AssumptionBar'
import { EncapsulationStack } from './layers/EncapsulationStack'
import './packetAtlas.css'

export function PacketAtlasPage() {
  const selectedStageId = useAtlasStore((state) => state.selectedStageId)
  const activeStage =
    httpsExampleScenario.stages.find((stage) => stage.id === selectedStageId) ??
    httpsExampleScenario.stages[0]

  return (
    <div className="atlas-shell">
      <header className="atlas-header">
        <div>
          <p className="eyebrow">Packet Atlas v0.1</p>
          <h1>{httpsExampleScenario.title}</h1>
          <p>{httpsExampleScenario.description}</p>
        </div>

        <div className="header-badge">
          <span>🧭</span>
          <strong>One journey</strong>
          <small>many lenses</small>
        </div>
      </header>

      <AssumptionBar scenario={httpsExampleScenario} />

      <main className="atlas-layout">
        <section className="map-column">
          <GlobalJourneyMap scenario={httpsExampleScenario} />
          <RouteTimeline scenario={httpsExampleScenario} />
        </section>

        <aside className="inspector-column">
          <PacketInspector stage={activeStage} />
          <EncapsulationStack stage={activeStage} />
        </aside>
      </main>
    </div>
  )
}
TSX

cat > src/features/packet-atlas/packetAtlas.css <<'CSS'
:root {
  color: #e5e7eb;
  background: #020617;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.16), transparent 32rem),
    radial-gradient(circle at top right, rgba(124, 58, 237, 0.14), transparent 28rem),
    #020617;
}

button {
  font: inherit;
}

.atlas-shell {
  width: min(1680px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 28px 0 40px;
}

.atlas-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #38bdf8;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.78rem;
}

.atlas-header h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 4.2rem);
  line-height: 0.95;
}

.atlas-header p {
  max-width: 850px;
  color: #94a3b8;
}

.header-badge {
  border: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.72);
  border-radius: 22px;
  padding: 18px 22px;
  min-width: 180px;
  display: grid;
  gap: 4px;
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.35);
}

.header-badge span {
  font-size: 1.8rem;
}

.header-badge small {
  color: #94a3b8;
}

.assumption-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  border: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.7);
  border-radius: 18px;
  padding: 12px;
  margin-bottom: 18px;
}

.assumption-bar strong {
  color: #bae6fd;
  margin-right: 6px;
}

.assumption-pill {
  border: 1px solid #334155;
  border-radius: 999px;
  padding: 6px 10px;
  color: #94a3b8;
  background: rgba(2, 6, 23, 0.5);
  font-size: 0.82rem;
}

.assumption-pill b {
  color: #e5e7eb;
}

.atlas-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 470px;
  gap: 18px;
  align-items: start;
}

.map-column,
.inspector-column {
  display: grid;
  gap: 18px;
}

.journey-map,
.route-timeline,
.packet-inspector,
.encapsulation-stack {
  border: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.76);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 18px 80px rgba(0, 0, 0, 0.28);
}

.journey-map {
  height: 620px;
}

.stage-node {
  text-align: left;
  display: grid;
  gap: 7px;
}

.stage-node__top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: #7dd3fc;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stage-node strong {
  display: block;
  font-size: 0.92rem;
}

.stage-node small {
  color: #94a3b8;
  font-size: 0.7rem;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  border-bottom: 1px solid #1e293b;
  padding: 14px 16px;
  background: rgba(2, 6, 23, 0.55);
  font-weight: 800;
}

.panel-heading small {
  color: #94a3b8;
  font-weight: 600;
}

.route-timeline {
  padding-bottom: 8px;
}

.timeline-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 8px;
  padding: 12px;
}

.timeline-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  text-align: left;
  color: #e5e7eb;
  border: 1px solid #1e293b;
  background: #0f172a;
  border-radius: 14px;
  padding: 10px;
  cursor: pointer;
}

.timeline-item:hover,
.timeline-item--active {
  border-color: #38bdf8;
  background: #102436;
}

.timeline-item__index {
  color: #38bdf8;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.timeline-item__main {
  display: grid;
  gap: 3px;
}

.timeline-item small {
  color: #94a3b8;
  line-height: 1.3;
}

.packet-inspector {
  padding-bottom: 16px;
}

.lens-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 16px 4px;
}

.lens-tab {
  border: 1px solid #334155;
  background: #020617;
  color: #cbd5e1;
  border-radius: 999px;
  padding: 8px 10px;
  cursor: pointer;
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 0.86rem;
}

.lens-tab:hover,
.lens-tab--active {
  border-color: #38bdf8;
  background: #082f49;
  color: #f8fafc;
}

.inspector-copy {
  padding: 10px 16px 2px;
}

.inspector-copy h3 {
  margin: 0 0 6px;
}

.inspector-copy p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.55;
}

.projection-box {
  margin: 14px 16px;
  border: 1px solid #1e293b;
  border-radius: 16px;
  overflow: hidden;
  background: #020617;
}

.projection-box__heading {
  padding: 10px 12px;
  border-bottom: 1px solid #1e293b;
  color: #bae6fd;
  font-weight: 800;
}

.projection-box pre {
  margin: 0;
  padding: 14px;
  overflow: auto;
  color: #a7f3d0;
  font-size: 0.82rem;
  line-height: 1.45;
}

.muted {
  color: #94a3b8;
  padding: 14px;
  margin: 0;
}

.teaching-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 16px;
}

.teaching-grid div {
  border: 1px solid #1e293b;
  background: rgba(2, 6, 23, 0.42);
  border-radius: 15px;
  padding: 12px;
}

.teaching-grid p {
  margin: 6px 0 0;
  color: #cbd5e1;
  line-height: 1.45;
  font-size: 0.92rem;
}

.teaching-grid__wide {
  grid-column: 1 / -1;
}

.stack-list {
  display: grid;
  gap: 8px;
  padding: 14px;
}

.stack-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid #1e293b;
  border-radius: 14px;
  padding: 10px 12px;
  color: #64748b;
  background: rgba(2, 6, 23, 0.5);
}

.stack-item--active {
  color: #e5e7eb;
  border-color: #38bdf8;
  background: rgba(8, 47, 73, 0.55);
}

.stack-item small {
  color: #94a3b8;
}

.react-flow__attribution {
  background: transparent;
  color: #64748b;
}

@media (max-width: 1180px) {
  .atlas-layout {
    grid-template-columns: 1fr;
  }

  .inspector-column {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .atlas-header {
    display: grid;
  }

  .teaching-grid {
    grid-template-columns: 1fr;
  }

  .journey-map {
    height: 520px;
  }
}
CSS

cat > src/App.tsx <<'TSX'
import { PacketAtlasPage } from './features/packet-atlas/PacketAtlasPage'

function App() {
  return <PacketAtlasPage />
}

export default App
TSX

cat > src/index.css <<'CSS'
html {
  background: #020617;
}

body {
  margin: 0;
}
CSS

cat > tests/unit/scenario.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('httpsExampleScenario', () => {
  it('has a valid first journey with linked stages', () => {
    expect(httpsExampleScenario.id).toBe('https-example-basic')
    expect(httpsExampleScenario.stages[0].id).toBe('url-intent')
    expect(httpsExampleScenario.stages.length).toBeGreaterThanOrEqual(10)

    const ids = new Set(httpsExampleScenario.stages.map((stage) => stage.id))

    for (const stage of httpsExampleScenario.stages) {
      for (const nextId of stage.relations.nextIds) {
        expect(ids.has(nextId)).toBe(true)
      }

      for (const previousId of stage.relations.previousIds) {
        expect(ids.has(previousId)).toBe(true)
      }
    }
  })
})
TS

echo "✅ v0.1 Core Atlas Skeleton created."
echo "🧪 Run: npm run build && npm test"
