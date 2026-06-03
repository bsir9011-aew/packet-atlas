#!/usr/bin/env bash
set -euo pipefail

echo "🧭 Applying Packet Atlas v0.4 — Device Perspective Panel..."

if [ ! -f package.json ] || [ ! -d src/features/packet-atlas ]; then
  echo "❌ Run this script from the inner app folder, the one that contains package.json and src/features/packet-atlas."
  echo "   Example: cd /workspaces/packet-atlas/packet-atlas"
  exit 1
fi

mkdir -p patches/backups/v0.4
cp -f src/features/packet-atlas/PacketAtlasPage.tsx patches/backups/v0.4/PacketAtlasPage.before-v0.4.tsx
cp -f src/features/packet-atlas/packetAtlas.css patches/backups/v0.4/packetAtlas.before-v0.4.css
mkdir -p src/features/packet-atlas/layers tests/unit

cat > src/features/packet-atlas/layers/DevicePerspectivePanel.tsx <<'TSX'
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
TSX

python3 <<'PY'
from pathlib import Path

page_path = Path('src/features/packet-atlas/PacketAtlasPage.tsx')
text = page_path.read_text()

for old in ['Packet Atlas v0.3', 'Packet Atlas v0.2', 'Packet Atlas v0.1']:
    text = text.replace(old, 'Packet Atlas v0.4')

if "DevicePerspectivePanel" not in text:
    marker = "import { EncapsulationStack } from './layers/EncapsulationStack'\n"
    replacement = marker + "import { DevicePerspectivePanel } from './layers/DevicePerspectivePanel'\n"
    if marker in text:
        text = text.replace(marker, replacement)
    else:
        text = text.replace(
            "import './packetAtlas.css'\n",
            "import { DevicePerspectivePanel } from './layers/DevicePerspectivePanel'\nimport './packetAtlas.css'\n",
        )

if '<DevicePerspectivePanel scenario={httpsExampleScenario} stage={activeStage} />' not in text:
    anchor = '<PacketInspector stage={activeStage} />'
    if anchor in text:
        text = text.replace(
            anchor,
            anchor + '\n          <DevicePerspectivePanel scenario={httpsExampleScenario} stage={activeStage} />',
        )
    else:
        raise SystemExit('Could not find PacketInspector stage={activeStage} insertion point')

page_path.write_text(text)

css_path = Path('src/features/packet-atlas/packetAtlas.css')
css = css_path.read_text()
marker_start = '/* === Packet Atlas v0.4 Device Perspective START === */'
marker_end = '/* === Packet Atlas v0.4 Device Perspective END === */'

if marker_start in css and marker_end in css:
    css = css.split(marker_start)[0].rstrip() + '\n\n' + css.split(marker_end, 1)[1].lstrip()

v04_css = r'''
/* === Packet Atlas v0.4 Device Perspective START === */

.device-perspective-panel {
  border: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.76);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 18px 80px rgba(0, 0, 0, 0.28);
}

.device-perspective-hero {
  margin: 14px 16px 12px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  border: 1px solid #1e293b;
  border-radius: 18px;
  padding: 14px;
  background:
    radial-gradient(circle at top left, rgba(34, 197, 94, 0.12), transparent 16rem),
    rgba(2, 6, 23, 0.58);
}

.device-perspective-hero__icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  border: 1px solid #334155;
  background: rgba(15, 23, 42, 0.85);
  font-size: 1.3rem;
  flex: 0 0 auto;
}

.device-perspective-hero__eyebrow {
  margin: 0 0 3px;
  color: #86efac;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.device-perspective-hero h3 {
  margin: 0 0 5px;
  font-size: 1.12rem;
}

.device-perspective-hero p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.45;
}

.device-layer-strip {
  margin: 0 16px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.device-layer-strip span {
  border: 1px solid #334155;
  border-radius: 999px;
  padding: 6px 9px;
  color: #bae6fd;
  background: rgba(2, 6, 23, 0.55);
  font-size: 0.78rem;
  font-weight: 800;
}

.device-perspective-grid {
  margin: 0 16px 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.device-perspective-card {
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: 12px;
  background: rgba(2, 6, 23, 0.5);
}

.device-perspective-card--sees {
  border-color: rgba(34, 197, 94, 0.42);
}

.device-perspective-card--blind {
  border-color: rgba(251, 146, 60, 0.38);
}

.device-perspective-card strong {
  display: block;
  margin-bottom: 8px;
  color: #f8fafc;
}

.device-perspective-card ul {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 7px;
  color: #cbd5e1;
  line-height: 1.4;
  font-size: 0.9rem;
}

.device-diagnostic-box {
  margin: 0 16px 12px;
  border: 1px solid rgba(56, 189, 248, 0.34);
  border-radius: 16px;
  padding: 12px;
  background: rgba(8, 47, 73, 0.34);
}

.device-diagnostic-box--model {
  border-color: rgba(168, 85, 247, 0.34);
  background: rgba(59, 7, 100, 0.22);
}

.device-diagnostic-box strong {
  color: #f8fafc;
}

.device-diagnostic-box p {
  margin: 7px 0 0;
  color: #cbd5e1;
  line-height: 1.45;
}

@media (max-width: 540px) {
  .device-perspective-grid {
    grid-template-columns: 1fr;
  }
}

/* === Packet Atlas v0.4 Device Perspective END === */
'''

css = css.rstrip() + '\n\n' + v04_css.lstrip()
css_path.write_text(css)
PY

cat > tests/unit/scenarioTopology.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { httpsExampleScenario } from '../../src/features/packet-atlas/scenarios/httpsExample'

describe('scenario topology integrity', () => {
  it('points every stage at an existing topology node', () => {
    const topologyNodeIds = new Set(
      httpsExampleScenario.topology.nodes.map((node) => node.id),
    )

    for (const stage of httpsExampleScenario.stages) {
      expect(topologyNodeIds.has(stage.device.nodeId)).toBe(true)
    }
  })

  it('uses topology links with existing source and target nodes', () => {
    const topologyNodeIds = new Set(
      httpsExampleScenario.topology.nodes.map((node) => node.id),
    )

    for (const link of httpsExampleScenario.topology.links) {
      expect(topologyNodeIds.has(link.source)).toBe(true)
      expect(topologyNodeIds.has(link.target)).toBe(true)
    }
  })
})
TS

echo "✅ v0.4 applied: Device Perspective Panel added."
echo "🧪 Now run: npm run build && npm test"
