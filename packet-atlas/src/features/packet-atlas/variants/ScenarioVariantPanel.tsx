import type { JourneyScenario } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { getScenarioVariant, scenarioVariants } from './scenarioVariants'

type Props = {
  scenario: JourneyScenario
}

const severityIcon = {
  normal: '✅',
  warning: '⚠️',
  broken: '🧯',
}

export function ScenarioVariantPanel({ scenario }: Props) {
  const selectedVariantId = useAtlasStore((state) => state.selectedVariantId)
  const setSelectedVariantId = useAtlasStore(
    (state) => state.setSelectedVariantId,
  )
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)

  const activeVariant = getScenarioVariant(selectedVariantId)
  const affectedStages = scenario.stages.filter((stage) =>
    activeVariant.affectedStageIds.includes(stage.id),
  )

  return (
    <section className={`scenario-variant-panel scenario-variant-panel--${activeVariant.severity}`}>
      <div className="variant-panel__topline">
        <div>
          <p className="variant-panel__eyebrow">Scenario variant</p>
          <h2>
            <span>{severityIcon[activeVariant.severity]}</span>{' '}
            {activeVariant.title}
          </h2>
        </div>
        <div className="variant-panel__badge">{activeVariant.shortLabel}</div>
      </div>

      <div className="variant-switcher" aria-label="Scenario variant selector">
        {scenarioVariants.map((variant) => (
          <button
            key={variant.id}
            className={
              variant.id === activeVariant.id
                ? 'variant-chip variant-chip--active'
                : `variant-chip variant-chip--${variant.severity}`
            }
            onClick={() => setSelectedVariantId(variant.id)}
          >
            <span>{severityIcon[variant.severity]}</span>
            {variant.shortLabel}
          </button>
        ))}
      </div>

      <div className="variant-panel__grid">
        <article>
          <strong>🧭 What changes?</strong>
          <p>{activeVariant.description}</p>
        </article>
        <article>
          <strong>👁️ User symptom</strong>
          <p>{activeVariant.userVisibleEffect}</p>
        </article>
        <article>
          <strong>📡 Network observable</strong>
          <p>{activeVariant.networkObservable}</p>
        </article>
        <article>
          <strong>🧪 Diagnostic angle</strong>
          <p>{activeVariant.diagnosticAngle}</p>
        </article>
      </div>

      {affectedStages.length > 0 ? (
        <div className="variant-affected-stages">
          <strong>Affected stages:</strong>
          <div>
            {affectedStages.map((stage) => (
              <button key={stage.id} onClick={() => setSelectedStageId(stage.id)}>
                {stage.shortName}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="variant-affected-stages variant-affected-stages--empty">
          <strong>Reference trace:</strong>
          <span>No failed stage. This is the baseline path for comparison.</span>
        </div>
      )}
    </section>
  )
}
