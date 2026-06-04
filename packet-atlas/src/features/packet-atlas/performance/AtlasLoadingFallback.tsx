export function AtlasLoadingFallback() {
  return (
    <main className="atlas-loading-fallback" aria-live="polite">
      <div className="atlas-loading-fallback__card">
        <p className="eyebrow">Packet Atlas</p>
        <h1>Loading atlas…</h1>
        <p>Preparing the interactive journey map, inspectors and diagnostic overlays.</p>
      </div>
    </main>
  )
}
