import { useState } from 'react'
import { getTlsVisibilityMode, type TlsVisibilityMode } from './tlsVisibilityModel'

const modes: Array<{ id: TlsVisibilityMode; label: string }> = [
  { id: 'plain-http', label: 'Plain HTTP' },
  { id: 'tls13-no-ech', label: 'TLS 1.3' },
  { id: 'tls13-ech-preview', label: 'TLS + ECH preview' },
]

export function TlsVisibilityPanel() {
  const [mode, setMode] = useState<TlsVisibilityMode>('tls13-no-ech')
  const active = getTlsVisibilityMode(mode)

  return (
    <section className="tls-visibility-panel" aria-label="TLS visibility and ECH panel">
      <div className="tls-visibility-heading">
        <div>
          <span className="panel-kicker">TLS Visibility</span>
          <h2>{active.title}</h2>
          <p>{active.summary}</p>
        </div>
        <div className="tls-mode-row">
          {modes.map((item) => (
            <button
              key={item.id}
              className={item.id === mode ? 'tls-mode-chip tls-mode-chip--active' : 'tls-mode-chip'}
              onClick={() => setMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tls-fact-grid">
        {active.facts.map((fact) => (
          <article key={fact.id} className={fact.visible ? 'tls-fact tls-fact--visible' : 'tls-fact tls-fact--hidden'}>
            <div className="tls-fact__top">
              <strong>{fact.label}</strong>
              <span>{fact.visible ? 'visible' : 'hidden'}</span>
            </div>
            <p>{fact.explanation}</p>
          </article>
        ))}
      </div>

      <div className="tls-visibility-trap">
        🔎 Key idea: encrypted content does not mean invisible traffic. Metadata can still exist at IP, transport and timing layers.
      </div>
    </section>
  )
}
