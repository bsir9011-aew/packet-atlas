export type AtlasInventoryStatus = 'ready' | 'evidence' | 'tooling'
export type AtlasInventoryWorkspace = 'Journey' | 'Diagnostics' | 'Protocols' | 'Internals' | 'Capture' | 'Repository'
export type AtlasInventoryItem = { id: string; label: string; status: AtlasInventoryStatus; workspace: AtlasInventoryWorkspace; whyItMatters: string }
export type AtlasInventorySummary = { title: string; subtitle: string; itemCount: number; groups: Record<string, AtlasInventoryItem[]>; strongestProof: string }

const inventoryItems: AtlasInventoryItem[] = [
  { id: 'journey-map', label: 'Journey map and active stage', status: 'ready', workspace: 'Journey', whyItMatters: 'Shows the request/response path as one continuous story.' },
  { id: 'failure-diagnostics', label: 'Failure diagnostics', status: 'ready', workspace: 'Diagnostics', whyItMatters: 'Shows where the route changes, breaks or becomes unreachable.' },
  { id: 'protocol-variants', label: 'Protocol variants', status: 'ready', workspace: 'Protocols', whyItMatters: 'Lets the same path be viewed through DNS, HTTP, TLS, proxy, CDN, Wi‑Fi and IPv6 variants.' },
  { id: 'packet-internals', label: 'Observer, field and byte internals', status: 'ready', workspace: 'Internals', whyItMatters: 'Separates what exists from what a device or observer can actually see.' },
  { id: 'https-real-capture', label: 'Verified HTTPS real capture', status: 'evidence', workspace: 'Capture', whyItMatters: 'Proves DNS/TCP/TLS evidence exists while readable HTTP remains hidden.' },
  { id: 'http-local-real-capture', label: 'Verified HTTP local real capture', status: 'evidence', workspace: 'Capture', whyItMatters: 'Proves plaintext HTTP exposes readable GET/200 evidence on the wire.' },
  { id: 'contrast-workspace', label: 'HTTP vs HTTPS contrast workspace', status: 'evidence', workspace: 'Capture', whyItMatters: 'Turns the two captures into a side-by-side teaching proof.' },
  { id: 'capture-audits', label: 'Capture audits and quality gates', status: 'tooling', workspace: 'Repository', whyItMatters: 'Keeps real fixture data attached, redacted and trustworthy.' },
  { id: 'visual-ci', label: 'Visual regression and CI', status: 'tooling', workspace: 'Repository', whyItMatters: 'Protects the UI from accidental layout drift.' },
]

export function buildAtlasInventorySummary(): AtlasInventorySummary {
  const groups = inventoryItems.reduce<Record<string, AtlasInventoryItem[]>>((acc, item) => {
    acc[item.workspace] = [...(acc[item.workspace] ?? []), item]
    return acc
  }, {})
  return { title: 'What exists in Packet Atlas now?', subtitle: 'This inventory is the project map: features, real evidence and tooling.', itemCount: inventoryItems.length, groups, strongestProof: 'The strongest proof is the HTTPS vs HTTP contrast: TLS hides readable HTTP, plaintext HTTP exposes it.' }
}
export function listAtlasInventoryItems(): AtlasInventoryItem[] { return inventoryItems }
