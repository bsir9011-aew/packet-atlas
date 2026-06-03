import type { JourneyScenario, JourneyStage } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'

type Props = {
  scenario: JourneyScenario
  stage: JourneyStage
}

type WrapperLevel = {
  key: string
  title: string
  emoji: string
  description: string
  active: boolean
}

const lensNames = {
  human: 'Human',
  application: 'Application / HTTP',
  tls: 'TLS',
  transport: 'Transport',
  network: 'Network / IP',
  link: 'Link',
  physical: 'Physical',
} as const

function getWrapperLevels(stage: JourneyStage): WrapperLevel[] {
  const representations = stage.representations

  return [
    {
      key: 'human',
      emoji: '👤',
      title: 'Human intent',
      description: 'What the user thinks is happening.',
      active: Boolean(representations.human),
    },
    {
      key: 'http',
      emoji: '🌐',
      title: 'Application meaning',
      description: 'Request, response, page, app logic or DNS question.',
      active: Boolean(representations.http),
    },
    {
      key: 'tls',
      emoji: '🔐',
      title: 'Security wrapper',
      description: 'TLS negotiation or encrypted application data.',
      active: Boolean(representations.tls),
    },
    {
      key: 'tcp',
      emoji: '🚚',
      title: 'Transport wrapper',
      description: 'Ports, flow identity, connection state and stream behavior.',
      active: Boolean(representations.tcp),
    },
    {
      key: 'ip',
      emoji: '🧭',
      title: 'Network wrapper',
      description: 'Source/destination IP, routing, TTL and NAT view.',
      active: Boolean(representations.ip),
    },
    {
      key: 'ethernet',
      emoji: '🔌',
      title: 'Local delivery wrapper',
      description: 'MAC-to-MAC delivery on a local hop or segment.',
      active: Boolean(representations.ethernet),
    },
    {
      key: 'bits',
      emoji: '〰️',
      title: 'Signal view',
      description: 'A simplified view of bits or medium-dependent signaling.',
      active: Boolean(representations.bits ?? representations.signal),
    },
  ]
}

function getAddressStory(stage: JourneyStage) {
  const addresses = stage.addresses

  if (!addresses) {
    return [
      'This stage has no concrete packet addresses yet.',
      'That usually means you are still above the network stack or inside application logic.',
    ]
  }

  const lines: string[] = []

  if (addresses.srcIp || addresses.dstIp) {
    lines.push(
      `IP view: ${addresses.srcIp ?? '—'} → ${addresses.dstIp ?? '—'}`,
    )
  }

  if (addresses.srcPort || addresses.dstPort) {
    lines.push(
      `Transport view: port ${addresses.srcPort ?? '—'} → ${addresses.dstPort ?? '—'}`,
    )
  }

  if (addresses.srcMac || addresses.dstMac) {
    lines.push(
      `Link view: ${addresses.srcMac ?? '—'} → ${addresses.dstMac ?? '—'}`,
    )
  }

  if (addresses.natSrcIp || addresses.natSrcPort) {
    lines.push(
      `After NAT: ${addresses.natSrcIp ?? '—'}:${addresses.natSrcPort ?? '—'}`,
    )
  }

  return lines.length > 0 ? lines : ['No concrete address fields for this step.']
}

function getNeighborLabels(scenario: JourneyScenario, stage: JourneyStage) {
  const byId = new Map(scenario.stages.map((item) => [item.id, item.shortName]))

  const previous = stage.relations.previousIds.map((id) => byId.get(id) ?? id)
  const next = stage.relations.nextIds.map((id) => byId.get(id) ?? id)

  return { previous, next }
}

function MiniFlowDiagram({
  previous,
  current,
  next,
}: {
  previous: string[]
  current: string
  next: string[]
}) {
  const before = previous.length > 0 ? previous.join(' / ') : 'Start'
  const after = next.length > 0 ? next.join(' / ') : 'End'

  return (
    <div className="mini-flow-diagram" aria-label="Mini stage flow">
      <div className="mini-flow-node mini-flow-node--muted">
        <span>Before</span>
        <strong>{before}</strong>
      </div>
      <div className="mini-flow-arrow">→</div>
      <div className="mini-flow-node mini-flow-node--active">
        <span>Now</span>
        <strong>{current}</strong>
      </div>
      <div className="mini-flow-arrow">→</div>
      <div className="mini-flow-node mini-flow-node--muted">
        <span>Next</span>
        <strong>{after}</strong>
      </div>
    </div>
  )
}

export function StageDeepDiveCards({ scenario, stage }: Props) {
  const selectedLayerLens = useAtlasStore((state) => state.selectedLayerLens)
  const setSelectedLayerLens = useAtlasStore((state) => state.setSelectedLayerLens)

  const deviceNode = scenario.topology.nodes.find(
    (node) => node.id === stage.device.nodeId,
  )
  const wrapperLevels = getWrapperLevels(stage)
  const addressStory = getAddressStory(stage)
  const { previous, next } = getNeighborLabels(scenario, stage)
  const isVisibleInLens = stage.layerFocus.includes(selectedLayerLens)

  return (
    <section className="stage-deep-dive">
      <div className="panel-heading">
        <span>Stage Deep Dive</span>
        <small>{stage.shortName}</small>
      </div>

      <div className="deep-dive-hero">
        <div>
          <p className="deep-dive-eyebrow">Learning focus</p>
          <h2>{stage.shortName}</h2>
          <p>{stage.copy.whatReallyHappens}</p>
        </div>
        <div
          className={
            isVisibleInLens
              ? 'lens-fit-badge lens-fit-badge--ok'
              : 'lens-fit-badge lens-fit-badge--warn'
          }
        >
          <span>{isVisibleInLens ? 'visible' : 'outside lens'}</span>
          <strong>{lensNames[selectedLayerLens]}</strong>
        </div>
      </div>

      {!isVisibleInLens && (
        <div className="deep-dive-warning">
          <strong>⚠️ Current stage is outside the active lens.</strong>
          <p>
            This is useful: it shows that not every layer understands every part
            of the journey. The active lens highlights where this layer actually
            participates.
          </p>
        </div>
      )}

      <MiniFlowDiagram
        previous={previous}
        current={stage.shortName}
        next={next}
      />

      <div className="deep-dive-grid">
        <article className="deep-card deep-card--primary">
          <strong>🧠 What is happening?</strong>
          <p>{stage.copy.whatReallyHappens}</p>
        </article>

        <article className="deep-card">
          <strong>👁️ What does the user see?</strong>
          <p>{stage.copy.whatUserSees}</p>
        </article>

        <article className="deep-card">
          <strong>🛰️ Who is looking?</strong>
          <p>
            {deviceNode?.label ?? stage.device.nodeId} watches this as a{' '}
            <b>{stage.device.role}</b> stage.
          </p>
        </article>

        <article className="deep-card">
          <strong>🧩 Same payload here</strong>
          <p>{stage.copy.samePayloadHereLooksLike}</p>
        </article>

        <article className="deep-card">
          <strong>⚠️ Easy trap</strong>
          <p>{stage.copy.easyToConfuse}</p>
        </article>

        <article className="deep-card">
          <strong>🎯 Why it matters</strong>
          <p>{stage.copy.whyItMatters}</p>
        </article>
      </div>

      <div className="wrapper-section">
        <div className="wrapper-section__heading">
          <strong>📦 Wrapping view</strong>
          <span>same journey, different layer wrappers</span>
        </div>

        <div className="wrapper-rail">
          {wrapperLevels.map((level) => (
            <button
              key={level.key}
              type="button"
              className={
                level.active
                  ? 'wrapper-step wrapper-step--active'
                  : 'wrapper-step'
              }
              onClick={() => {
                if (level.key === 'human') setSelectedLayerLens('human')
                if (level.key === 'http') setSelectedLayerLens('application')
                if (level.key === 'tls') setSelectedLayerLens('tls')
                if (level.key === 'tcp') setSelectedLayerLens('transport')
                if (level.key === 'ip') setSelectedLayerLens('network')
                if (level.key === 'ethernet') setSelectedLayerLens('link')
                if (level.key === 'bits') setSelectedLayerLens('physical')
              }}
            >
              <span>{level.emoji}</span>
              <strong>{level.title}</strong>
              <small>{level.description}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="address-story">
        <div className="address-story__heading">📍 Address story</div>
        <ul>
          {addressStory.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="deep-analogy">
        <strong>🖼️ Memory image</strong>
        <p>{stage.copy.analogy}</p>
      </div>
    </section>
  )
}
