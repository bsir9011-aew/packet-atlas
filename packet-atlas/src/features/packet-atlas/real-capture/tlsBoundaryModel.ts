import { buildRealCaptureEvidenceSummary } from './realCaptureEvidenceModel'

export type TlsBoundaryItem = {
  label: string
  visibleToNetwork: boolean
  explanation: string
}

export type TlsBoundarySummary = {
  mode: 'https-over-tls'
  networkCanSee: TlsBoundaryItem[]
  networkCannotAssume: TlsBoundaryItem[]
  keyBoundary: string
  verifiedByCapture: string[]
}

export function buildTlsBoundarySummary(): TlsBoundarySummary {
  const evidence = buildRealCaptureEvidenceSummary()

  const networkCanSee: TlsBoundaryItem[] = [
    {
      label: 'DNS lookup',
      visibleToNetwork: evidence.dnsFrames > 0,
      explanation: `${evidence.dnsFrames} DNS frames are present in the clean trace.`,
    },
    {
      label: 'IP addresses and TCP/443',
      visibleToNetwork: evidence.tcp443Frames > 0,
      explanation: `${evidence.tcp443Frames} TCP/443-related frames exist.`,
    },
    {
      label: 'TLS records',
      visibleToNetwork: evidence.tlsFrames > 0,
      explanation: `${evidence.tlsFrames} TLS frames are present.`,
    },
    {
      label: 'Timing and size shape',
      visibleToNetwork: evidence.frameCount > 0,
      explanation: `${evidence.frameCount} frames give an observable timing/size trace.`,
    },
  ]

  const networkCannotAssume: TlsBoundaryItem[] = [
    {
      label: 'HTTP method/path',
      visibleToNetwork: false,
      explanation: 'The clean capture has 0 readable HTTP frames.',
    },
    {
      label: 'HTTP body/content',
      visibleToNetwork: false,
      explanation: 'Application content is protected inside TLS records.',
    },
    {
      label: 'Server-side app/database internals',
      visibleToNetwork: false,
      explanation: 'The network trace only proves transport/security evidence, not app internals.',
    },
  ]

  return {
    mode: 'https-over-tls',
    networkCanSee,
    networkCannotAssume,
    keyBoundary:
      'The network observer sees routing, ports and TLS records; readable HTTP is beyond the TLS boundary.',
    verifiedByCapture: [
      `DNS frames: ${evidence.dnsFrames}`,
      `TCP/443 frames: ${evidence.tcp443Frames}`,
      `TLS frames: ${evidence.tlsFrames}`,
      `Readable HTTP frames: ${evidence.readableHttpFrames}`,
    ],
  }
}
