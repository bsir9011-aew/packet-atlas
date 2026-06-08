import { buildTlsBoundarySummary } from './tlsBoundaryModel'

export function TlsBoundaryPanel() {
  const summary = buildTlsBoundarySummary()

  return (
    <section className="tls-boundary-panel">
      <div className="panel-heading">
        <span>TLS Visibility Boundary</span>
        <small>{summary.mode}</small>
      </div>

      <div className="tls-boundary__hero">
        <strong>What the wire proves — and what it does not</strong>
        <p>{summary.keyBoundary}</p>
      </div>

      <div className="tls-boundary__columns">
        <div className="tls-boundary__column tls-boundary__column--visible">
          <h3>Visible to network observer</h3>
          {summary.networkCanSee.map((item) => (
            <div key={item.label}>
              <strong>✅ {item.label}</strong>
              <p>{item.explanation}</p>
            </div>
          ))}
        </div>

        <div className="tls-boundary__column tls-boundary__column--hidden">
          <h3>Cannot assume from this trace</h3>
          {summary.networkCannotAssume.map((item) => (
            <div key={item.label}>
              <strong>🚫 {item.label}</strong>
              <p>{item.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="tls-boundary__proof">
        {summary.verifiedByCapture.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  )
}
