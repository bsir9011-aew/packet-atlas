export type ProxyTerminationMode =
  | 'terminate-at-proxy'
  | 'tls-pass-through'
  | 're-encrypt-upstream'
  | 'plain-http-upstream'

export type ProxyVisibility = {
  observer: 'network-path' | 'reverse-proxy' | 'app-server'
  sees: string[]
  cannotAssume: string[]
}

export const proxyTerminationModes: Record<ProxyTerminationMode, { title: string; summary: string; boundary: string; visibility: ProxyVisibility[] }> = {
  'terminate-at-proxy': {
    title: 'TLS terminates at reverse proxy',
    summary: 'The public TLS session ends at the proxy. The proxy can inspect HTTP and forward to upstream.',
    boundary: 'Decryption boundary: reverse proxy',
    visibility: [
      { observer: 'network-path', sees: ['IP/port', 'TLS records', 'timing/sizes'], cannotAssume: ['HTTP path', 'body content'] },
      { observer: 'reverse-proxy', sees: ['HTTP method', 'path', 'headers', 'status'], cannotAssume: ['database internals'] },
      { observer: 'app-server', sees: ['forwarded HTTP request'], cannotAssume: ['original TLS handshake unless forwarded as metadata'] },
    ],
  },
  'tls-pass-through': {
    title: 'TLS pass-through to app',
    summary: 'The proxy forwards encrypted TCP/TLS traffic. The app terminates TLS.',
    boundary: 'Decryption boundary: app server',
    visibility: [
      { observer: 'network-path', sees: ['IP/port', 'TLS records'], cannotAssume: ['HTTP content'] },
      { observer: 'reverse-proxy', sees: ['TCP connection metadata', 'SNI may be used for routing'], cannotAssume: ['decrypted HTTP body'] },
      { observer: 'app-server', sees: ['TLS handshake', 'HTTP after decrypt'], cannotAssume: ['proxy inspection of body'] },
    ],
  },
  're-encrypt-upstream': {
    title: 'TLS terminate and re-encrypt',
    summary: 'The proxy decrypts client TLS, inspects HTTP, then creates a new TLS session to upstream.',
    boundary: 'Two TLS boundaries: client→proxy and proxy→app',
    visibility: [
      { observer: 'network-path', sees: ['encrypted records on both links'], cannotAssume: ['same TLS session end-to-end'] },
      { observer: 'reverse-proxy', sees: ['HTTP request/response', 'upstream TLS state'], cannotAssume: ['database internals'] },
      { observer: 'app-server', sees: ['HTTP after upstream TLS decrypt'], cannotAssume: ['client original TLS session keys'] },
    ],
  },
  'plain-http-upstream': {
    title: 'Plain HTTP upstream inside private network',
    summary: 'TLS ends at the proxy and upstream traffic is plain HTTP on an internal segment.',
    boundary: 'Decryption boundary: proxy; internal upstream not encrypted in this model',
    visibility: [
      { observer: 'network-path', sees: ['encrypted client-side TLS'], cannotAssume: ['HTTP on public path'] },
      { observer: 'reverse-proxy', sees: ['HTTP method/path/body', 'upstream plain HTTP'], cannotAssume: ['that upstream is encrypted'] },
      { observer: 'app-server', sees: ['plain HTTP request from proxy'], cannotAssume: ['client TLS handshake'] },
    ],
  },
}

export function getProxyTerminationMode(mode: ProxyTerminationMode) {
  return proxyTerminationModes[mode]
}

export function observerCanSeeHttp(mode: ProxyTerminationMode, observer: ProxyVisibility['observer']) {
  return proxyTerminationModes[mode].visibility
    .find((item) => item.observer === observer)
    ?.sees.some((entry) => entry.toLowerCase().includes('http')) ?? false
}
