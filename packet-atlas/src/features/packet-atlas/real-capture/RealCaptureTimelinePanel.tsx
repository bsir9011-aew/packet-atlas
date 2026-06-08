import { buildRealCaptureTimelineSummary } from './realCaptureTimelineModel'

export function RealCaptureTimelinePanel() {
  const summary = buildRealCaptureTimelineSummary()

  return (
    <section className="real-capture-timeline-panel">
      <div className="panel-heading">
        <span>Real Capture Timeline</span>
        <small>{summary.frameCount} frames</small>
      </div>

      <div className="real-capture-timeline__hero">
        <strong>{summary.groupCount} evidence groups</strong>
        <p>{summary.story}</p>
      </div>

      <div className="real-capture-timeline__rail">
        {summary.groups.map((group, index) => (
          <div key={group.id} className="real-capture-timeline__group">
            <div className="real-capture-timeline__index">
              {String(index + 1).padStart(2, '0')}
            </div>
            <div>
              <h3>{group.label}</h3>
              <p>{group.explanation}</p>
              <div className="real-capture-timeline__meta">
                <span>{group.frameCount} frames</span>
                <span>{group.dominantCategory}</span>
                <span>{group.direction}</span>
              </div>
              <small>frames: {group.frameNumbers.join(', ')}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
