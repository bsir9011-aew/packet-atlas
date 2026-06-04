import { useState } from 'react'
import { getProxyTerminationMode, type ProxyTerminationMode } from './proxyTerminationModel'

const modes: Array<{ id: ProxyTerminationMode; label: string }> = [
  { id: 'terminate-at-proxy', label: 'Terminate at proxy' },
  { id: 'tls-pass-through', label: 'TLS pass-through' },
  { id: 're-encrypt-upstream', label: 'Re-encrypt upstream' },
  { id: 'plain-http-upstream', label: 'Plain upstream' },
]

export function ProxyTerminationPanel() {
  const [mode, setMode] = useState<ProxyTerminationMode>('terminate-at-proxy')
  const active = getProxyTerminationMode(mode)

  return (
    <section className="proxy-termination-panel" aria-label="Proxy TLS termination modes">
      <div className="proxy-termination-heading">
        <div>
          <span className="panel-kicker">Proxy / TLS Termination</span>
          <h2>{active.title}</h2>
          <p>{active.summary}</p>
        </div>
        <span className="proxy-boundary">{active.boundary}</span>
      </div>

      <div className="proxy-mode-row">
        {modes.map((item) => (
          <button
            key={item.id}
            className={item.id === mode ? 'proxy-mode-chip proxy-mode-chip--active' : 'proxy-mode-chip'}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="proxy-visibility-grid">
        {active.visibility.map((item) => (
          <article key={item.observer} className="proxy-visibility-card">
            <h3>{item.observer}</h3>
            <div className="proxy-list-pair">
              <div>
                <strong>Can see</strong>
                <ul>{item.sees.map((value) => <li key={value}>{value}</li>)}</ul>
              </div>
              <div>
                <strong>Cannot assume</strong>
                <ul>{item.cannotAssume.map((value) => <li key={value}>{value}</li>)}</ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
