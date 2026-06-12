import { useEffect, useMemo } from 'react'
import { AtlasLiveRegion } from '../accessibility/AtlasLiveRegion'
import {
  buildAnimatedJourneyStepSummary,
  getNextStageId,
  getPreviousStageId,
  getStageIndex,
  getTraceProgress,
  traceSpeedMs,
  type TraceSpeed,
} from '../cinematic/cinematicTraceModel'
import { buildGuidedFinalRecap } from '../guide/guidedFinalRecapModel'
import { buildGuidedNarratorLine } from '../guide/guidedNarratorModel'
import { buildGuidedStepCoach } from '../guide/guidedStepCoachModel'
import { buildGuidedStoryScript } from '../guide/guidedStoryScriptModel'
import { buildGuidedVocabulary } from '../guide/guidedVocabularyModel'
import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'
import { PlayMotionLayer } from './PlayMotionLayer'

type Props = {
  scenario: JourneyScenario
  stage: JourneyStage
}

export function PlayModeScreen({ scenario, stage }: Props) {
  const playing = useAtlasStore((state) => state.animatedJourneyPlaying)
  const speed = useAtlasStore((state) => state.animatedJourneySpeed)
  const visitedStageIds = useAtlasStore((state) => state.visitedStageIds)
  const selectedBranchChoiceId = useAtlasStore((state) => state.selectedBranchChoiceId)
  const setSelectedStageId = useAtlasStore((state) => state.setSelectedStageId)
  const setPlaying = useAtlasStore((state) => state.setAnimatedJourneyPlaying)
  const setSpeed = useAtlasStore((state) => state.setAnimatedJourneySpeed)
  const setSelectedBranchChoiceId = useAtlasStore(
    (state) => state.setSelectedBranchChoiceId,
  )
  const setPresentationMode = useAtlasStore((state) => state.setPresentationMode)
  const resetAnimatedJourney = useAtlasStore((state) => state.resetAnimatedJourney)

  const index = useMemo(() => getStageIndex(scenario, stage.id), [scenario, stage.id])
  const progress = getTraceProgress(scenario, stage.id)
  const summary = buildAnimatedJourneyStepSummary(scenario, stage)
  const coach = buildGuidedStepCoach(scenario, stage, summary)
  const storyScript = buildGuidedStoryScript(scenario, stage, summary)
  const vocabulary = buildGuidedVocabulary(stage)
  const narrator = buildGuidedNarratorLine(scenario, stage, summary)
  const finalRecap = buildGuidedFinalRecap(scenario)
  const previousStageId = getPreviousStageId(scenario, stage.id)
  const nextStageId = getNextStageId(scenario, stage.id)
  const isFirst = previousStageId === stage.id
  const isLast = nextStageId === stage.id
  const selectedBranch =
    summary.branchChoices.find((choice) => choice.id === selectedBranchChoiceId) ??
    null

  useEffect(() => {
    if (!playing) return

    const timer = window.setInterval(() => {
      const next = getNextStageId(scenario, stage.id)
      if (next === stage.id) {
        setPlaying(false)
        return
      }

      setSelectedStageId(next)
    }, traceSpeedMs[speed])

    return () => window.clearInterval(timer)
  }, [playing, scenario, stage.id, speed, setPlaying, setSelectedStageId])

  const exitPlay = () => {
    setPlaying(false)
    setPresentationMode('atlas')
  }

  return (
    <main className="play-mode-screen" aria-label="Packet Atlas Play Mode">
      <header className="play-mode-topbar">
        <div>
          <span>🎬 Play Mode</span>
          <strong>{scenario.title}</strong>
        </div>

        <button type="button" onClick={exitPlay}>
          Exit Play
        </button>
      </header>

      <section className="play-mode-hero">
        <div className="play-mode-hero__meta">
          <span>
            Step {index + 1}/{scenario.stages.length}
          </span>
          <strong>{progress}%</strong>
        </div>

        <h1>
          {summary.stepLabel} — {stage.shortName}
        </h1>

        <p>{narrator.line}</p>

        <div className="play-mode-progress" aria-label={`Play progress ${progress}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>

        <small>{narrator.pausePrompt} {narrator.handoff}</small>
      </section>

      <PlayMotionLayer scenario={scenario} stage={stage} playing={playing} />

      <section className="play-mode-story" aria-label="Current stage story">
        <span>Current stage story</span>
        <p>{storyScript.spokenLine}</p>

        <div className="play-mode-story__grid">
          <article>
            <strong>Mental model</strong>
            <p>{storyScript.mentalModel}</p>
          </article>
          <article>
            <strong>Evidence question</strong>
            <p>{storyScript.evidenceQuestion}</p>
          </article>
          <article>
            <strong>Do not jump to</strong>
            <p>{storyScript.avoidJumpingTo}</p>
          </article>
          <article>
            <strong>Handoff</strong>
            <p>{storyScript.nextHandoff}</p>
          </article>
        </div>
      </section>

      <section className="play-mode-coach" aria-label="Play step coach">
        <div className="play-mode-coach__header">
          <span>{coach.phaseLabel}</span>
          <strong>Read this stage. Say it simply. Then press Next.</strong>
        </div>

        <div className="play-mode-coach__path">
          <article>
            <span>Before</span>
            <strong>{coach.beforeLabel}</strong>
          </article>
          <article data-current="true">
            <span>Now</span>
            <strong>{coach.nowLabel}</strong>
          </article>
          <article>
            <span>Next</span>
            <strong>{coach.nextLabel}</strong>
          </article>
        </div>

        <div className="play-mode-coach__grid">
          <article>
            <strong>Say it simply</strong>
            <p>{coach.plainEnglish}</p>
          </article>
          <article>
            <strong>What to do now</strong>
            <p>{coach.whatToDoNow}</p>
          </article>
          <article>
            <strong>Proof question</strong>
            <p>{coach.proofQuestion}</p>
          </article>
          <article>
            <strong>Notebook line</strong>
            <p>{coach.notebookLine}</p>
          </article>
        </div>
      </section>

      {vocabulary.length > 0 ? (
        <section className="play-mode-vocabulary" aria-label="Vocabulary for this stage">
          <span>Vocabulary</span>
          <div>
            {vocabulary.map((item) => (
              <article key={item.term}>
                <strong>{item.term}</strong>
                <p>{item.simpleMeaning}</p>
                <small>{item.doNotConfuseWith}</small>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {summary.branchChoices.length > 0 || selectedBranch ? (
        <section className="play-mode-branches" aria-label="Failure branches">
          <div className="play-mode-branches__header">
            <span>Optional diagnostic fork</span>
            <strong>Only inspect this if the current stage is clear.</strong>
          </div>

          {summary.branchChoices.length > 0 ? (
            <div className="play-mode-branches__choices">
              {summary.branchChoices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => setSelectedBranchChoiceId(choice.id)}
                  data-active={choice.id === selectedBranchChoiceId}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          ) : null}

          {selectedBranch ? (
            <article className="play-mode-branch-preview">
              <div>
                <strong>{selectedBranch.title}</strong>
                <button type="button" onClick={() => setSelectedBranchChoiceId(null)}>
                  Clear
                </button>
              </div>
              <p>{selectedBranch.whatChanges}</p>
              <dl>
                <dt>User sees</dt>
                <dd>{selectedBranch.userSees}</dd>
                <dt>Network evidence</dt>
                <dd>{selectedBranch.networkEvidence}</dd>
                <dt>Next diagnostic step</dt>
                <dd>{selectedBranch.nextDiagnosticStep}</dd>
              </dl>
            </article>
          ) : null}
        </section>
      ) : null}

      {isLast ? (
        <section className="play-mode-final" aria-label="Final recap">
          <span>Final recap</span>
          <h2>{finalRecap.title}</h2>
          <p>{finalRecap.simpleStory}</p>
          <ul>
            {finalRecap.checkpoints.map((checkpoint) => (
              <li key={checkpoint}>{checkpoint}</li>
            ))}
          </ul>
          <strong>{finalRecap.notebookLine}</strong>
        </section>
      ) : null}

      <footer className="play-mode-controls" aria-label="Play controls">
        <button
          type="button"
          onClick={() => resetAnimatedJourney(scenario.stages[0]?.id ?? stage.id)}
        >
          Restart
        </button>

        <button
          type="button"
          disabled={isFirst}
          onClick={() => setSelectedStageId(previousStageId)}
        >
          Previous
        </button>

        <button type="button" onClick={() => setPlaying(!playing)}>
          {playing ? 'Pause auto' : 'Auto-play'}
        </button>

        <select
          value={speed}
          aria-label="Animated journey speed"
          onChange={(event) => setSpeed(event.target.value as TraceSpeed)}
        >
          <option value="slow">slow</option>
          <option value="normal">normal</option>
          <option value="fast">fast</option>
        </select>

        <button
          type="button"
          className="play-mode-controls__next"
          disabled={isLast}
          onClick={() => setSelectedStageId(nextStageId)}
        >
          {isLast ? 'Journey complete' : coach.nextActionLabel}
        </button>
      </footer>

      <nav className="play-mode-rail" aria-label="Play stage rail">
        {scenario.stages.map((item, idx) => {
          const visited = visitedStageIds.includes(item.id)
          const active = item.id === stage.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedStageId(item.id)}
              data-active={active}
              data-visited={visited}
              aria-label={`Go to stage ${idx + 1}: ${item.shortName}`}
              title={item.shortName}
            >
              {idx + 1}
            </button>
          )
        })}
      </nav>

      <AtlasLiveRegion stage={stage} />
    </main>
  )
}
