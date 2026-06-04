import { useState } from 'react'
import { getNeighborFlow, getNeighborModeSummary, type NeighborMode } from './neighborDiscoveryModel'

const modes: Array<{ id: NeighborMode; label: string }> = [
  { id: 'ipv4-arp', label: 'IPv4 / ARP' },
  { id: 'ipv6-nd', label: 'IPv6 / Neighbor Discovery' },
]

export function Ipv6NeighborDiscoveryPanel() {
  const [mode, setMode] = useState<NeighborMode>('ipv4-arp')
  const summary = getNeighborModeSummary(mode)
  const flow = getNeighborFlow(mode)

  return (
    <section className="ipv6-nd-panel" aria-label="IPv6 Neighbor Discovery variant">
      <div className="ipv6-nd-panel__heading">
        <div>
          <strong>🌐 IPv4 ARP vs IPv6 Neighbor Discovery</strong>
          <p>Same atlas question: how does the host learn the local next-hop link-layer address?</p>
        </div>
      </div>

      <div className="ipv6-nd-toggle">
        {modes.map((item) => (
          <button
            key={item.id}
            className={item.id === mode ? 'ipv6-nd-chip ipv6-nd-chip--active' : 'ipv6-nd-chip'}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="ipv6-nd-summary">
        <strong>{summary.title}</strong>
        <p>{summary.keyDifference}</p>
        <span>⚠️ {summary.warning}</span>
      </div>

      <div className="ipv6-nd-flow">
        {flow.map((step, index) => (
          <article key={step.id} className="ipv6-nd-step">
            <span className="ipv6-nd-step__index">{index + 1}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
              <small>{step.actor} · {step.visibleScope}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
