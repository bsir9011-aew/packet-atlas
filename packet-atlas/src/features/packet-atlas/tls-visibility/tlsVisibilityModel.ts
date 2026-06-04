export type TlsVisibilityMode = 'plain-http' | 'tls13-no-ech' | 'tls13-ech-preview'

export type TlsVisibilityFact = {
  id: string
  label: string
  visible: boolean
  explanation: string
}

export const tlsVisibilityModes: Record<TlsVisibilityMode, { title: string; summary: string; facts: TlsVisibilityFact[] }> = {
  'plain-http': {
    title: 'Plain HTTP comparison',
    summary: 'No TLS wrapper: HTTP method, path, host header and content can be visible to network observers.',
    facts: [
      { id: 'ip-port', label: 'IP addresses and ports', visible: true, explanation: 'Needed for routing and transport.' },
      { id: 'method-path', label: 'HTTP method/path', visible: true, explanation: 'GET / travels without encryption.' },
      { id: 'body', label: 'HTTP body/content', visible: true, explanation: 'Payload is not protected by TLS.' },
      { id: 'timing-size', label: 'Timing and sizes', visible: true, explanation: 'Packet timing and sizes remain observable.' },
    ],
  },
  'tls13-no-ech': {
    title: 'TLS 1.3 without ECH',
    summary: 'Application data is encrypted, but IP/port, timing, sizes and some handshake metadata can still be visible.',
    facts: [
      { id: 'ip-port', label: 'IP addresses and ports', visible: true, explanation: 'TLS does not hide routing metadata.' },
      { id: 'sni', label: 'SNI / server name', visible: true, explanation: 'Without ECH, the server name may be visible in ClientHello.' },
      { id: 'http-content', label: 'HTTP method/path/content', visible: false, explanation: 'HTTP travels as encrypted application data.' },
      { id: 'timing-size', label: 'Timing and sizes', visible: true, explanation: 'Traffic analysis metadata remains visible.' },
    ],
  },
  'tls13-ech-preview': {
    title: 'TLS 1.3 with ECH preview',
    summary: 'ECH can hide the inner ClientHello details, but it does not make the connection invisible.',
    facts: [
      { id: 'ip-port', label: 'IP addresses and ports', visible: true, explanation: 'Routers still need addresses; TCP/UDP still needs ports.' },
      { id: 'inner-sni', label: 'Inner SNI', visible: false, explanation: 'Modelled as hidden by ECH in this educational variant.' },
      { id: 'http-content', label: 'HTTP method/path/content', visible: false, explanation: 'Still encrypted inside TLS records.' },
      { id: 'timing-size', label: 'Timing and sizes', visible: true, explanation: 'ECH does not hide packet sizes and timing.' },
    ],
  },
}

export function getTlsVisibilityMode(mode: TlsVisibilityMode) {
  return tlsVisibilityModes[mode]
}

export function countVisibleTlsFacts(mode: TlsVisibilityMode) {
  return tlsVisibilityModes[mode].facts.filter((fact) => fact.visible).length
}
