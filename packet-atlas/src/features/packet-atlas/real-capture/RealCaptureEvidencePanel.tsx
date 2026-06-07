import {
  buildRealCaptureEvidenceCards,
  buildRealCaptureEvidenceSummary,
} from './realCaptureEvidenceModel'

export function RealCaptureEvidencePanel() {
  const summary = buildRealCaptureEvidenceSummary()
  const cards = buildRealCaptureEvidenceCards()

  return (
    <section className="real-capture-evidence-panel">
      <div className="panel-heading">
        <span>Real Capture Evidence</span>
        <small>{summary.status}</small>
      </div>

      <div className="real-capture-evidence__hero">
        <div>
          <p className="real-capture-evidence__eyebrow">
            verified capture, normalized JSON
          </p>
          <h3>HTTPS trace: DNS + TCP/443 + TLS, no readable HTTP</h3>
          <p>{summary.keyClaim}</p>
        </div>

        <div className="real-capture-evidence__seal">
          <strong>{summary.frameCount}</strong>
          <span>frames</span>
        </div>
      </div>

      <div className="real-capture-evidence__grid">
        {cards.map((card) => (
          <div key={card.label} className="real-capture-evidence__card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.detail}</small>
          </div>
        ))}
      </div>

      <div className="real-capture-evidence__stage-strip">
        {Object.entries(summary.stageCounts).map(([stageId, count]) => (
          <span key={stageId}>
            {stageId}: <strong>{count}</strong>
          </span>
        ))}
      </div>
    </section>
  )
}
