# Release Readiness Snapshot

Generate a human-readable release checkpoint report:

```bash
npm run release:readiness
```

For the full v7.7 checkpoint bundle, run:

```bash
npm run status:checkpoint
```

The release readiness report answers:

- how many scenario manifests are registered,
- how many fixture JSON files exist,
- how many verified real fixtures are attached,
- whether the repository-root CI workflow exists,
- whether visual baselines exist.

It writes:

```text
reports/release-readiness.md
```

Use `npm run project:summary` together with this command when you want the product/technical story, not only the release gate snapshot.
