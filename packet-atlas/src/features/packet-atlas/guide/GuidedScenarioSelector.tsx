import { useMemo, useState } from 'react'
import { buildGuidedScenarioPacks } from './guidedScenarioPackModel'
import {
  buildGuidedScenarioRuntime,
  buildGuidedScenarioRuntimeSteps,
  findGuidedScenarioPack,
} from './guidedScenarioRuntimeModel'

export function GuidedScenarioSelector() {
  const packs = useMemo(() => buildGuidedScenarioPacks(), [])
  const runtime = useMemo(() => buildGuidedScenarioRuntime(packs), [packs])
  const [selectedScenarioId, setSelectedScenarioId] = useState(runtime.defaultScenarioId)

  if (packs.length === 0) return null

  const selectedPack = findGuidedScenarioPack(packs, selectedScenarioId) ?? packs[0]
  const selectedCard =
    runtime.cards.find((card) => card.scenarioId === selectedPack.id) ?? runtime.cards[0]
  const steps = buildGuidedScenarioRuntimeSteps(selectedPack)

  return (
    <section className="guided-scenario-selector" aria-label="Guided scenario selector">
      <div className="guided-scenario-selector__header">
        <div>
          <span>Story path</span>
          <strong>Choose what this same journey should explain.</strong>
          <p>
            Start from a user-visible symptom, then follow the guided evidence path. This is a
            reading path, not a dashboard.
          </p>
        </div>
        <small>{selectedPack.mode === 'happy-path' ? 'happy path' : 'failure path'}</small>
      </div>

      <div className="guided-scenario-selector__cards" role="list">
        {runtime.cards.map((card) => (
          <button
            key={card.scenarioId}
            type="button"
            className={
              card.scenarioId === selectedPack.id
                ? 'guided-scenario-selector__card guided-scenario-selector__card--active'
                : 'guided-scenario-selector__card'
            }
            aria-pressed={card.scenarioId === selectedPack.id}
            onClick={() => setSelectedScenarioId(card.scenarioId)}
          >
            <span>{card.mode === 'happy-path' ? 'Normal path' : 'Failure path'}</span>
            <strong>{card.label}</strong>
            <small>{card.userSymptom}</small>
          </button>
        ))}
      </div>

      <div className="guided-scenario-selector__reader">
        <div className="guided-scenario-selector__question">
          <span>First question</span>
          <strong>{selectedCard.firstQuestion}</strong>
          <p>{selectedCard.nextReaderAction}</p>
        </div>

        <ol className="guided-scenario-selector__steps">
          {steps.map((step) => (
            <li key={`${step.scenarioId}-${step.stepNumber}`}>
              <span>
                Step {step.stepNumber}/{step.totalSteps}
              </span>
              <strong>{step.title}</strong>
              <p>{step.readThis}</p>
              <small>Evidence: {step.evidenceChecklist.join(', ')}</small>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
