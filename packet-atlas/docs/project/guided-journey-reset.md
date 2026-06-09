# Packet Atlas v9.1 — Guided Journey Reset

This patch corrects the product direction after the atlas became too panel-heavy.

## User-facing rule

The primary experience is not:

```text
look at every panel and guess what to do
```

The primary experience is:

```text
read current step -> press Next -> understand one journey
```

## What changed

- Auto-play is slower.
- Default speed is `slow`.
- The button says `Auto-play`, not just `Play`.
- Focus Mode hides supporting map/inspector panels.
- Empty failure-branch sections are hidden.
- A manual-first note tells the user what to do.

## Product boundary

This reset does not remove deep atlas panels. It makes them secondary again.

Focus Mode should feel like a guided story, not a dashboard.
