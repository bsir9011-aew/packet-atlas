export type NeighborMode = 'ipv4-arp' | 'ipv6-nd'

export type NeighborStep = {
  id: string
  title: string
  actor: string
  detail: string
  visibleScope: string
}

export const neighborDiscoveryFlows: Record<NeighborMode, NeighborStep[]> = {
  'ipv4-arp': [
    {
      id: 'arp-question',
      title: 'ARP request',
      actor: 'Client host',
      detail: 'Who has 192.168.1.1? Tell 192.168.1.10.',
      visibleScope: 'Broadcast on the local IPv4 LAN segment.',
    },
    {
      id: 'arp-answer',
      title: 'ARP reply',
      actor: 'Default gateway',
      detail: '192.168.1.1 is at 02:00:00:00:01:01.',
      visibleScope: 'Local link-layer only.',
    },
    {
      id: 'ethernet-next-hop',
      title: 'Ethernet next hop',
      actor: 'Client NIC',
      detail: 'Remote IP traffic is wrapped into a frame addressed to the gateway MAC.',
      visibleScope: 'Switch and local gateway see the frame metadata.',
    },
  ],
  'ipv6-nd': [
    {
      id: 'neighbor-solicitation',
      title: 'Neighbor Solicitation',
      actor: 'IPv6 host',
      detail: 'Who owns this IPv6 next-hop address? This uses ICMPv6, not ARP.',
      visibleScope: 'Solicited-node multicast on the local IPv6 link.',
    },
    {
      id: 'neighbor-advertisement',
      title: 'Neighbor Advertisement',
      actor: 'IPv6 neighbor / router',
      detail: 'The neighbor replies with its link-layer address.',
      visibleScope: 'Local IPv6 link-layer context.',
    },
    {
      id: 'ipv6-frame',
      title: 'Frame toward next hop',
      actor: 'Client NIC',
      detail: 'IPv6 packet is delivered to the next-hop MAC learned through Neighbor Discovery.',
      visibleScope: 'Local link only; not the whole Internet path.',
    },
  ],
}

export function getNeighborFlow(mode: NeighborMode) {
  return neighborDiscoveryFlows[mode]
}

export function getNeighborModeSummary(mode: NeighborMode) {
  if (mode === 'ipv4-arp') {
    return {
      title: 'IPv4 uses ARP in this atlas path',
      warning: 'ARP is local only. The client learns the gateway MAC, not the remote server MAC.',
      keyDifference: 'Broadcast ARP question on the local LAN.',
    }
  }

  return {
    title: 'IPv6 uses Neighbor Discovery, not ARP',
    warning: 'Do not say “IPv6 ARP”. Neighbor Discovery is ICMPv6-based.',
    keyDifference: 'Solicited-node multicast and Neighbor Solicitation/Advertisement.',
  }
}
