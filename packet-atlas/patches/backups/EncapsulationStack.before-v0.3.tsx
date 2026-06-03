import type { JourneyStage } from '../schema/journeyScenarioSchema'

type Props = {
  stage: JourneyStage
}

const stack = [
  { key: 'human', label: 'Human intent' },
  { key: 'http', label: 'HTTP / application' },
  { key: 'tls', label: 'TLS protection' },
  { key: 'tcp', label: 'TCP / UDP transport' },
  { key: 'ip', label: 'IP packet' },
  { key: 'ethernet', label: 'Ethernet frame' },
  { key: 'bits', label: 'Bits / signal' },
]

export function EncapsulationStack({ stage }: Props) {
  return (
    <section className="encapsulation-stack">
      <div className="panel-heading">
        <span>Encapsulation Stack</span>
        <small>{stage.direction}</small>
      </div>

      <div className="stack-list">
        {stack.map((item) => {
          const hasData =
            item.key === 'human'
              ? Boolean(stage.representations.human)
              : item.key === 'http'
                ? Boolean(stage.representations.http)
                : item.key === 'tls'
                  ? Boolean(stage.representations.tls)
                  : item.key === 'tcp'
                    ? Boolean(stage.representations.tcp)
                    : item.key === 'ip'
                      ? Boolean(stage.representations.ip)
                      : item.key === 'ethernet'
                        ? Boolean(stage.representations.ethernet)
                        : Boolean(
                            stage.representations.bits ??
                              stage.representations.signal,
                          )

          return (
            <div
              key={item.key}
              className={
                hasData ? 'stack-item stack-item--active' : 'stack-item'
              }
            >
              <span>{item.label}</span>
              <small>{hasData ? 'visible in this stage' : 'not focused'}</small>
            </div>
          )
        })}
      </div>
    </section>
  )
}
