import { useMemo, useState } from 'react'
import { PacketInspector } from '../inspector/PacketInspector'
import { EncapsulationStack } from '../layers/EncapsulationStack'
import type {
  JourneyScenario,
  JourneyStage,
} from '../schema/journeyScenarioSchema'

type Props = {
  scenario: JourneyScenario
  stage: JourneyStage
}

type TabId = 'inspector' | 'device' | 'stack'
type DeviceRole = JourneyStage['device']['role']

const tabs: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'inspector', label: 'Inspector', icon: '🔍' },
  { id: 'device', label: 'Device', icon: '🛰️' },
  { id: 'stack', label: 'Stack', icon: '📦' },
]

const roleInfo: Record<
  DeviceRole,
  {
    title: string
    canSee: string[]
    cannotAssume: string[]
    diagnosticQuestion: string
    mentalModel: string
  }
> = {
  user: {
    title: 'Human observer',
    canSee: ['visible browser behavior', 'address bar', 'loading / error state'],
    cannotAssume: ['DNS details', 'TCP state', 'TLS records', 'MAC addresses', 'raw packets'],
    diagnosticQuestion: 'Is the problem visible to the user, or only visible deeper in the stack?',
    mentalModel: 'The user sees the destination, not the road under the snow.',
  },
  browser: {
    title: 'Browser / application view',
    canSee: ['URL', 'cache state', 'HTTP semantics', 'TLS endpoint result', 'rendered document'],
    cannotAssume: ['switch MAC table', 'router NAT table', 'every physical signal detail'],
    diagnosticQuestion: 'Is the failure before HTTP, inside HTTP, or after rendering starts?',
    mentalModel: 'The browser is the narrator of the user story, not the whole network.',
  },
  os: {
    title: 'Operating system network stack',
    canSee: ['sockets', 'ports', 'local IP configuration', 'routing decision', 'ARP/neighbor cache'],
    cannotAssume: ['application business logic', 'remote internal infrastructure details'],
    diagnosticQuestion: 'Does the local host know where to send the next packet?',
    mentalModel: 'The OS is the dispatch center between apps and the NIC.',
  },
  nic: {
    title: 'Network interface card',
    canSee: ['frames entering/leaving the host', 'local link behavior', 'medium-facing transmit/receive'],
    cannotAssume: ['HTTP meaning', 'DNS names', 'database queries'],
    diagnosticQuestion: 'Is traffic physically leaving or entering the host interface?',
    mentalModel: 'The NIC is the gate between software packets and physical medium.',
  },
  switch: {
    title: 'Switch / link-layer forwarding',
    canSee: ['source MAC', 'destination MAC', 'VLAN/local port context', 'frame forwarding'],
    cannotAssume: ['website name', 'HTTP method', 'TLS plaintext', 'database logic'],
    diagnosticQuestion: 'Is the frame being delivered correctly on the local segment?',
    mentalModel: 'A switch is a building hallway guide for local doors, not a global map.',
  },
  router: {
    title: 'Router / NAT path decision',
    canSee: ['source/destination IP', 'next hop', 'TTL behavior', 'NAT/PAT mapping when enabled'],
    cannotAssume: ['decrypted HTTPS body', 'browser cache result', 'database response content'],
    diagnosticQuestion: 'Is the packet routable, translated correctly and allowed onward?',
    mentalModel: 'The router is the border checkpoint between networks.',
  },
  firewall: {
    title: 'Stateful firewall perspective',
    canSee: ['5-tuple', 'connection state', 'policy match', 'allowed/blocked decision'],
    cannotAssume: ['full encrypted HTTP content', 'all endpoint application context'],
    diagnosticQuestion: 'Is traffic blocked by policy, missing state, or wrong direction?',
    mentalModel: 'The firewall is a guard checking the pass, not reading every sealed letter.',
  },
  dns: {
    title: 'DNS resolver perspective',
    canSee: ['queried name', 'record type', 'DNS answer', 'resolver cache behavior'],
    cannotAssume: ['HTTP content', 'TCP 443 session details', 'server application internals'],
    diagnosticQuestion: 'Did the name become the expected address?',
    mentalModel: 'DNS is the address book, not the destination building.',
  },
  proxy: {
    title: 'Reverse proxy / edge perspective',
    canSee: ['client connection', 'TLS termination when configured', 'HTTP request/response metadata', 'upstream target'],
    cannotAssume: ['client LAN MAC table', 'browser local cache', 'database internals unless logged'],
    diagnosticQuestion: 'Did the request reach the edge and get forwarded to the right upstream?',
    mentalModel: 'The reverse proxy is the front desk of the server-side building.',
  },
  app: {
    title: 'Application server perspective',
    canSee: ['route handler', 'request parameters', 'business logic', 'internal service calls'],
    cannotAssume: ['physical cable state', 'client switch forwarding', 'original encrypted wire view'],
    diagnosticQuestion: 'Did the application logic produce the expected response?',
    mentalModel: 'The app is the department that writes the answer.',
  },
  db: {
    title: 'Database perspective',
    canSee: ['query', 'tables/indexes touched', 'result set', 'transaction behavior'],
    cannotAssume: ['browser URL bar', 'TLS handshake', 'switch/router path'],
    diagnosticQuestion: 'Did the data layer return the expected facts fast enough?',
    mentalModel: 'The database is the archive room, not the courier route.',
  },
}

function DevicePerspectiveTab({ scenario, stage }: Props) {
  const node = useMemo(
    () => scenario.topology.nodes.find((item) => item.id === stage.device.nodeId),
    [scenario.topology.nodes, stage.device.nodeId],
  )
  const info = roleInfo[stage.device.role]

  return (
    <section className="device-tab-v05">
      <div className="device-tab-v05__hero">
        <span className="device-tab-v05__icon">🛰️</span>
        <div>
          <p>Who is looking?</p>
          <h2>{node?.label ?? stage.device.nodeId}</h2>
          <small>
            {info.title} · role: <b>{stage.device.role}</b> · node:{' '}
            <b>{stage.device.nodeId}</b>
          </small>
        </div>
      </div>

      <div className="device-tab-v05__chips">
        {stage.layerFocus.map((lens) => (
          <span key={lens}>{lens}</span>
        ))}
      </div>

      <div className="device-tab-v05__grid">
        <article className="device-tab-card device-tab-card--can">
          <strong>👁️ What this device can see</strong>
          <ul>
            {info.canSee.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="device-tab-card device-tab-card--cannot">
          <strong>🚫 What it should not be assumed to see</strong>
          <ul>
            {info.cannotAssume.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className="device-tab-note device-tab-note--question">
        <strong>🧪 Diagnostic question</strong>
        <p>{info.diagnosticQuestion}</p>
      </article>

      <article className="device-tab-note device-tab-note--model">
        <strong>🧠 Mental model</strong>
        <p>{info.mentalModel}</p>
      </article>

      <article className="device-tab-note">
        <strong>🧩 This exact stage</strong>
        <p>{stage.copy.whatReallyHappens}</p>
      </article>
    </section>
  )
}

export function RightPanelTabs({ scenario, stage }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('inspector')

  return (
    <aside className="right-panel-tabs" aria-label="Right side details panel">
      <div className="right-panel-tabs__bar" role="tablist" aria-label="Detail tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={
              activeTab === tab.id
                ? 'right-panel-tab right-panel-tab--active'
                : 'right-panel-tab'
            }
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="right-panel-tabs__stage-strip">
        <span>Active stage</span>
        <strong>{stage.shortName}</strong>
      </div>

      <div className="right-panel-tabs__content">
        {activeTab === 'inspector' && <PacketInspector stage={stage} />}
        {activeTab === 'device' && (
          <DevicePerspectiveTab scenario={scenario} stage={stage} />
        )}
        {activeTab === 'stack' && <EncapsulationStack stage={stage} />}
      </div>
    </aside>
  )
}
