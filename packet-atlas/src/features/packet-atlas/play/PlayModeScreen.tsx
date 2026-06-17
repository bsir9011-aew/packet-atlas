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
import { translateAtlasUi, translateScenarioText } from '../i18n/atlasI18n'
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
  const language = useAtlasStore((state) => state.language)
  const toggleLanguage = useAtlasStore((state) => state.toggleLanguage)
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
    <main className="play-mode-screen" aria-label={translateAtlasUi(language, 'play.mode')}>
      <header className="play-mode-topbar">
        <div>
          <span>🎬 {translateAtlasUi(language, 'play.mode')}</span>
          <strong>{translateScenarioText(language, scenario.title)}</strong>
        </div>

        <button
          type="button"
          className="play-mode-language-toggle"
          onClick={toggleLanguage}
          aria-label={translateAtlasUi(language, 'language.toggle')}
        >
          {language === 'pl' ? 'PL / EN' : 'EN / PL'}
        </button>

        <button type="button" onClick={exitPlay}>
          {translateAtlasUi(language, 'play.exit')}
        </button>
      </header>

      <section className="play-mode-hero">
        <div className="play-mode-hero__meta">
          <span>
            {translateAtlasUi(language, 'play.step')} {index + 1}/
            {scenario.stages.length}
          </span>
          <strong>{progress}%</strong>
        </div>

        <h1>
          {translateScenarioText(language, summary.stepLabel)} —{' '}
          {translateScenarioText(language, stage.shortName)}
        </h1>

        <p>{translateScenarioText(language, narrator.line)}</p>

        <div
          className="play-mode-progress"
          aria-label={`${translateAtlasUi(language, 'play.progress')} ${progress}%`}
        >
          <span style={{ width: `${progress}%` }} />
        </div>

        <small>
          {translateScenarioText(language, narrator.pausePrompt)}{' '}
          {translateScenarioText(language, narrator.handoff)}
        </small>
      </section>

      <PlayMotionLayer scenario={scenario} stage={stage} playing={playing} />

      <section
        className="play-mode-story"
        aria-label={translateAtlasUi(language, 'play.currentStageStory')}
      >
        <span>{translateAtlasUi(language, 'play.currentStageStory')}</span>
        <p>{translateScenarioText(language, storyScript.spokenLine)}</p>

        <div className="play-mode-story__grid">
          <article>
            <strong>{translateAtlasUi(language, 'play.mentalModel')}</strong>
            <p>{translateScenarioText(language, storyScript.mentalModel)}</p>
          </article>
          <article>
            <strong>{translateAtlasUi(language, 'play.evidenceQuestion')}</strong>
            <p>{translateScenarioText(language, storyScript.evidenceQuestion)}</p>
          </article>
          <article>
            <strong>{translateAtlasUi(language, 'play.doNotJumpTo')}</strong>
            <p>{translateScenarioText(language, storyScript.avoidJumpingTo)}</p>
          </article>
          <article>
            <strong>{translateAtlasUi(language, 'play.handoff')}</strong>
            <p>{translateScenarioText(language, storyScript.nextHandoff)}</p>
          </article>
        </div>
      </section>

      <section
        className="play-mode-coach"
        aria-label={translateAtlasUi(language, 'play.readStage')}
      >
        <div className="play-mode-coach__header">
          <span>{translateScenarioText(language, coach.phaseLabel)}</span>
          <strong>{translateAtlasUi(language, 'play.readStage')}</strong>
        </div>

        <div className="play-mode-coach__path">
          <article>
            <span>{translateAtlasUi(language, 'play.before')}</span>
            <strong>{translateScenarioText(language, coach.beforeLabel)}</strong>
          </article>
          <article data-current="true">
            <span>{translateAtlasUi(language, 'play.now')}</span>
            <strong>{translateScenarioText(language, coach.nowLabel)}</strong>
          </article>
          <article>
            <span>{translateAtlasUi(language, 'play.next')}</span>
            <strong>{translateScenarioText(language, coach.nextLabel)}</strong>
          </article>
        </div>

        <div className="play-mode-coach__grid">
          <article>
            <strong>{translateAtlasUi(language, 'play.saySimply')}</strong>
            <p>{translateScenarioText(language, coach.plainEnglish)}</p>
          </article>
          <article>
            <strong>{translateAtlasUi(language, 'play.whatToDoNow')}</strong>
            <p>{translateScenarioText(language, coach.whatToDoNow)}</p>
          </article>
          <article>
            <strong>{translateAtlasUi(language, 'play.proofQuestion')}</strong>
            <p>{translateScenarioText(language, coach.proofQuestion)}</p>
          </article>
          <article>
            <strong>{translateAtlasUi(language, 'play.notebookLine')}</strong>
            <p>{translateScenarioText(language, coach.notebookLine)}</p>
          </article>
        </div>
      </section>

      {vocabulary.length > 0 ? (
        <section
          className="play-mode-vocabulary"
          aria-label={translateAtlasUi(language, 'play.vocabulary')}
        >
          <span>{translateAtlasUi(language, 'play.vocabulary')}</span>
          <div>
            {vocabulary.map((item) => (
              <article key={item.term}>
                <strong>{translateScenarioText(language, item.term)}</strong>
                <p>{translateScenarioText(language, item.simpleMeaning)}</p>
                <small>{translateScenarioText(language, item.doNotConfuseWith)}</small>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {summary.branchChoices.length > 0 || selectedBranch ? (
        <section
          className="play-mode-branches"
          aria-label={translateAtlasUi(language, 'play.optionalFork')}
        >
          <div className="play-mode-branches__header">
            <span>{translateAtlasUi(language, 'play.optionalFork')}</span>
            <strong>{translateAtlasUi(language, 'play.onlyInspect')}</strong>
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
                  {translateScenarioText(language, choice.label)}
                </button>
              ))}
            </div>
          ) : null}

          {selectedBranch ? (
            <article className="play-mode-branch-preview">
              <div>
                <strong>{translateScenarioText(language, selectedBranch.title)}</strong>
                <button type="button" onClick={() => setSelectedBranchChoiceId(null)}>
                  {translateAtlasUi(language, 'play.clear')}
                </button>
              </div>
              <p>{translateScenarioText(language, selectedBranch.whatChanges)}</p>
              <dl>
                <dt>{translateAtlasUi(language, 'play.userSees')}</dt>
                <dd>{translateScenarioText(language, selectedBranch.userSees)}</dd>
                <dt>{translateAtlasUi(language, 'play.networkEvidence')}</dt>
                <dd>{translateScenarioText(language, selectedBranch.networkEvidence)}</dd>
                <dt>{translateAtlasUi(language, 'play.nextDiagnosticStep')}</dt>
                <dd>
                  {translateScenarioText(language, selectedBranch.nextDiagnosticStep)}
                </dd>
              </dl>
            </article>
          ) : null}
        </section>
      ) : null}

      {isLast ? (
        <section
          className="play-mode-final"
          aria-label={translateAtlasUi(language, 'play.finalRecap')}
        >
          <span>{translateAtlasUi(language, 'play.finalRecap')}</span>
          <h2>{translateScenarioText(language, finalRecap.title)}</h2>
          <p>{translateScenarioText(language, finalRecap.simpleStory)}</p>
          <ul>
            {finalRecap.checkpoints.map((checkpoint) => (
              <li key={checkpoint}>{translateScenarioText(language, checkpoint)}</li>
            ))}
          </ul>
          <strong>{translateScenarioText(language, finalRecap.notebookLine)}</strong>
        </section>
      ) : null}

      <footer
        className="play-mode-controls"
        aria-label={translateAtlasUi(language, 'play.controls')}
      >
        <button
          type="button"
          onClick={() => resetAnimatedJourney(scenario.stages[0]?.id ?? stage.id)}
        >
          {translateAtlasUi(language, 'play.restart')}
        </button>

        <button
          type="button"
          disabled={isFirst}
          onClick={() => setSelectedStageId(previousStageId)}
        >
          {translateAtlasUi(language, 'play.previous')}
        </button>

        <button type="button" onClick={() => setPlaying(!playing)}>
          {playing
            ? translateAtlasUi(language, 'play.pauseAuto')
            : translateAtlasUi(language, 'play.autoPlay')}
        </button>

        <select
          value={speed}
          aria-label={translateAtlasUi(language, 'play.speed')}
          onChange={(event) => setSpeed(event.target.value as TraceSpeed)}
        >
          <option value="slow">{translateAtlasUi(language, 'play.slow')}</option>
          <option value="normal">{translateAtlasUi(language, 'play.normal')}</option>
          <option value="fast">{translateAtlasUi(language, 'play.fast')}</option>
        </select>

        <button
          type="button"
          className="play-mode-controls__next"
          disabled={isLast}
          onClick={() => setSelectedStageId(nextStageId)}
        >
          {isLast
            ? translateAtlasUi(language, 'play.complete')
            : translateScenarioText(language, coach.nextActionLabel)}
        </button>
      </footer>

      <nav
        className="play-mode-rail"
        aria-label={translateAtlasUi(language, 'play.stageRail')}
      >
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
              aria-label={`${translateAtlasUi(language, 'play.goToStage')} ${
                idx + 1
              }: ${translateScenarioText(language, item.shortName)}`}
              title={translateScenarioText(language, item.shortName)}
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
