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
import {
  getScenarioTranslation,
  getTextDisplayModeLabel,
  translateAtlasUi,
  translateScenarioText,
} from '../i18n/atlasI18n'
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
  const textDisplayMode = useAtlasStore((state) => state.textDisplayMode)
  const toggleLanguage = useAtlasStore((state) => state.toggleLanguage)
  const cycleTextDisplayMode = useAtlasStore((state) => state.cycleTextDisplayMode)
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
  const stageNameBilingual = getScenarioTranslation(language, stage.shortName, textDisplayMode)
  const narratorBilingual = getScenarioTranslation(language, narrator.line, textDisplayMode)
  const displayScenarioText = (text: string) =>
    getScenarioTranslation(language, text, textDisplayMode).primary
  const layerFocusSet = new Set<string>(stage.layerFocus)
  const layerLadderItems = [
    {
      id: 'human',
      label: 'Human lens',
      role: 'User intent and visible result',
      prompt: 'What does the user believe is happening?',
    },
    {
      id: 'application',
      label: 'Application lens',
      role: 'Browser, URL, HTTP, DNS and app meaning',
      prompt: 'What application meaning is being created or consumed?',
    },
    {
      id: 'tls',
      label: 'TLS lens',
      role: 'Security boundary and encrypted content',
      prompt: 'Is the content readable here or protected by encryption?',
    },
    {
      id: 'transport',
      label: 'Transport lens',
      role: 'Ports, streams, connections and reliability',
      prompt: 'Which ports and connection state identify this flow?',
    },
    {
      id: 'network',
      label: 'Network lens',
      role: 'IP addressing, routing, NAT and TTL',
      prompt: 'Which IP addresses and route decisions matter here?',
    },
    {
      id: 'link',
      label: 'Link lens',
      role: 'MAC-to-MAC delivery on one local hop',
      prompt: 'Which local MAC hop carries the frame right now?',
    },
    {
      id: 'physical',
      label: 'Physical lens',
      role: 'Bits, symbols and medium-dependent signals',
      prompt: 'What would this look like as bits or signals on the medium?',
    },
  ]

  const quickCheckpointCards = [
    {
      id: 'user-view',
      title: translateAtlasUi(language, 'play.quickUserView'),
      body: displayScenarioText(stage.copy.whatUserSees),
      prompt: displayScenarioText('Say the user-visible clue first.'),
    },
    {
      id: 'network-reality',
      title: translateAtlasUi(language, 'play.quickNetworkReality'),
      body: displayScenarioText(stage.copy.whatReallyHappens),
      prompt: displayScenarioText('Say what really changes in the network.'),
    },
    {
      id: 'layer-lens',
      title: translateAtlasUi(language, 'play.quickLayerLens'),
      body: displayScenarioText(stage.copy.whichLayerLooksAtIt),
      prompt: displayScenarioText('Name the layer that is most useful right now.'),
    },
    {
      id: 'trap',
      title: translateAtlasUi(language, 'play.quickTrap'),
      body: displayScenarioText(stage.copy.easyToConfuse),
      prompt: displayScenarioText('Name the trap that would mislead troubleshooting.'),
    },
    {
      id: 'why',
      title: translateAtlasUi(language, 'play.quickWhyItMatters'),
      body: displayScenarioText(stage.copy.whyItMatters),
      prompt: displayScenarioText('Explain why this boundary matters.'),
    },
    {
      id: 'analogy',
      title: translateAtlasUi(language, 'play.quickAnalogy'),
      body: displayScenarioText(stage.copy.analogy),
      prompt: displayScenarioText('Use the analogy to remember this stage.'),
    },
  ]

  const renderLearningText = (text: string) => {
    const translated = getScenarioTranslation(language, text, textDisplayMode)

    return (
      <>
        {translated.primary}
        {translated.secondary ? (
          <small className="play-mode-inline-source">
            <span>EN</span>
            {translated.secondary}
          </small>
        ) : null}
      </>
    )
  }

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

        <button
          type="button"
          className="play-mode-text-mode-toggle"
          onClick={cycleTextDisplayMode}
          aria-label="Cycle text display mode"
        >
          {getTextDisplayModeLabel(language, textDisplayMode)}
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
          {displayScenarioText(summary.stepLabel)} — {stageNameBilingual.primary}
        </h1>

        {stageNameBilingual.secondary ? (
          <p className="play-mode-bilingual-line">
            <span>EN source</span>
            {stageNameBilingual.secondary}
          </p>
        ) : null}

        <p>{narratorBilingual.primary}</p>

        {narratorBilingual.secondary ? (
          <p className="play-mode-bilingual-line play-mode-bilingual-line--soft">
            <span>EN narrator</span>
            {narratorBilingual.secondary}
          </p>
        ) : null}

        <div
          className="play-mode-progress"
          aria-label={`${translateAtlasUi(language, 'play.progress')} ${progress}%`}
        >
          <span style={{ width: `${progress}%` }} />
        </div>

        <small>
          {displayScenarioText(narrator.pausePrompt)}{' '}
          {displayScenarioText(narrator.handoff)}
        </small>
      </section>

      <PlayMotionLayer scenario={scenario} stage={stage} playing={playing} />

      <section
        className="play-mode-evidence-trail"
        aria-label={translateAtlasUi(language, 'play.evidenceTrail')}
      >
        <div className="play-mode-evidence-trail__header">
          <span>{translateAtlasUi(language, 'play.evidenceTrail')}</span>
          <strong>{translateAtlasUi(language, 'play.evidenceTrailPrompt')}</strong>
        </div>

        <div className="play-mode-evidence-trail__grid">
          <article>
            <span>{translateAtlasUi(language, 'play.evidenceSymptom')}</span>
            <p>{displayScenarioText('The user sees a simple waiting state, but the network has many possible checkpoints.')}</p>
          </article>
          <article>
            <span>{translateAtlasUi(language, 'play.evidenceSignal')}</span>
            <p>{displayScenarioText('The current stage should leave a trace in at least one layer-specific view.')}</p>
          </article>
          <article>
            <span>{translateAtlasUi(language, 'play.evidenceCommand')}</span>
            <p>{displayScenarioText('Use browser devtools, terminal commands or capture evidence depending on the layer.')}</p>
          </article>
          <article>
            <span>{translateAtlasUi(language, 'play.evidenceConclusion')}</span>
            <p>{displayScenarioText('Only claim what the evidence can support.')}</p>
          </article>
        </div>

        <div className="play-mode-evidence-trail__questions">
          <strong>{translateAtlasUi(language, 'play.evidenceOperatorRule')}</strong>
          <ul>
            <li>{displayScenarioText('Where did the journey last look correct?')}</li>
            <li>{displayScenarioText('Which layer changed the form of the payload?')}</li>
            <li>{displayScenarioText('Which observer would see this evidence?')}</li>
            <li>{displayScenarioText('What would be different if this stage failed?')}</li>
          </ul>
          <p>{displayScenarioText('Do not debug by vibe. Debug by narrowing the boundary.')}</p>
        </div>
      </section>

      <section
        className="play-mode-layer-ladder"
        aria-label={translateAtlasUi(language, 'play.layerLadder')}
      >
        <div className="play-mode-layer-ladder__header">
          <span>{translateAtlasUi(language, 'play.layerLadder')}</span>
          <strong>{translateAtlasUi(language, 'play.layerLadderPrompt')}</strong>
        </div>

        <div className="play-mode-layer-ladder__grid">
          {layerLadderItems.map((item) => {
            const active = layerFocusSet.has(item.id)

            return (
              <article
                key={item.id}
                data-active={active ? 'true' : 'false'}
              >
                <div>
                  <span>{displayScenarioText(item.label)}</span>
                  <small>
                    {active
                      ? translateAtlasUi(language, 'play.layerLadderActive')
                      : translateAtlasUi(language, 'play.layerLadderQuiet')}
                  </small>
                </div>
                <strong>{displayScenarioText(item.role)}</strong>
                <p>{displayScenarioText(item.prompt)}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section
        className="play-mode-memory-drill"
        aria-label={translateAtlasUi(language, 'play.memoryDrill')}
      >
        <div className="play-mode-memory-drill__header">
          <span>{translateAtlasUi(language, 'play.memoryDrill')}</span>
          <strong>{translateAtlasUi(language, 'play.memoryDrillPrompt')}</strong>
        </div>

        <div className="play-mode-memory-drill__grid">
          <article>
            <span>{translateAtlasUi(language, 'play.memoryQuestion')}</span>
            <p>{displayScenarioText('Which system is holding the packet now?')}</p>
          </article>
          <article>
            <span>{translateAtlasUi(language, 'play.memoryQuestion')}</span>
            <p>{displayScenarioText('What changed compared with the previous boundary?')}</p>
          </article>
          <article>
            <span>{translateAtlasUi(language, 'play.memoryCheck')}</span>
            <p>{displayScenarioText('What evidence would prove this stage happened?')}</p>
          </article>
          <article>
            <span>{translateAtlasUi(language, 'play.memoryCheck')}</span>
            <p>{displayScenarioText('What should you not confuse this with?')}</p>
          </article>
          <article>
            <span>{translateAtlasUi(language, 'play.memoryAnswer')}</span>
            <p>{displayScenarioText('Name the actor, the layer and the transformation.')}</p>
          </article>
          <article>
            <span>{translateAtlasUi(language, 'play.memoryMnemonic')}</span>
            <p>{displayScenarioText('One packet journey, many lenses.')}</p>
          </article>
        </div>

        <div className="play-mode-memory-drill__footer">
          <strong>{translateAtlasUi(language, 'play.memoryOperatorMove')}</strong>
          <p>{displayScenarioText('Say who owns the current boundary before naming protocols.')}</p>
        </div>
      </section>


      <section
        className="play-mode-quick-checkpoints"
        aria-label={translateAtlasUi(language, 'play.quickCheckpoint')}
      >
        <div className="play-mode-quick-checkpoints__header">
          <span>🧠 {translateAtlasUi(language, 'play.quickCheckpoint')}</span>
          <strong>{translateAtlasUi(language, 'play.quickCheckpointHint')}</strong>
        </div>

        <div className="play-mode-quick-checkpoints__grid">
          {quickCheckpointCards.map((card) => (
            <article key={card.id}>
              <span>{card.title}</span>
              <p>{card.body}</p>
              <small>✍️ {card.prompt}</small>
            </article>
          ))}
        </div>
      </section>


      <section
        className="play-mode-study-snapshot"
        aria-label={translateAtlasUi(language, 'play.studySnapshot')}
      >
        <div className="play-mode-study-snapshot__header">
          <span>🧠 {translateAtlasUi(language, 'play.studySnapshot')}</span>
          <strong>{translateAtlasUi(language, 'play.learningEvidence')}</strong>
        </div>

        <div className="play-mode-study-snapshot__grid">
          <article>
            <span>{translateAtlasUi(language, 'play.userView')}</span>
            <p>{renderLearningText(stage.copy.whatUserSees)}</p>
          </article>
          <article>
            <span>{translateAtlasUi(language, 'play.realProcess')}</span>
            <p>{renderLearningText(stage.copy.whatReallyHappens)}</p>
          </article>
          <article>
            <span>{translateAtlasUi(language, 'play.layerLens')}</span>
            <p>{renderLearningText(stage.copy.whichLayerLooksAtIt)}</p>
          </article>
          <article>
            <span>{translateAtlasUi(language, 'play.samePayload')}</span>
            <p>{renderLearningText(stage.copy.samePayloadHereLooksLike)}</p>
          </article>
          <article>
            <span>{translateAtlasUi(language, 'play.commonTrap')}</span>
            <p>{renderLearningText(stage.copy.easyToConfuse)}</p>
          </article>
          <article>
            <span>{translateAtlasUi(language, 'play.whyItMatters')}</span>
            <p>{renderLearningText(stage.copy.whyItMatters)}</p>
          </article>
          <article className="play-mode-study-snapshot__wide">
            <span>{translateAtlasUi(language, 'play.analogy')}</span>
            <p>{renderLearningText(stage.copy.analogy)}</p>
          </article>
        </div>
      </section>

      <section
        className="play-mode-story"
        aria-label={translateAtlasUi(language, 'play.currentStageStory')}
      >
        <span>{translateAtlasUi(language, 'play.currentStageStory')}</span>
        <p>{renderLearningText(storyScript.spokenLine)}</p>

        <div className="play-mode-story__grid">
          <article>
            <strong>{translateAtlasUi(language, 'play.mentalModel')}</strong>
            <p>{renderLearningText(storyScript.mentalModel)}</p>
          </article>
          <article>
            <strong>{translateAtlasUi(language, 'play.evidenceQuestion')}</strong>
            <p>{renderLearningText(storyScript.evidenceQuestion)}</p>
          </article>
          <article>
            <strong>{translateAtlasUi(language, 'play.doNotJumpTo')}</strong>
            <p>{renderLearningText(storyScript.avoidJumpingTo)}</p>
          </article>
          <article>
            <strong>{translateAtlasUi(language, 'play.handoff')}</strong>
            <p>{renderLearningText(storyScript.nextHandoff)}</p>
          </article>
        </div>
      </section>

      <section
        className="play-mode-coach"
        aria-label={translateAtlasUi(language, 'play.readStage')}
      >
        <div className="play-mode-coach__header">
          <span>{displayScenarioText(coach.phaseLabel)}</span>
          <strong>{translateAtlasUi(language, 'play.readStage')}</strong>
        </div>

        <div className="play-mode-coach__path">
          <article>
            <span>{translateAtlasUi(language, 'play.before')}</span>
            <strong>{displayScenarioText(coach.beforeLabel)}</strong>
          </article>
          <article data-current="true">
            <span>{translateAtlasUi(language, 'play.now')}</span>
            <strong>{displayScenarioText(coach.nowLabel)}</strong>
          </article>
          <article>
            <span>{translateAtlasUi(language, 'play.next')}</span>
            <strong>{displayScenarioText(coach.nextLabel)}</strong>
          </article>
        </div>

        <div className="play-mode-coach__grid">
          <article>
            <strong>{translateAtlasUi(language, 'play.saySimply')}</strong>
            <p>{renderLearningText(coach.plainEnglish)}</p>
          </article>
          <article>
            <strong>{translateAtlasUi(language, 'play.whatToDoNow')}</strong>
            <p>{renderLearningText(coach.whatToDoNow)}</p>
          </article>
          <article>
            <strong>{translateAtlasUi(language, 'play.proofQuestion')}</strong>
            <p>{renderLearningText(coach.proofQuestion)}</p>
          </article>
          <article>
            <strong>{translateAtlasUi(language, 'play.notebookLine')}</strong>
            <p>{renderLearningText(coach.notebookLine)}</p>
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
                <strong>{displayScenarioText(item.term)}</strong>
                <p>{displayScenarioText(item.simpleMeaning)}</p>
                <small>{displayScenarioText(item.doNotConfuseWith)}</small>
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
                  {displayScenarioText(choice.label)}
                </button>
              ))}
            </div>
          ) : null}

          {selectedBranch ? (
            <article className="play-mode-branch-preview">
              <div>
                <strong>{displayScenarioText(selectedBranch.title)}</strong>
                <button type="button" onClick={() => setSelectedBranchChoiceId(null)}>
                  {translateAtlasUi(language, 'play.clear')}
                </button>
              </div>
              <p>{renderLearningText(selectedBranch.whatChanges)}</p>
              <dl>
                <dt>{translateAtlasUi(language, 'play.userSees')}</dt>
                <dd>{renderLearningText(selectedBranch.userSees)}</dd>
                <dt>{translateAtlasUi(language, 'play.networkEvidence')}</dt>
                <dd>{renderLearningText(selectedBranch.networkEvidence)}</dd>
                <dt>{translateAtlasUi(language, 'play.nextDiagnosticStep')}</dt>
                <dd>
                  {renderLearningText(selectedBranch.nextDiagnosticStep)}
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
          <h2>{displayScenarioText(finalRecap.title)}</h2>
          <p>{renderLearningText(finalRecap.simpleStory)}</p>
          <ul>
            {finalRecap.checkpoints.map((checkpoint) => (
              <li key={checkpoint}>{renderLearningText(checkpoint)}</li>
            ))}
          </ul>
          <strong>{renderLearningText(finalRecap.notebookLine)}</strong>
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
