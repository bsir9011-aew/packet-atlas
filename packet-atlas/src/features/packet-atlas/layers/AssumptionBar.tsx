import type { JourneyScenario } from '../schema/journeyScenarioSchema'

type Props = {
  scenario: JourneyScenario
}

function formatValue(value: unknown) {
  if (typeof value === 'boolean') return value ? 'on' : 'off'
  return String(value)
}

export function AssumptionBar({ scenario }: Props) {
  return (
    <section className="assumption-bar" aria-label="Scenario assumptions">
      <strong>Frozen scenario:</strong>
      {Object.entries(scenario.assumptions).map(([key, value]) => (
        <span key={key} className="assumption-pill">
          {key}: <b>{formatValue(value)}</b>
        </span>
      ))}
    </section>
  )
}
