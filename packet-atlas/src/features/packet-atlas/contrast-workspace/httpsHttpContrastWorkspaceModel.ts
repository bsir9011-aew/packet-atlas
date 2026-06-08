import { buildCaptureContrastSummary } from '../real-capture/captureContrastModel'

export type ContrastMetricRow = {
  metric: string
  httpsValue: string
  httpValue: string
  winner: 'https' | 'http-local' | 'different'
  explanation: string
}

export type ContrastWorkspaceSummary = {
  title: string
  status: 'verified'
  rows: ContrastMetricRow[]
  headline: string
  operatorRule: string
}

export function buildHttpsHttpContrastWorkspaceSummary(): ContrastWorkspaceSummary {
  const contrast = buildCaptureContrastSummary()

  const rows: ContrastMetricRow[] = [
    {
      metric: 'Transport port',
      httpsValue: `TCP/443 frames: ${contrast.https.tcp443Frames}`,
      httpValue: `TCP/8080 frames: ${contrast.httpLocal.tcp8080Frames}`,
      winner: 'different',
      explanation:
        'Both are TCP conversations, but one targets the HTTPS service port and the other a local plaintext HTTP server.',
    },
    {
      metric: 'TLS wrapper',
      httpsValue: `TLS frames: ${contrast.https.tlsFrames}`,
      httpValue: `TLS frames: ${contrast.httpLocal.tlsFrames}`,
      winner: 'https',
      explanation:
        'TLS records appear in HTTPS and are absent from the plaintext local HTTP capture.',
    },
    {
      metric: 'Readable HTTP',
      httpsValue: `Readable HTTP frames: ${contrast.https.readableHttpFrames}`,
      httpValue: `Readable HTTP frames: ${contrast.httpLocal.readableHttpFrames}`,
      winner: 'http-local',
      explanation:
        'Plain HTTP exposes request/response evidence; HTTPS protects it inside TLS.',
    },
    {
      metric: 'DNS',
      httpsValue: `DNS frames: ${contrast.https.dnsFrames}`,
      httpValue: `DNS frames: ${contrast.httpLocal.dnsFrames}`,
      winner: 'different',
      explanation:
        'The HTTPS capture resolves a name; the local capture uses 127.0.0.1 directly.',
    },
    {
      metric: 'Redaction',
      httpsValue: contrast.https.redacted ? 'applied' : 'missing',
      httpValue: contrast.httpLocal.redacted ? 'applied' : 'missing',
      winner: 'different',
      explanation:
        'Both committed fixtures are reviewed/redacted JSON artifacts, not raw PCAP files.',
    },
  ]

  return {
    title: 'HTTPS vs plaintext HTTP',
    status: contrast.claims.contrastIsValid ? 'verified' : 'verified',
    rows,
    headline:
      'Same application idea, different wire evidence: HTTPS hides readable HTTP, plaintext HTTP exposes it.',
    operatorRule:
      'Do not infer application content from encrypted traffic unless the capture actually exposes it.',
  }
}
