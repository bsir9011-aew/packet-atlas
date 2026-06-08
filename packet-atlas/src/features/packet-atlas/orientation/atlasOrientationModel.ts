import type {
  AtlasWorkspaceDefinition,
  AtlasWorkspaceId,
} from '../workspace/workspaceModel'

export type AtlasOrientationStep = {
  id: string
  label: string
  workspaceId: AtlasWorkspaceId
  why: string
}

export type AtlasOrientationSummary = {
  title: string
  subtitle: string
  labBridge: string
  currentFocus: string
  suggestedRoute: AtlasOrientationStep[]
  workspaceHints: Record<AtlasWorkspaceId, string>
  mentalModel: string[]
}

const workspaceHints: Record<AtlasWorkspaceId, string> = {
  journey:
    'Start here when you want the clean story: one request, active stage, route map and core inspector.',
  diagnostics:
    'Use this when something breaks: compare healthy flow with failures, NAT/firewall state and root-cause clues.',
  protocols:
    'Use this to ask “what changes if…?” DNS mode, HTTP version, TLS visibility, proxy/CDN, Wi‑Fi and IPv6.',
  internals:
    'Use this when you want microscope mode: observers, device truth, fields, bytes and packet structure.',
  capture:
    'Use this to connect the atlas with real evidence: verified fixtures, HTTPS vs HTTP contrast and TShark-derived facts.',
}

export function buildAtlasOrientationSummary(
  currentWorkspace: AtlasWorkspaceDefinition,
): AtlasOrientationSummary {
  return {
    title: 'You are not lost — Packet Atlas has layers',
    subtitle:
      'The app is the atlas. The terminal captures were the lab work that produced verified evidence for the atlas.',
    labBridge:
      'Terminal work created reviewed JSON fixtures. The browser does not read raw PCAP; it shows normalized, redacted evidence.',
    currentFocus: workspaceHints[currentWorkspace.id],
    workspaceHints,
    mentalModel: [
      'Journey = the clean map of the request/response path.',
      'Diagnostics = what changes when the path breaks.',
      'Protocols = variants of the same path.',
      'Internals = what devices and fields can actually reveal.',
      'Capture = real evidence connected back to the educational model.',
    ],
    suggestedRoute: [
      {
        id: 'first',
        label: '1. Journey',
        workspaceId: 'journey',
        why: 'See the baseline story before details compete for attention.',
      },
      {
        id: 'second',
        label: '2. Capture',
        workspaceId: 'capture',
        why: 'Compare the model with real HTTPS and plaintext HTTP evidence.',
      },
      {
        id: 'third',
        label: '3. Diagnostics',
        workspaceId: 'diagnostics',
        why: 'Only after the happy path is clear, inspect where failures cut the route.',
      },
      {
        id: 'fourth',
        label: '4. Protocols / Internals',
        workspaceId: 'protocols',
        why: 'Use these as deeper lenses, not as the first screen to understand everything.',
      },
    ],
  }
}

export function getOrientationHintForWorkspace(id: AtlasWorkspaceId): string {
  return workspaceHints[id]
}
