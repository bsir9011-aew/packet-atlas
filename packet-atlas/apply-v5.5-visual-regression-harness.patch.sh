#!/usr/bin/env bash
set -euo pipefail
echo "📸 Applying Packet Atlas v5.5 — Visual Regression Harness..."
if [ ! -f package.json ] || [ ! -f playwright.config.ts ]; then echo "❌ Run this from /workspaces/packet-atlas/packet-atlas"; exit 1; fi
mkdir -p tests/visual tests/unit patches/backups
cp package.json patches/backups/package.before-v5.5.json
[ -f vitest.config.ts ] && cp vitest.config.ts patches/backups/vitest.config.before-v5.5.ts || true

cat > playwright.visual.config.ts <<'TS'
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/visual',
  timeout: 45_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    },
  },
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
TS

cat > tests/visual/packet-atlas.visual.spec.ts <<'TS'
import { expect, test } from '@playwright/test'

test.describe('Packet Atlas visual baselines', () => {
  test('journey workspace', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/Opening https:\/\/example\.com/i).first()).toBeVisible()
    await expect(page).toHaveScreenshot('journey-workspace.png', { fullPage: true })
  })

  test('diagnostics workspace', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: /Diagnostics/i }).click()
    await expect(page.getByText(/Failure model/i).first()).toBeVisible()
    await expect(page).toHaveScreenshot('diagnostics-workspace.png', { fullPage: true })
  })

  test('capture workspace', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: /Capture/i }).click()
    await expect(page.getByText(/Capture bridge/i).first()).toBeVisible()
    await expect(page).toHaveScreenshot('capture-workspace.png', { fullPage: true })
  })
})
TS

node <<'NODE'
const fs = require('fs')
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
pkg.scripts = pkg.scripts || {}
pkg.scripts['visual:update'] = 'playwright test --config=playwright.visual.config.ts --update-snapshots'
pkg.scripts['visual:test'] = 'playwright test --config=playwright.visual.config.ts'
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
NODE

python3 <<'PY'
from pathlib import Path
p = Path('vitest.config.ts')
if p.exists():
    text = p.read_text()
    if "'tests/visual/**'" not in text:
        marker = "      'tests/e2e/**',"
        if marker in text:
            text = text.replace(marker, marker + "\n      'tests/visual/**',", 1)
            p.write_text(text)
PY

cat > tests/unit/visualRegressionHarness.test.ts <<'TS'
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

describe('visual regression harness', () => {
  it('has a dedicated Playwright visual config', () => {
    expect(existsSync('playwright.visual.config.ts')).toBe(true)
    expect(existsSync('tests/visual/packet-atlas.visual.spec.ts')).toBe(true)
    const config = readFileSync('playwright.visual.config.ts', 'utf8')
    expect(config).toContain('toHaveScreenshot')
  })
})
TS

python3 <<'PY'
from pathlib import Path
import re
p = Path('src/features/packet-atlas/PacketAtlasPage.tsx')
if p.exists():
    p.write_text(re.sub(r'Packet Atlas v\d+\.\d+', 'Packet Atlas v5.5', p.read_text(), count=1))
PY

echo "✅ v5.5 applied."
echo "📸 First create baselines: npm run visual:update"
echo "🧪 Later compare changes: npm run visual:test"
