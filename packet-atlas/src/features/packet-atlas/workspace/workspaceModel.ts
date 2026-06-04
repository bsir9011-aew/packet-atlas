export type AtlasWorkspaceId =
  | 'journey'
  | 'diagnostics'
  | 'protocols'
  | 'internals'
  | 'capture'

export type AtlasWorkspaceDefinition = {
  id: AtlasWorkspaceId
  label: string
  icon: string
  summary: string
  purpose: string
}

export const atlasWorkspaces: AtlasWorkspaceDefinition[] = [
  {
    id: 'journey',
    label: 'Journey',
    icon: '🧭',
    summary: 'Map, timeline, active stage and core inspector.',
    purpose:
      'Keep the main data journey in the center: where the packet is, what stage is active and which layer is being highlighted.',
  },
  {
    id: 'diagnostics',
    label: 'Diagnostics',
    icon: '🛠️',
    summary: 'Failures, diff, NAT and firewall state.',
    purpose:
      'Compare happy path with failure variants and inspect where the flow changes, breaks or becomes unreachable.',
  },
  {
    id: 'protocols',
    label: 'Protocols',
    icon: '🔁',
    summary: 'DNS, HTTP, TLS, proxy, CDN, Wi‑Fi and IPv6 variants.',
    purpose:
      'Explore alternative protocol and infrastructure models without forcing every panel into the default view.',
  },
  {
    id: 'internals',
    label: 'Internals',
    icon: '🔬',
    summary: 'Observers, fields, bytes and device cutaways.',
    purpose:
      'Go deeper into what each device, field and protocol wrapper can or cannot reveal.',
  },
  {
    id: 'capture',
    label: 'Capture',
    icon: '🦈',
    summary: 'Fixture and capture pipeline bridge.',
    purpose:
      'Connect the educational scenario with capture fixtures without turning the browser into a PCAP parser.',
  },
]

export function getWorkspaceById(id: AtlasWorkspaceId) {
  return atlasWorkspaces.find((workspace) => workspace.id === id) ?? atlasWorkspaces[0]
}
