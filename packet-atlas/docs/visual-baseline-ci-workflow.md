# Visual baseline CI workflow

Use this sequence after any UI change:

```bash
pkill -f "vite" || true
npm run visual:clean
npm run visual:ci:update
npm run visual:ci:test
npm run visual:baseline:guard
```

If the guard reports changed files, commit only visual baselines:

```bash
git add tests/visual
git commit -m "Update visual baselines"
git push
```

Do not commit:

- `playwright-report/`
- `test-results/`
- `dist/`
- generated reports
- raw capture artifacts
