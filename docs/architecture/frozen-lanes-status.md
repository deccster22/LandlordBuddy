# Frozen Lanes Status (Phase 4B)

## Purpose
This note gives a short operating status for frozen lanes so implementation stays fidelity-first and contributors do not reopen settled semantics by default.

## Lane status

### Lane 2
Lane 2 is closed for authoring. Implementation fidelity only.

### Lane 4
Lane 4 is closed for authoring/control drafting. Implementation fidelity only.

## What this means in practice
- Use the accepted lane baselines as implementation constraints.
- Extend accepted screen and control patterns instead of redrafting settled semantics.
- Escalate specific conflicts instead of reopening a whole lane.
- Do not treat these lanes as open writing rounds.

## Reopen triggers (summary)

### Lane 2 summary triggers
- protected lines need to change
- state labels, CTA hierarchy, trust-cue binding, or warning consequences need to change
- a required trust cue cannot be preserved on a consequential surface
- a new screen cannot be extended cleanly from the accepted first-wave pattern library

### Lane 4 summary triggers
- lifecycle wording that affects reliance needs to change
- delete vs de-identify semantics need to change
- hold scope cannot be represented below whole-account level where consequential
- auditability/lifecycle cues cannot be substantiated by actual handler/log/state support
- timing wording is drifting beyond system truth

## Review-event categories (summary)
Treat these as review events, not routine polish:
- protected lines
- CTA hierarchy
- trust-cue binding
- warning consequences
- lifecycle wording that affects reliance
- hold scope presentation
- auditability claims

## Controlling docs
- `docs/specs/lane-2-first-wave-copy-baseline.md`
- `docs/specs/lane-4-lifecycle-control-baseline.md`
- `docs/qa/first-wave-semantic-fidelity-checklist.md`
- `docs/decisions/ADR-L2-first-wave-copy-baseline.md`
- `docs/decisions/ADR-L4-lifecycle-control-baseline.md`
- `AGENTS.md`
