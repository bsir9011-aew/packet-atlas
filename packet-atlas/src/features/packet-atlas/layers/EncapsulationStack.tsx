import type { JourneyStage, LayerLens } from '../schema/journeyScenarioSchema'
import { useAtlasStore } from '../store/atlasStore'

type Props = {
  stage: JourneyStage
}

type StackItem = {
  key: string
  label: string
  lens: LayerLens
  hint: string
}

const stack: StackItem[] = [
  {
    key: 'human',
    label: 'Human intent',
    lens: 'human',
    hint: 'What the user thinks is happening',
  },
  {
    key: 'http',
    label: 'HTTP / application',
    lens: 'application',
    hint: 'Request, response and application semantics',
  },
  {
    key: 'tls',
    label: 'TLS protection',
    lens: 'tls',
    hint: 'Security wrapper around application data',
  },
  {
    key: 'tcp',
    label: 'TCP / UDP transport',
    lens: 'transport',
    hint: 'Ports, connection state and transport behavior',
  },
  {
    key: 'ip',
    label: 'IP packet',
    lens: 'network',
    hint: 'Source/destination IP and routing view',
  },
  {
    key: 'ethernet',
    label: 'Ethernet frame',
    lens: 'link',
    hint: 'Local MAC-to-MAC delivery',
  },
  {
    key: 'bits',
    label: 'Bits / signal',
    lens: 'physical',
    hint: 'Symbolic physical-medium view',
  },
]

function hasProjection(stage: JourneyStage, key: string) {
  if (key === 'human') return Boolean(stage.representations.human)
  if (key === 'http') return Boolean(stage.representations.http)
  if (key === 'tls') return Boolean(stage.representations.tls)
  if (key === 'tcp') return Boolean(stage.representations.tcp)
  if (key === 'ip') return Boolean(stage.representations.ip)
  if (key === 'ethernet') return Boolean(stage.representations.ethernet)
  return Boolean(stage.representations.bits ?? stage.representations.signal)
}

export function EncapsulationStack({ stage }: Props) {
  const selectedLayerLens = useAtlasStore((state) => state.selectedLayerLens)
  const setSelectedLayerLens = useAtlasStore((state) => state.setSelectedLayerLens)

  return (
    <section className="encapsulation-stack encapsulation-stack--v03">
      <div className="panel-heading">
        <span>Encapsulation Stack</span>
        <small>{stage.direction}</small>
      </div>

      <div className="stack-hint">
        <strong>📦 Same journey, different wrapping</strong>
        <p>
          Kliknij warstwę, żeby zsynchronizować ją z Packet Inspectorem. To nie
          są osobne procesy — to ta sama podróż danych oglądana inną lupą.
        </p>
      </div>

      <div className="stack-list">
        {stack.map((item) => {
          const hasData = hasProjection(stage, item.key)
          const selected = selectedLayerLens === item.lens

          return (
            <button
              key={item.key}
              type="button"
              className={[
                'stack-item',
                hasData ? 'stack-item--active' : '',
                selected ? 'stack-item--selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setSelectedLayerLens(item.lens)}
            >
              <span>
                <strong>{item.label}</strong>
                <small>{item.hint}</small>
              </span>
              <em>{hasData ? 'visible here' : 'not focused'}</em>
            </button>
          )
        })}
      </div>
    </section>
  )
}
