# Packet Atlas v7.9 — Stage Narrative Metadata

v7.9 makes the Animated Journey Mode less ad hoc.

Before this patch, the animated panel already displayed current-stage information, but that information was assembled directly inside the cinematic model. v7.9 creates a dedicated narrative model that can be reused by:

- Animated Journey Mode,
- future branching choices,
- diagnostics,
- presentation/demo mode,
- scenario quality checks.

## Narrative contract

Each stage can be read as a guided screen with these fields:

| Field | Meaning |
|---|---|
| `whatHappensNow` | What is happening in the current step. |
| `whyItMatters` | Why this step matters for the whole request/response journey. |
| `userVisibleOutcome` | What the user would see or not see yet. |
| `networkEvidence` | What the packet/network evidence can show at this step. |
| `diagnosticHint` | The easy trap or misleading assumption for this step. |
| `nextChoices` | The next normal or branch choices available from this step. |

## Product rule

This is still an atlas, not a course platform.

The narrative metadata does not create lessons, quizzes or progress accounts. It gives the existing atlas a clearer step-by-step language.

## Why this is before branching

Branching needs a stable sentence model first.

Before adding DNS failure, TCP blocked, TLS failure or HTTP 500 branches, Packet Atlas needs one clean contract for what a stage says to the user.
