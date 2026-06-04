import type {
  JourneyScenario,
  JourneyStage,
} from '../schema/journeyScenarioSchema'

type Props = {
  scenario: JourneyScenario
  activeStage: JourneyStage
}

export type LearningCheckpoint = {
  stageTitle: string
  oneSentence: string
  notebook: string[]
  selfQuestions: string[]
  troubleshootingCue: string
  socAngle: string
  commandPrompt: string
}

function hasAddressData(stage: JourneyStage) {
  return Boolean(
    stage.addresses?.srcIp ??
      stage.addresses?.dstIp ??
      stage.addresses?.srcPort ??
      stage.addresses?.dstPort ??
      stage.addresses?.srcMac ??
      stage.addresses?.dstMac,
  )
}

function stageKindHint(stage: JourneyStage) {
  if (stage.stageKind.includes('dns')) {
    return {
      notebook: [
        'DNS answers the question: name → address or other records.',
        'DNS is not the web request. It only helps find the next destination.',
      ],
      questions: [
        'What name is being resolved?',
        'Which resolver is being asked?',
        'Is this before or after the TCP connection to the website?',
      ],
      troubleshooting:
        'When a page does not load, first ask: did name resolution succeed?',
      soc:
        'DNS logs are often the first visible sign of where a host tried to go.',
      command:
        'Try later in Linux: dig example.com or resolvectl query example.com',
    }
  }

  if (stage.stageKind.includes('arp')) {
    return {
      notebook: [
        'ARP is local IPv4 neighbor discovery: IP on LAN → MAC address.',
        'For Internet destinations, the host usually ARPs for the gateway, not for the remote server.',
      ],
      questions: [
        'Is the destination local or behind the default gateway?',
        'Which MAC address is needed on this local hop?',
        'Would IPv6 use ARP here?',
      ],
      troubleshooting:
        'If ARP/gateway resolution fails, higher-layer protocols may never start.',
      soc:
        'ARP anomalies can point to local LAN issues or spoofing attempts.',
      command:
        'Try later in Linux: ip neigh, arp -a, ip route',
    }
  }

  if (stage.stageKind.includes('tcp')) {
    return {
      notebook: [
        'TCP creates a stateful byte stream using ports and sequence/ack logic.',
        'The handshake opens the conversation before application data is exchanged.',
      ],
      questions: [
        'Which port identifies the service?',
        'Is this connection setup or actual application data?',
        'What would a firewall need to remember here?',
      ],
      troubleshooting:
        'If SYN leaves but no SYN/ACK returns, suspect routing, firewalling or service availability.',
      soc:
        'TCP metadata helps distinguish scanning, failed connections and established sessions.',
      command:
        'Try later in Linux: ss -ntp, tcpdump -nn tcp port 443',
    }
  }

  if (stage.stageKind.includes('tls')) {
    return {
      notebook: [
        'TLS protects application data, but IPs, ports, timing and sizes still exist.',
        'HTTPS means HTTP carried through a TLS-protected channel.',
      ],
      questions: [
        'Is this before or after the HTTP request?',
        'What can a network observer still see?',
        'Where might TLS terminate?',
      ],
      troubleshooting:
        'TLS failures may be certificate, protocol, SNI, clock or middlebox problems.',
      soc:
        'TLS metadata can reveal connection context even when content is encrypted.',
      command:
        'Try later in Linux: openssl s_client -connect example.com:443 -servername example.com',
    }
  }

  if (stage.stageKind.includes('http')) {
    return {
      notebook: [
        'HTTP expresses application intent: method, path, host, status and content type.',
        'With HTTPS, HTTP content is readable at endpoints, not by a passive network observer.',
      ],
      questions: [
        'Is this a request or a response?',
        'Which endpoint can read the HTTP message?',
        'Is a proxy or load balancer involved?',
      ],
      troubleshooting:
        'HTTP status and headers tell you whether the application answered and how.',
      soc:
        'HTTP logs connect network events to user actions and application behavior.',
      command:
        'Try later in Linux: curl -I https://example.com',
    }
  }

  if (stage.stageKind.includes('nat')) {
    return {
      notebook: [
        'NAT/PAT changes private source address and often the source port.',
        'The outside world may see the router public IP, not the internal client IP.',
      ],
      questions: [
        'What was the source before NAT?',
        'What source does the Internet side see?',
        'How will return traffic be mapped back?',
      ],
      troubleshooting:
        'NAT state explains why return packets can reach the original internal client.',
      soc:
        'Investigations often require correlating internal IP, public IP, port and time window.',
      command:
        'Try later in Linux: conntrack -L, iptables/nft NAT rules',
    }
  }

  if (stage.stageKind.includes('ethernet')) {
    return {
      notebook: [
        'Ethernet moves frames across one local link or segment.',
        'MAC addresses are local-hop identifiers, not global Internet addresses.',
      ],
      questions: [
        'Which source MAC and destination MAC are used on this hop?',
        'Is the frame going to a gateway, switch or local host?',
        'What changes at the next routed hop?',
      ],
      troubleshooting:
        'Wrong VLAN, MAC learning or cabling issues can break traffic before IP logic helps.',
      soc:
        'Layer 2 visibility is local, but it can explain why packets never leave the LAN.',
      command:
        'Try later in Linux: ip link, bridge fdb show, tcpdump -e',
    }
  }

  if (stage.stageKind.includes('proxy')) {
    return {
      notebook: [
        'A reverse proxy is a front door for server-side infrastructure.',
        'It may terminate TLS and forward a new request to upstream applications.',
      ],
      questions: [
        'Does the proxy see decrypted HTTP here?',
        'Which upstream receives the request?',
        'Which logs would contain this step?',
      ],
      troubleshooting:
        'Proxy logs often reveal routing, TLS termination, WAF and upstream errors.',
      soc:
        'Reverse proxy telemetry is a strong bridge between external traffic and internal app behavior.',
      command:
        'Try later in Linux: inspect nginx/apache/caddy access and error logs',
    }
  }

  return {
    notebook: [
      'This stage is part of the same end-to-end request/response journey.',
      'Ask which layer currently gives meaning to the data.',
    ],
    questions: [
      'What changes in this step?',
      'Who can observe this step?',
      'What would be logged here?',
    ],
    troubleshooting:
      'Do not debug every layer at once. Locate the stage where the journey stops making progress.',
    soc:
      'SOC work is often about correlating the same event across different layers and logs.',
    command:
      'Try later: map this stage to one Linux command, one log source and one Wireshark view.',
  }
}

export function buildLearningCheckpoint(
  stage: JourneyStage,
  scenario: JourneyScenario,
): LearningCheckpoint {
  const hint = stageKindHint(stage)
  const addressNote = hasAddressData(stage)
    ? 'Write down which addresses or ports exist here and what they identify.'
    : 'Notice that no concrete packet addresses exist yet at this stage.'

  return {
    stageTitle: stage.shortName,
    oneSentence: `${stage.shortName}: ${stage.copy.samePayloadHereLooksLike}`,
    notebook: [
      `Stage ${scenario.stages.findIndex((item) => item.id === stage.id) + 1}/${scenario.stages.length}: ${stage.shortName}.`,
      stage.copy.whatReallyHappens,
      addressNote,
      ...hint.notebook,
    ],
    selfQuestions: hint.questions,
    troubleshootingCue: hint.troubleshooting,
    socAngle: hint.soc,
    commandPrompt: hint.command,
  }
}

export function ScenarioLearningPanel({ scenario, activeStage }: Props) {
  const checkpoint = buildLearningCheckpoint(activeStage, scenario)

  return (
    <section className="scenario-learning-panel">
      <div className="panel-heading">
        <span>Learning Checkpoint</span>
        <small>{activeStage.shortName}</small>
      </div>

      <div className="checkpoint-hero">
        <div>
          <p className="checkpoint-hero__eyebrow">Notebook mode</p>
          <h2>{checkpoint.stageTitle}</h2>
          <p>{checkpoint.oneSentence}</p>
        </div>
        <div className="checkpoint-badge">
          <strong>✍️</strong>
          <span>write this down</span>
        </div>
      </div>

      <div className="checkpoint-grid">
        <article className="checkpoint-card checkpoint-card--wide">
          <h3>📓 What to write in your notebook</h3>
          <ol>
            {checkpoint.notebook.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </article>

        <article className="checkpoint-card">
          <h3>🧠 Ask yourself</h3>
          <ul>
            {checkpoint.selfQuestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="checkpoint-card">
          <h3>🛠️ Troubleshooting cue</h3>
          <p>{checkpoint.troubleshootingCue}</p>
        </article>

        <article className="checkpoint-card">
          <h3>🛡️ SOC angle</h3>
          <p>{checkpoint.socAngle}</p>
        </article>

        <article className="checkpoint-card">
          <h3>⌨️ Command to connect later</h3>
          <p>{checkpoint.commandPrompt}</p>
        </article>
      </div>
    </section>
  )
}
