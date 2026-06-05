#!/usr/bin/env bash
set -euo pipefail

echo "🛠️ Repairing v4.2 — separating Vitest unit tests from Playwright E2E tests..."

if [ ! -f package.json ]; then
  echo "❌ Run this script from the Packet Atlas app root (where package.json exists)."
  exit 1
fi

mkdir -p patches/backups

[ -f vitest.config.ts ] && cp vitest.config.ts patches/backups/vitest.config.before-v4.2-repair.ts || true
cp package.json patches/backups/package.before-v4.2-repair.json

cat > vitest.config.ts <<'TS'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
      ...configDefaults.exclude,
      'tests/e2e/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
})
TS

node <<'NODE'
const fs = require('fs')

const packagePath = 'package.json'
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

pkg.scripts = pkg.scripts || {}
pkg.scripts.test = 'vitest --run --config vitest.config.ts'
pkg.scripts['test:unit'] = 'vitest --run --config vitest.config.ts'
pkg.scripts.e2e = pkg.scripts.e2e || 'playwright test'
pkg.scripts['test:all'] = 'npm run test:unit && npm run e2e'

fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n')
NODE

touch .gitignore

python3 <<'PY'
from pathlib import Path

path = Path('.gitignore')
text = path.read_text()

entries = [
    'playwright-report/',
    'test-results/',
    'blob-report/',
]

lines = set(text.splitlines())
missing = [entry for entry in entries if entry not in lines]

if missing:
    suffix = '\n' if text and not text.endswith('\n') else ''
    block = '\n# Playwright artifacts\n' + '\n'.join(missing) + '\n'
    path.write_text(text + suffix + block)
PY

echo "✅ Repair applied."
echo
echo "Vitest will now ignore tests/e2e/**."
echo "Playwright will continue to run tests/e2e/** through npm run e2e."
echo
echo "Run:"
echo "  npm test"
echo "  npm run e2e:install   # only once, if Chromium is not installed"
echo "  npm run e2e"
