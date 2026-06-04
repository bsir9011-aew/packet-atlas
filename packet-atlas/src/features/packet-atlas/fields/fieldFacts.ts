import type { JourneyStage, LayerLens } from '../schema/journeyScenarioSchema'

export type PacketFieldFact = {
  id: string
  name: string
  value: string
  lens: LayerLens
  visibleTo: string
  readBy: string
  changesAt?: string
  watchOut: string
}

function valueOrDash(value: unknown) {
  if (value === undefined || value === null || value === '') return '—'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'yes' : 'no'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function addField(
  fields: PacketFieldFact[],
  field: Omit<PacketFieldFact, 'id'>,
) {
  const idBase = `${field.lens}-${field.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  fields.push({
    id: `${idBase}-${fields.length + 1}`,
    ...field,
  })
}

function addAddressFields(fields: PacketFieldFact[], stage: JourneyStage) {
  const a = stage.addresses
  if (!a) return

  if (a.srcMac || a.dstMac) {
    addField(fields, {
      name: 'Source MAC',
      value: valueOrDash(a.srcMac),
      lens: 'link',
      visibleTo: 'Devices on the current local link',
      readBy: 'NICs and switches on this hop',
      watchOut: 'MAC addresses are local-hop facts, not Internet-wide identities.',
    })

    addField(fields, {
      name: 'Destination MAC',
      value: valueOrDash(a.dstMac),
      lens: 'link',
      visibleTo: 'Devices on the current local link',
      readBy: 'Switches and the receiving NIC',
      watchOut:
        'For remote Internet targets, this is usually the gateway MAC, not the server MAC.',
    })
  }

  if (a.srcIp || a.dstIp) {
    addField(fields, {
      name: 'Source IP',
      value: valueOrDash(a.srcIp),
      lens: 'network',
      visibleTo: 'Routers, firewalls and network observers on the path',
      readBy: 'IP forwarding logic and firewall rules',
      changesAt: a.natSrcIp ? 'May change at NAT boundary' : undefined,
      watchOut: 'A private source IP may not be what the public Internet sees.',
    })

    addField(fields, {
      name: 'Destination IP',
      value: valueOrDash(a.dstIp),
      lens: 'network',
      visibleTo: 'Routers and firewalls on the path',
      readBy: 'Routing tables and forwarding logic',
      watchOut: 'Routers forward toward IP destinations, not toward URLs.',
    })
  }

  if (a.srcPort || a.dstPort) {
    addField(fields, {
      name: 'Source port',
      value: valueOrDash(a.srcPort),
      lens: 'transport',
      visibleTo: 'Endpoints, NAT and stateful firewalls',
      readBy: 'Socket/flow tracking and NAT state',
      changesAt: a.natSrcPort ? 'May change at NAT/PAT' : undefined,
      watchOut: 'A port is a logical endpoint number, not a physical socket.',
    })

    addField(fields, {
      name: 'Destination port',
      value: valueOrDash(a.dstPort),
      lens: 'transport',
      visibleTo: 'Endpoints, firewalls and observers of packet metadata',
      readBy: 'Transport demultiplexing and firewall policy',
      watchOut: 'The destination port suggests the service, but does not prove the content.',
    })
  }

  if (a.natSrcIp || a.natSrcPort) {
    addField(fields, {
      name: 'NAT translated source',
      value: `${valueOrDash(a.natSrcIp)}:${valueOrDash(a.natSrcPort)}`,
      lens: 'network',
      visibleTo: 'The public side of the NAT boundary',
      readBy: 'NAT/PAT translation table',
      changesAt: 'Router / NAT / Firewall',
      watchOut:
        'NAT changes addressing metadata; it does not make the payload automatically private.',
    })
  }
}

function addRepresentationFields(fields: PacketFieldFact[], stage: JourneyStage) {
  const human = stage.representations.human
  const http = stage.representations.http
  const tls = stage.representations.tls
  const tcp = stage.representations.tcp
  const ip = stage.representations.ip
  const ethernet = stage.representations.ethernet
  const bits = stage.representations.bits ?? stage.representations.signal

  if (human) {
    addField(fields, {
      name: 'Human meaning',
      value: valueOrDash(human.label ?? human.intent ?? stage.copy.samePayloadHereLooksLike),
      lens: 'human',
      visibleTo: 'The user and the browser UI',
      readBy: 'Human interpretation, not packet forwarding devices',
      watchOut: 'Human meaning is not the same as packet metadata.',
    })
  }

  if (http) {
    const method = valueOrDash(http.method)
    const path = valueOrDash(http.path)
    const host = valueOrDash(http.host)
    const status = valueOrDash(http.status)
    const summary =
      method !== '—' || path !== '—' || host !== '—'
        ? `${method} ${path} Host=${host}`
        : status !== '—'
          ? `${status} ${valueOrDash(http.reason)} ${valueOrDash(http.contentType)}`
          : valueOrDash(http.label ?? http.notYet ?? http.receives ?? http.appAction ?? http.received)

    addField(fields, {
      name: 'Application meaning',
      value: summary,
      lens: 'application',
      visibleTo: 'Browser, reverse proxy and application endpoint',
      readBy: 'HTTP-aware software, not switches or raw cables',
      watchOut:
        'In HTTPS, this is readable at endpoints, but hidden from plain network observers.',
    })
  }

  if (tls) {
    addField(fields, {
      name: 'TLS wrapper',
      value: valueOrDash(tls.version ?? tls.purpose ?? tls.networkObserverSees),
      lens: 'tls',
      visibleTo: 'TLS endpoints and partial metadata observers',
      readBy: 'TLS stack at the client/proxy/server boundary',
      watchOut:
        'TLS protects application data, but metadata such as IPs, ports, sizes and timing can remain visible.',
    })

    if (tls.sniVisibility || tls.ech) {
      addField(fields, {
        name: 'ClientHello metadata',
        value: `ECH=${valueOrDash(tls.ech)}, SNI=${valueOrDash(tls.sniVisibility)}`,
        lens: 'tls',
        visibleTo: 'Depends on ECH and the TLS deployment',
        readBy: 'TLS-capable endpoint or observer of handshake metadata',
        watchOut: 'Do not assume every hostname is always visible or always hidden.',
      })
    }
  }

  if (tcp) {
    addField(fields, {
      name: 'Transport behavior',
      value: valueOrDash(tcp.sequence ?? tcp.meaning ?? tcp.protocol ?? tcp.stream ?? tcp.carriedOver),
      lens: 'transport',
      visibleTo: 'Endpoints, NAT and stateful firewalls',
      readBy: 'TCP/UDP stack and flow tracking devices',
      watchOut:
        'Transport explains ports and flow state; it does not understand HTML or page meaning.',
    })
  }

  if (ip) {
    addField(fields, {
      name: 'IP routing fact',
      value: valueOrDash(ip.dstIp ?? ip.answer ?? ip.beforeNat ?? ip.target ?? ip.protocol),
      lens: 'network',
      visibleTo: 'Routers and firewalls on the route',
      readBy: 'Routing/forwarding logic',
      watchOut: 'IP forwarding is about reachability, not user intent.',
    })
  }

  if (ethernet) {
    addField(fields, {
      name: 'Frame fact',
      value: valueOrDash(ethernet.carriedInside ?? ethernet.question ?? ethernet.etherType ?? ethernet.srcMac),
      lens: 'link',
      visibleTo: 'Current local link or hop',
      readBy: 'NICs and switches',
      watchOut: 'Frames are rebuilt hop by hop; they are not global Internet envelopes.',
    })
  }

  if (bits) {
    addField(fields, {
      name: 'Signal view',
      value: valueOrDash(bits.simplified ?? bits.label ?? bits.kind),
      lens: 'physical',
      visibleTo: 'The physical medium and PHY hardware',
      readBy: 'NIC/PHY hardware, not HTTP software',
      watchOut: 'Packet Atlas shows a simplified teaching view, not a PHY-grade analyzer trace.',
    })
  }
}

function addStageKindFields(fields: PacketFieldFact[], stage: JourneyStage) {
  if (stage.stageKind.includes('dns')) {
    addField(fields, {
      name: 'DNS question/answer',
      value: stage.stageKind.includes('response')
        ? 'Name resolved to an IP address in this scenario'
        : 'Ask resolver where the name points',
      lens: 'application',
      visibleTo: 'Client resolver and DNS resolver',
      readBy: 'DNS software and sometimes network/security tooling',
      watchOut: 'DNS tells where to connect; it does not fetch the website.',
    })
  }

  if (stage.stageKind.includes('arp')) {
    addField(fields, {
      name: 'ARP target',
      value: 'Find the MAC address for the local next hop',
      lens: 'link',
      visibleTo: 'Local broadcast domain',
      readBy: 'Hosts on the same LAN segment',
      watchOut: 'ARP is local. It does not discover the MAC of a remote Internet server.',
    })
  }

  if (stage.stageKind.includes('tcp')) {
    addField(fields, {
      name: 'TCP state',
      value: 'SYN → SYN/ACK → ACK establishes a reliable byte stream',
      lens: 'transport',
      visibleTo: 'TCP endpoints, NAT and stateful firewalls',
      readBy: 'TCP stacks and connection tracking',
      watchOut: 'The TCP handshake opens the conversation; it is not the HTTP request yet.',
    })
  }

  if (stage.stageKind.includes('tls')) {
    addField(fields, {
      name: 'Security boundary',
      value: 'Negotiate keys before sending protected application data',
      lens: 'tls',
      visibleTo: 'TLS endpoints and selected handshake metadata observers',
      readBy: 'TLS stack at browser/proxy/server boundary',
      watchOut: 'HTTPS = HTTP over TLS; TLS itself is not the web request.',
    })
  }

  if (stage.stageKind.includes('nat')) {
    addField(fields, {
      name: 'NAT mapping',
      value: 'Private inside address/port mapped to public outside address/port',
      lens: 'network',
      visibleTo: 'NAT device and devices after the NAT boundary',
      readBy: 'NAT/PAT translation table',
      watchOut: 'NAT can make logs confusing because inside and outside addresses differ.',
    })
  }
}

export function buildFieldFacts(stage: JourneyStage): PacketFieldFact[] {
  const fields: PacketFieldFact[] = []

  addRepresentationFields(fields, stage)
  addAddressFields(fields, stage)
  addStageKindFields(fields, stage)

  if (fields.length === 0) {
    addField(fields, {
      name: 'Stage meaning',
      value: stage.copy.samePayloadHereLooksLike,
      lens: stage.layerFocus[0] ?? 'human',
      visibleTo: stage.copy.whichLayerLooksAtIt,
      readBy: `${stage.device.role} perspective`,
      watchOut: stage.copy.easyToConfuse,
    })
  }

  return fields
}

export function summarizeFieldCoverage(stages: JourneyStage[]) {
  const coverage = new Map<LayerLens, number>()

  for (const stage of stages) {
    for (const fact of buildFieldFacts(stage)) {
      coverage.set(fact.lens, (coverage.get(fact.lens) ?? 0) + 1)
    }
  }

  return coverage
}
