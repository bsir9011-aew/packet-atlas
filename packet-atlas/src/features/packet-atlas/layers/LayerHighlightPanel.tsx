import type {
  JourneyScenario,
  LayerLens,
} from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'

type Props = {
  scenario: JourneyScenario
}

const layerCards: Array<{
  id: LayerLens
  icon: string
  label: string
  short: string
  principle: string
  trap: string
}> = [
  {
    id: 'human',
    icon: '👤',
    label: 'Human',
    short: 'visible user experience',
    principle: 'The user sees intent, waiting, errors and rendered content — not packets.',
    trap: 'Do not assume the user can see DNS, TCP, TLS or MAC-level facts.',
  },
  {
    id: 'application',
    icon: '🌐',
    label: 'Application / HTTP',
    short: 'URL, browser, request/response semantics',
    principle: 'This layer gives meaning: GET /, status 200, content type and app logic.',
    trap: 'Do not treat HTTP meaning as something a switch or raw cable understands.',
  },
  {
    id: 'tls',
    icon: '🔐',
    label: 'TLS',
    short: 'security wrapper around application data',
    principle: 'TLS protects HTTP data and changes what network observers can read.',
    trap: 'TLS is not HTTPS by itself; HTTPS is HTTP carried through TLS.',
  },
  {
    id: 'transport',
    icon: '🚚',
    label: 'Transport',
    short: 'ports, stream, connection state',
    principle: 'TCP/UDP decide how endpoint processes talk using ports and flows.',
    trap: 'A port is not a physical socket; it is a logical endpoint number.',
  },
  {
    id: 'network',
    icon: '🧭',
    label: 'Network / IP',
    short: 'source/destination IP, routing, NAT',
    principle: 'Routers care about IP destinations, next hops, TTL and often NAT state.',
    trap: 'Routers do not need the website body to forward packets.',
  },
  {
    id: 'link',
    icon: '🔌',
    label: 'Link',
    short: 'local frame delivery, MAC-to-MAC hop',
    principle: 'The link layer moves frames across one local segment or hop.',
    trap: 'Your host usually learns the MAC of the gateway, not the remote Internet server.',
  },
  {
    id: 'physical',
    icon: '〰️',
    label: 'Physical',
    short: 'bits and symbolic medium signal',
    principle: 'The physical layer turns frames into medium-dependent signals.',
    trap: 'This atlas shows a simplified signal view, not a PHY-grade analyzer trace.',
  },
]

export function LayerHighlightPanel({ scenario }: Props) {
  const selectedLayerLens = useAtlasStore((state) => state.selectedLayerLens)
  const setSelectedLayerLens = useAtlasStore((state) => state.setSelectedLayerLens)

  const activeCard =
    layerCards.find((card) => card.id === selectedLayerLens) ?? layerCards[0]
  const matchingStages = scenario.stages.filter((stage) =>
    stage.layerFocus.includes(selectedLayerLens),
  )
  const coveragePct = Math.round(
    (matchingStages.length / Math.max(1, scenario.stages.length)) * 100,
  )

  return (
    <section className="layer-highlight-panel" aria-label="Layer highlight mode">
      <div className="layer-highlight-panel__header">
        <div>
          <p>Layer Highlight Mode</p>
          <h2>
            {activeCard.icon} {activeCard.label}
          </h2>
        </div>
        <strong>
          {matchingStages.length}/{scenario.stages.length} stages · {coveragePct}%
        </strong>
      </div>

      <div className="layer-highlight-picker" aria-label="Select highlighted layer">
        {layerCards.map((card) => {
          const count = scenario.stages.filter((stage) =>
            stage.layerFocus.includes(card.id),
          ).length

          return (
            <button
              key={card.id}
              type="button"
              className={
                card.id === selectedLayerLens
                  ? 'layer-highlight-chip layer-highlight-chip--active'
                  : 'layer-highlight-chip'
              }
              onClick={() => setSelectedLayerLens(card.id)}
              title={`${card.label}: ${card.short}`}
            >
              <span>{card.icon}</span>
              <b>{card.label}</b>
              <small>{count}</small>
            </button>
          )
        })}
      </div>

      <div className="layer-highlight-explainer">
        <article>
          <strong>🧠 What this lens means</strong>
          <p>{activeCard.principle}</p>
        </article>
        <article>
          <strong>⚠️ Common trap</strong>
          <p>{activeCard.trap}</p>
        </article>
      </div>

      <div className="layer-highlight-stages">
        <strong>Visible in this lens:</strong>
        <div>
          {matchingStages.map((stage) => (
            <span key={stage.id}>{stage.shortName}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
