import { Suspense, lazy } from 'react'
import { AtlasLoadingFallback } from './features/packet-atlas/performance/AtlasLoadingFallback'

const PacketAtlasPage = lazy(() =>
  import('./features/packet-atlas/PacketAtlasPage').then((module) => ({
    default: module.PacketAtlasPage,
  })),
)

function App() {
  return (
    <Suspense fallback={<AtlasLoadingFallback />}>
      <PacketAtlasPage />
    </Suspense>
  )
}

export default App
