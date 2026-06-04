export type AccessMediumMode = 'ethernet' | 'wifi'

export type AccessMediumStep = {
  id: string
  title: string
  layer: 'link' | 'physical' | 'device'
  detail: string
  visibleTo: string[]
}

export const accessMediumFlows: Record<AccessMediumMode, AccessMediumStep[]> = {
  ethernet: [
    {
      id: 'ethernet-nic',
      title: 'NIC builds Ethernet frame',
      layer: 'link',
      detail: 'The host wraps the IP packet into an Ethernet frame addressed to the next-hop MAC.',
      visibleTo: ['client NIC', 'switch', 'gateway'],
    },
    {
      id: 'ethernet-switch',
      title: 'Switch forwards by MAC table',
      layer: 'device',
      detail: 'The switch learns source MACs and forwards or floods frames inside the local segment/VLAN.',
      visibleTo: ['switch'],
    },
    {
      id: 'ethernet-signal',
      title: 'Electrical/optical signal',
      layer: 'physical',
      detail: 'The frame becomes medium-dependent symbols on copper or fiber. This is a simplified PHY view.',
      visibleTo: ['cable/fiber medium'],
    },
  ],
  wifi: [
    {
      id: 'wifi-client-radio',
      title: 'Client sends 802.11 frame',
      layer: 'link',
      detail: 'The wireless client sends a Wi-Fi frame toward the access point, not to an Ethernet switch port directly.',
      visibleTo: ['client radio', 'access point'],
    },
    {
      id: 'wifi-ap-bridge',
      title: 'Access point bridges traffic',
      layer: 'device',
      detail: 'The AP receives the 802.11 frame and bridges it into the distribution system or router side.',
      visibleTo: ['access point', 'wireless controller/router'],
    },
    {
      id: 'wifi-radio-medium',
      title: 'Shared radio medium',
      layer: 'physical',
      detail: 'The signal travels as radio energy over a shared medium. This is not the same as a private cable.',
      visibleTo: ['nearby radios', 'access point'],
    },
  ],
}

export function getAccessMediumFlow(mode: AccessMediumMode) {
  return accessMediumFlows[mode]
}

export function getAccessMediumSummary(mode: AccessMediumMode) {
  if (mode === 'ethernet') {
    return {
      title: 'Ethernet path: host → switch → gateway',
      trap: 'Do not treat a switch as if it understood HTTP or TLS content.',
      coreDifference: 'Local delivery is MAC-to-MAC through switch ports and VLAN/L2 behavior.',
    }
  }

  return {
    title: 'Wi-Fi path: client → AP → distribution system',
    trap: 'Wi-Fi is not just “Ethernet without a cable”. The access point and radio medium matter.',
    coreDifference: 'The AP is an observer/bridge point, and the physical medium is shared radio.',
  }
}
