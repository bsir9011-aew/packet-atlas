#!/usr/bin/env bash
set -euo pipefail

echo "🛠️ Repairing v4.2 — Playwright Linux system dependencies..."

if [ ! -f package.json ]; then
  echo "❌ Run this script from the Packet Atlas app root (where package.json exists)."
  exit 1
fi

mkdir -p patches/backups
cp package.json patches/backups/package.before-v4.2-linux-deps-repair.json

node <<'NODE'
const fs = require('fs')

const packagePath = 'package.json'
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

pkg.scripts = pkg.scripts || {}
pkg.scripts['e2e:install'] = 'playwright install chromium --with-deps'
pkg.scripts['e2e:deps'] = 'playwright install-deps chromium'
pkg.scripts.e2e = pkg.scripts.e2e || 'playwright test'
pkg.scripts['e2e:report'] = 'playwright show-report'

fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n')
NODE

echo "✅ Repair applied."
echo
echo "The old install command downloaded Chromium only."
echo "The repaired command installs Chromium plus required Linux libraries."
echo
echo "Run:"
echo "  npm run e2e:install"
echo "  npm run e2e"
