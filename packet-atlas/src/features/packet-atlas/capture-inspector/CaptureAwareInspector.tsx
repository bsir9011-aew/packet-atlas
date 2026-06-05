import type { JourneyStage } from '../schema/journeyScenarioSchema'
import { getCaptureProjectionForStage } from './captureAwareInspectorModel'

type Props = {
  stage: JourneyStage
}

export function CaptureAwareInspector({ stage }: Props) {
  const projection = getCaptureProjectionForStage(stage)

  return (
    <section className="capture-aware-inspector">
      <div className="panel-heading">
        <span>Capture-aware Inspector</span>
        <small>{projection.mode}</small>
      </div>

      <div className="capture-aware-inspector__body">
        <p>{projection.summary}</p>

        {projection.frame && (
          <div className="capture-aware-inspector__grid">
            <div>
              <span>Frame</span>
              <strong>{projection.frame.frameNumber}</strong>
            </div>
            <div>
              <span>Time</span>
              <strong>{projection.frame.timeRelative ?? '—'}</strong>
            </div>
            <div>
              <span>Protocol stack</span>
              <strong>{projection.frame.protocolStack?.join(' → ') ?? '—'}</strong>
            </div>
            <div>
              <span>Source</span>
              <strong>{projection.source ?? '—'}</strong>
            </div>
          </div>
        )}

        {projection.note && (
          <p className="capture-aware-inspector__note">{projection.note}</p>
        )}
      </div>
    </section>
  )
}
