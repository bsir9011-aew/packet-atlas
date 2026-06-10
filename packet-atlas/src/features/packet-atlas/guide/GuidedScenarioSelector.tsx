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
  const [readerStepIndex, setReaderStepIndex] = useState(0)

  if (packs.length === 0) return null

  const selectedPack = findGuidedScenarioPack(packs, selectedScenarioId) ?? packs[0]
  const selectedCard =
    runtime.cards.find((card) => card.scenarioId === selectedPack.id) ?? runtime.cards[0]
  const steps = buildGuidedScenarioRuntimeSteps(selectedPack)
  const currentStep = steps[Math.min(readerStepIndex, Math.max(steps.length - 1, 0))]
  const isFirstStep = readerStepIndex <= 0
  const isLastStep = readerStepIndex >= steps.length - 1

  const selectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId)
    setReaderStepIndex(0)
  }

  return (
    <section className="guided-scenario-selector" aria-label="Guided scenario selector">
      <div className="guided-scenario-selector__header">
        <div>
          <span>Story path</span>
          <strong>Choose what this same journey should explain.</strong>
          <p>
            Start from a user-visible symptom, then follow one guided evidence step at a time.
            This is a reading path, not a dashboard.
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
            onClick={() => selectScenario(card.scenarioId)}
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

        {currentStep ? (
          <article className="guided-scenario-reader" aria-label="Guided scenario reader">
            <div className="guided-scenario-reader__topline">
              <span>
                Step {currentStep.stepNumber}/{currentStep.totalSteps}
              </span>
              <small>{selectedCard.label}</small>
            </div>

            <h3>{currentStep.title}</h3>
            <p className="guided-scenario-reader__read">{currentStep.readThis}</p>

            <div className="guided-scenario-reader__grid">
              <section>
                <span>Ask this</span>
                <p>{currentStep.askThis}</p>
              </section>

              <section>
                <span>Evidence checklist</span>
                <ul>
                  {currentStep.evidenceChecklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section>
                <span>Do not jump to</span>
                <p>{currentStep.doNotJumpTo}</p>
              </section>

              <section>
                <span>Notebook line</span>
                <p>{currentStep.notebookLine}</p>
              </section>
            </div>

            <footer className="guided-scenario-reader__actions">
              <button
                type="button"
                onClick={() => setReaderStepIndex((current) => Math.max(0, current - 1))}
                disabled={isFirstStep}
              >
                Previous
              </button>
              <strong>{currentStep.nextAction}</strong>
              <button
                type="button"
                onClick={() =>
                  setReaderStepIndex((current) => Math.min(steps.length - 1, current + 1))
                }
                disabled={isLastStep}
              >
                {isLastStep ? 'Done' : 'Next step'}
              </button>
            </footer>
          </article>
        ) : null}
      </div>
    </section>
  )
}
