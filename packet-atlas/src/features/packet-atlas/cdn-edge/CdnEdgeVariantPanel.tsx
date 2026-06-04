import { useState } from 'react'
import { getCdnEdgeMode, type CdnEdgeMode } from './cdnEdgeModel'

const modes: Array<{ id: CdnEdgeMode; label: string }> = [
  { id: 'direct-origin', label: 'Direct origin' },
  { id: 'cdn-cache-hit', label: 'CDN cache hit' },
  { id: 'cdn-cache-miss', label: 'CDN cache miss' },
  { id: 'edge-error', label: 'Edge error' },
]

export function CdnEdgeVariantPanel() {
  const [mode, setMode] = useState<CdnEdgeMode>('cdn-cache-hit')
  const active = getCdnEdgeMode(mode)

  return (
    <section className="cdn-edge-panel" aria-label="CDN and edge variant">
      <div className="cdn-edge-heading">
        <div>
          <span className="panel-kicker">CDN / Edge Variant</span>
          <h2>{active.title}</h2>
          <p>{active.summary}</p>
        </div>
      </div>

      <div className="cdn-mode-row">
        {modes.map((item) => (
          <button
            key={item.id}
            className={item.id === mode ? 'cdn-mode-chip cdn-mode-chip--active' : 'cdn-mode-chip'}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="cdn-model-split">
        <article>
          <strong>🧠 User mental model</strong>
          <p>{active.userMentalModel}</p>
        </article>
        <article>
          <strong>🛰️ Atlas truth</strong>
          <p>{active.truth}</p>
        </article>
      </div>

      <div className="cdn-hop-row">
        {active.hops.map((hop, index) => (
          <article key={hop.id} className={hop.reached ? 'cdn-hop cdn-hop--reached' : 'cdn-hop cdn-hop--not-reached'}>
            <span>{String(index + 1).padStart(2, '0')} · {hop.role}</span>
            <h3>{hop.title}</h3>
            <p>{hop.detail}</p>
            <b>{hop.reached ? 'reached' : 'not reached'}</b>
          </article>
        ))}
      </div>
    </section>
  )
}
