import type {
  JourneyScenario,
  JourneyStage,
} from '../schema/journeyScenarioSchema'
import { getProtocolDiagram } from './protocolDiagramModel'

type Props = {
  stage: JourneyStage
  scenario: JourneyScenario
}

export function ProtocolMiniDiagram({ stage, scenario }: Props) {
  const diagram = getProtocolDiagram(stage, scenario)

  return (
    <section className="protocol-mini-diagram">
      <div className="panel-heading">
        <span>Protocol Mini Diagram</span>
        <small>{stage.stageKind}</small>
      </div>

      <div className="protocol-mini-diagram__hero">
        <div>
          <p className="protocol-mini-diagram__eyebrow">Visual model</p>
          <h2>{diagram.title}</h2>
          <p>{diagram.subtitle}</p>
        </div>
        <div className="protocol-mini-diagram__badge">
          <span>{stage.direction}</span>
          <strong>{stage.device.role}</strong>
        </div>
      </div>

      <div className="protocol-flow" aria-label="Mini protocol flow">
        {diagram.steps.map((step, index) => (
          <div key={step.id} className="protocol-flow__unit">
            <article className="protocol-step-card">
              <span className="protocol-step-card__index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{step.title}</h3>
              <strong>{step.subtitle}</strong>
              <p>{step.detail}</p>
            </article>
            {index < diagram.steps.length - 1 ? (
              <span className="protocol-flow__arrow">→</span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="protocol-learning-grid">
        <article>
          <strong>🧠 Mental model</strong>
          <p>{diagram.mentalModel}</p>
        </article>

        <article>
          <strong>✅ Key takeaways</strong>
          <ul>
            {diagram.keyTakeaways.map((takeaway) => (
              <li key={takeaway}>{takeaway}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="protocol-address-strip">
        <div className="protocol-address-strip__heading">📍 Address facts</div>
        <div className="protocol-address-strip__items">
          {diagram.addressFacts.map((fact) => (
            <span key={fact}>{fact}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
