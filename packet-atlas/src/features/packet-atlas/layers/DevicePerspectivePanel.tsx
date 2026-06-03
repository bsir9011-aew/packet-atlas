import type {
  JourneyScenario,
  JourneyStage,
} from '../schema/journeyScenarioSchema'

type Props = {
  scenario: JourneyScenario
  stage: JourneyStage
}

type Perspective = {
  sees: string[]
  doesNotSee: string[]
  diagnosticQuestion: string
  mentalModel: string
}

function valueText(value: unknown) {
  if (value === undefined || value === null || value === '') return '—'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'yes' : 'no'
  return String(value)
}

function compact(items: Array<string | undefined | false>) {
  return items.filter(Boolean) as string[]
}

function protocolHighlights(stage: JourneyStage) {
  const reps = stage.representations
  return compact([
    reps.human ? 'human intent / browser-visible state' : undefined,
    reps.http ? 'HTTP/application meaning' : undefined,
    reps.tls ? 'TLS security state' : undefined,
    reps.tcp ? 'transport ports / stream state' : undefined,
    reps.ip ? 'source and destination IP context' : undefined,
    reps.ethernet ? 'local frame / MAC context' : undefined,
    reps.bits || reps.signal ? 'symbolic bits / physical medium' : undefined,
  ])
}

function buildPerspective(stage: JourneyStage): Perspective {
  const role = stage.device.role
  const a = stage.addresses
  const protocol = protocolHighlights(stage)

  if (role === 'user') {
    return {
      sees: compact([
        stage.copy.whatUserSees,
        'a simple goal, not yet packets or frames',
      ]),
      doesNotSee: [
        'DNS lookup details',
        'TCP ports and sequence state',
        'TLS records, IP packets, frames and bits',
      ],
      diagnosticQuestion:
        'Is the problem visible to the user, or only visible deeper in the stack?',
      mentalModel:
        'The user is at the top of the mountain. They see the destination, not the roads under the snow.',
    }
  }

  if (role === 'browser') {
    return {
      sees: compact([
        'URL/navigation state and application intent',
        stage.representations.http ? 'HTTP meaning such as method, path, host or response' : undefined,
        stage.representations.tls ? 'TLS session/security state at the endpoint' : undefined,
        ...protocol,
      ]),
      doesNotSee: [
        'switch MAC-table decisions',
        'every intermediate router hop',
        'raw physical signal on the cable/radio path',
      ],
      diagnosticQuestion:
        'Did the browser really send network traffic, or did cache/service worker/connection reuse handle it?',
      mentalModel:
        'The browser is the author of the letter. It understands the words, but not every sorting machine on the route.',
    }
  }

  if (role === 'os' || role === 'nic') {
    return {
      sees: compact([
        a?.srcIp ? `local source IP: ${valueText(a.srcIp)}` : undefined,
        a?.dstIp ? `destination IP: ${valueText(a.dstIp)}` : undefined,
        a?.srcPort ? `source port: ${valueText(a.srcPort)}` : undefined,
        a?.dstPort ? `destination port: ${valueText(a.dstPort)}` : undefined,
        a?.srcMac ? `local source MAC: ${valueText(a.srcMac)}` : undefined,
        a?.dstMac ? `local next-hop MAC: ${valueText(a.dstMac)}` : undefined,
        ...protocol,
      ]),
      doesNotSee: [
        'business logic inside the remote app server',
        'database internals behind the proxy',
        'all future route changes across the Internet',
      ],
      diagnosticQuestion:
        'Does the host have the right IP, gateway, DNS and local next-hop information?',
      mentalModel:
        'The OS is the shipping department. It turns an application request into labeled parcels.',
    }
  }

  if (role === 'switch') {
    return {
      sees: compact([
        a?.srcMac ? `source MAC: ${valueText(a.srcMac)}` : undefined,
        a?.dstMac ? `destination MAC: ${valueText(a.dstMac)}` : undefined,
        stage.representations.ethernet ? 'Ethernet frame context' : undefined,
        stage.representations.bits ? 'frame serialized into bits on the local medium' : undefined,
      ]),
      doesNotSee: [
        'the URL example.com as a browser concept',
        'the HTTP body inside HTTPS',
        'the full end-to-end Internet route',
      ],
      diagnosticQuestion:
        'Is the local frame going to the correct next-hop MAC and switch port?',
      mentalModel:
        'The switch is a hallway guard reading room numbers, not the contents of the envelope.',
    }
  }

  if (role === 'router' || role === 'firewall') {
    return {
      sees: compact([
        a?.srcIp ? `source IP before this point: ${valueText(a.srcIp)}` : undefined,
        a?.dstIp ? `destination IP: ${valueText(a.dstIp)}` : undefined,
        a?.srcPort ? `source port: ${valueText(a.srcPort)}` : undefined,
        a?.dstPort ? `destination port: ${valueText(a.dstPort)}` : undefined,
        a?.natSrcIp ? `NAT source IP after translation: ${valueText(a.natSrcIp)}` : undefined,
        a?.natSrcPort ? `NAT source port after translation: ${valueText(a.natSrcPort)}` : undefined,
        stage.representations.ip ? 'IP forwarding context' : undefined,
        stage.representations.tcp ? 'transport tuple / connection state hints' : undefined,
      ]),
      doesNotSee: [
        'plaintext HTTP content when TLS is still encrypted',
        'the user interface that triggered the traffic',
        'remote server-side app/database internals',
      ],
      diagnosticQuestion:
        'Is routing/NAT/stateful firewall policy allowing the packet and its return path?',
      mentalModel:
        'The router is a border office: it rewrites outside-facing labels and chooses the next road.',
    }
  }

  if (role === 'dns') {
    return {
      sees: compact([
        'the name-resolution question or answer',
        a?.srcIp ? `requester-facing source IP: ${valueText(a.srcIp)}` : undefined,
        a?.dstIp ? `destination IP: ${valueText(a.dstIp)}` : undefined,
        stage.representations.ip ? `answer/context: ${JSON.stringify(stage.representations.ip)}` : undefined,
      ]),
      doesNotSee: [
        'the final HTTP page content',
        'the TLS-protected web conversation',
        'the browser rendering process',
      ],
      diagnosticQuestion:
        'Did the client receive the expected address before trying to connect to the web service?',
      mentalModel:
        'DNS is a phone book. It gives you an address, not the conversation.',
    }
  }

  if (role === 'proxy') {
    return {
      sees: compact([
        stage.representations.http ? 'HTTP request/response meaning at the edge' : undefined,
        stage.representations.tls ? 'possible TLS termination boundary' : undefined,
        'client-facing and upstream-facing application flow',
        ...protocol,
      ]),
      doesNotSee: [
        'the user’s private LAN MAC addresses after routing boundaries',
        'database internals unless logged or proxied through the app',
        'the physical signal on the client network',
      ],
      diagnosticQuestion:
        'Did the request reach the edge, and was it forwarded to the correct upstream app?',
      mentalModel:
        'The reverse proxy is the front desk. It receives visitors and sends them to the right department.',
    }
  }

  if (role === 'app') {
    return {
      sees: compact([
        'application-level operation',
        stage.representations.http ? 'HTTP method/path/status or app action' : undefined,
        stage.representations.human ? 'human-facing meaning of the request' : undefined,
      ]),
      doesNotSee: [
        'the client’s original Ethernet frame',
        'the switch forwarding decision',
        'the exact physical signal that carried the request',
      ],
      diagnosticQuestion:
        'Did the application receive the intended operation and produce the expected response?',
      mentalModel:
        'The app is the office worker opening the letter and deciding what answer to write.',
    }
  }

  if (role === 'db') {
    return {
      sees: [
        'internal query/data operation',
        'application identity or database connection context',
      ],
      doesNotSee: [
        'the browser URL bar',
        'client-side TCP handshake',
        'the public Internet route',
      ],
      diagnosticQuestion:
        'Did the internal data dependency answer quickly and correctly?',
      mentalModel:
        'The database is the archive room. It knows records, not the whole journey from the user.',
    }
  }

  return {
    sees: protocol.length > 0 ? protocol : ['selected stage context'],
    doesNotSee: ['details outside this device role'],
    diagnosticQuestion: 'What is visible from this device’s layer and position?',
    mentalModel: 'Every device sees only its slice of the same journey.',
  }
}

export function DevicePerspectivePanel({ scenario, stage }: Props) {
  const activeNode = scenario.topology.nodes.find(
    (node) => node.id === stage.device.nodeId,
  )
  const perspective = buildPerspective(stage)

  return (
    <section className="device-perspective-panel">
      <div className="panel-heading">
        <span>Device Perspective</span>
        <small>{activeNode?.label ?? stage.device.nodeId}</small>
      </div>

      <div className="device-perspective-hero">
        <div className="device-perspective-hero__icon">🛰️</div>
        <div>
          <p className="device-perspective-hero__eyebrow">Who is looking?</p>
          <h3>{activeNode?.label ?? stage.device.nodeId}</h3>
          <p>
            Role: <strong>{stage.device.role}</strong>
            {activeNode?.kind ? (
              <>
                {' '}
                · Kind: <strong>{activeNode.kind}</strong>
              </>
            ) : null}
          </p>
        </div>
      </div>

      <div className="device-layer-strip" aria-label="Focused layers">
        {stage.layerFocus.map((layer) => (
          <span key={layer}>{layer}</span>
        ))}
      </div>

      <div className="device-perspective-grid">
        <article className="device-perspective-card device-perspective-card--sees">
          <strong>👁️ What this device can see</strong>
          <ul>
            {perspective.sees.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="device-perspective-card device-perspective-card--blind">
          <strong>🚫 What it should not be assumed to see</strong>
          <ul>
            {perspective.doesNotSee.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="device-diagnostic-box">
        <strong>🧪 Diagnostic question</strong>
        <p>{perspective.diagnosticQuestion}</p>
      </div>

      <div className="device-diagnostic-box device-diagnostic-box--model">
        <strong>🧠 Mental model</strong>
        <p>{perspective.mentalModel}</p>
      </div>
    </section>
  )
}
