import { useState } from 'react'
import { getAccessMediumFlow, getAccessMediumSummary, type AccessMediumMode } from './wifiAccessModel'

const modes: Array<{ id: AccessMediumMode; label: string; icon: string }> = [
  { id: 'ethernet', label: 'Ethernet', icon: '🔌' },
  { id: 'wifi', label: 'Wi-Fi', icon: '📡' },
]

export function WifiAccessVariantPanel() {
  const [mode, setMode] = useState<AccessMediumMode>('ethernet')
  const summary = getAccessMediumSummary(mode)
  const flow = getAccessMediumFlow(mode)

  return (
    <section className="wifi-variant-panel" aria-label="Wi-Fi access medium variant">
      <div className="wifi-variant-heading">
        <div>
          <span className="panel-kicker">Access Medium Variant</span>
          <h2>{summary.title}</h2>
          <p>{summary.coreDifference}</p>
        </div>
        <div className="wifi-mode-switch">
          {modes.map((item) => (
            <button
              key={item.id}
              className={item.id === mode ? 'wifi-mode-chip wifi-mode-chip--active' : 'wifi-mode-chip'}
              onClick={() => setMode(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="wifi-trap">⚠️ {summary.trap}</div>

      <div className="wifi-step-grid">
        {flow.map((step, index) => (
          <article key={step.id} className="wifi-step-card">
            <span className="wifi-step-number">{String(index + 1).padStart(2, '0')}</span>
            <h3>{step.title}</h3>
            <p>{step.detail}</p>
            <div className="wifi-visible-row">
              {step.visibleTo.map((observer) => (
                <span key={observer}>{observer}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
