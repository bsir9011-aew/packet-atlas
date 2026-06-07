import {
  buildRealCaptureEvidenceCards,
  buildRealCaptureEvidenceSummary,
} from './realCaptureEvidenceModel'
import {
  buildRealFrameSemanticSummary,
  getTopRealFrameSemanticRows,
} from './realFrameSemanticsModel'

export function RealCaptureEvidencePanel() {
  const summary = buildRealCaptureEvidenceSummary()
  const cards = buildRealCaptureEvidenceCards()
  const semanticSummary = buildRealFrameSemanticSummary()
  const semanticRows = getTopRealFrameSemanticRows(8)

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

      <div className="real-frame-semantics">
        <div className="real-frame-semantics__header">
          <div>
            <strong>Frame semantics</strong>
            <p>{semanticSummary.teachingPoint}</p>
          </div>
          <span>{semanticSummary.refinedCount} refined</span>
        </div>

        <div className="real-frame-semantics__grid">
          {Object.entries(semanticSummary.categoryCounts).map(([category, count]) => (
            <span key={category}>
              {category}: <strong>{count}</strong>
            </span>
          ))}
        </div>

        <div className="real-frame-semantics__rows">
          {semanticRows.map((row) => (
            <div key={row.frameNumber}>
              <span>#{row.frameNumber}</span>
              <strong>{row.category}</strong>
              <small>{row.reason}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
