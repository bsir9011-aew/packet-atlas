import { buildHttpsHttpContrastWorkspaceSummary } from './httpsHttpContrastWorkspaceModel'

export function HttpsHttpContrastPanel() {
  const summary = buildHttpsHttpContrastWorkspaceSummary()

  return (
    <section className="https-http-contrast-panel">
      <div className="panel-heading">
        <span>HTTP vs HTTPS Contrast Workspace</span>
        <small>{summary.status}</small>
      </div>

      <div className="https-http-contrast__hero">
        <div>
          <p className="https-http-contrast__eyebrow">verified side-by-side evidence</p>
          <h3>{summary.title}</h3>
          <p>{summary.headline}</p>
        </div>
        <div className="https-http-contrast__badge">
          <strong>2</strong>
          <span>real fixtures</span>
        </div>
      </div>

      <div className="https-http-contrast__table" role="table" aria-label="HTTPS versus HTTP capture contrast">
        <div className="https-http-contrast__row https-http-contrast__row--head" role="row">
          <span>Metric</span>
          <span>HTTPS capture</span>
          <span>HTTP local capture</span>
          <span>Meaning</span>
        </div>

        {summary.rows.map((row) => (
          <div key={row.metric} className="https-http-contrast__row" role="row">
            <strong>{row.metric}</strong>
            <span>{row.httpsValue}</span>
            <span>{row.httpValue}</span>
            <p>{row.explanation}</p>
          </div>
        ))}
      </div>

      <div className="https-http-contrast__rule">
        🧭 {summary.operatorRule}
      </div>
    </section>
  )
}
