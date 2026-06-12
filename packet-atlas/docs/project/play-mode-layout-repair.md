# Packet Atlas v13.8 — Play Mode Layout Repair

This patch fixes the Play Mode layout after v13.7.

## Problem

The old hero/header layout could squeeze the current stage title into a narrow side column and leave a large empty area.

## Fix

Play Mode now forces the current stage header to behave like a full-width reading screen:

```text
PLAY MODE
Step X / Y — Current stage name
short instruction
progress
story
coach
Next
```

## Product rule

Play Mode should make the current stage obvious.

It must not feel like a dashboard header with panels fighting for space.
