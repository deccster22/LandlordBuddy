# Frozen Lanes Status Snapshot

## Purpose
This note gives a short operating status for frozen and parallel lanes so implementation stays fidelity-first and contributors do not reopen settled semantics by default.

## 1. Primary phase signal

- Phase 4B remains the primary build and semantic-control phase.
- Phase 4C is parallel construction work for product experience and launch-facing surfaces.
- Do not read this snapshot as a phase handover or alpha-readiness signal.

## 2. What this means in practice
- Use accepted lane baselines as implementation constraints.
- Extend accepted screen and control patterns instead of redrafting settled semantics.
- Escalate specific conflicts instead of reopening a whole lane.
- Do not treat frozen lanes as open writing rounds.

## 3. Lane snapshot

| Lane / stream | Current posture | Source anchors | Contributor rule |
| --- | --- | --- | --- |
| Lane 1 (journey and flow shaping) | Parallel 4C construction, bounded by existing semantics | `docs/specs/p4c-cx-l1-01-first-wave-product-journey-pack.md`, `docs/qa/p4c-cx-l1-01-4c-a-status-pack.md` | Reuse frozen state/warning/CTA families; do not author new doctrine |
| Lane 2 (semantics/copy/trust controls) | Closed for authoring; implementation fidelity only | `docs/governance/P4B Freeze Map.md`, `docs/specs/lane-2-first-wave-copy-baseline.md`, `AGENTS.md` | Protected-line changes are review events |
| Lane 3 (QA/readiness evidence) | Active 4B control and regression evidence lane | `docs/qa/p4b-cx-l3-05a-review-c-readiness-pack.md`, `docs/qa/p4b-cx-l3-01-qa-rule-map.md` | Preserve deterministic vs guarded evidence separation |
| Lane 4 (brand and launch language shape) | Closed for authoring/control drafting; implementation-fidelity only with bounded 4C execution alignment | `docs/specs/p4c-mkt-l4-01-first-wave-brand-visual-direction-pack.md`, `docs/qa/p4c-mkt-l4-01-4c-d-status-pack.md`, `docs/specs/lane-4-lifecycle-control-baseline.md`, `AGENTS.md` | Keep anti-overclaim and handoff boundaries explicit |
| Lane 6 (docs/architecture shadow alignment) | Light additive shadow lane | `docs/qa/p4c-doc-l6-02-lane-6-shadow-sync-pack.md`, `docs/qa/p4c-doc-l6-02-sync-status-note.md`, `docs/decisions/p4c-doc-l6-01-decision-log-starter.md` | Improve discoverability and honesty; do not signal readiness |
| BR01 / BR03 / BR05 parked lanes | Stable parking posture, not fully finished | `docs/specs/br01-parked-invariants.md`, `docs/specs/br03-parked-invariants.md`, `docs/specs/br05-parked-invariants.md` | Keep explicit reactivation triggers and avoid forced expansion |
| BR04 privacy lifecycle scaffold | Guarded scaffold with policy/source slots | `docs/architecture/br04-privacy-lifecycle-scaffold.md` | Do not convert placeholder lifecycle doctrine into deterministic timers |

## 4. Focused operating shell overlay

The focused operating shell is accepted as a bounded layer above the hero arrears workflow.

- The wedge remains Victoria-first, residential-only, arrears-first, and procedural-risk-prevention-led.
- It does not change lane protections.
- It does not weaken prep-and-handoff boundaries.
- It does not authorize PM-suite expansion.
- It does not turn shell surfaces into compliance certification, legal readiness, or official-system status.

Use `docs/specs/focused-operating-shell-baseline.md` for accepted inclusions/exclusions.

Accepted shell fence summary:

- include only operational context, reminder/logging continuity, evidence/document continuity, and matter launching into the hero workflow
- keep reminder inclusion constrained to mandatory or clearly lawful landlord-side obligations/milestones with fact-derived triggers
- keep records (inspection logs, issue registers, notes, rent entries, document storage) as continuity/evidence supports only
- exclude accounting integrations/suites, tax advice/optimization, maintenance marketplace behavior, tenant messaging platform behavior, direct filing/submission, generic PM-suite sprawl, and national expansion complexity

## 5. Reopen triggers (summary)

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

## 6. Review-event categories (summary)
Treat these as review events, not routine polish:
- protected lines
- CTA hierarchy
- trust-cue binding
- warning consequences
- lifecycle wording that affects reliance
- hold scope presentation
- auditability claims
- shell wording that implies compliance clearance, legal readiness, official-system parity, PM-suite expansion, or national-expansion posture

## 7. Controlling docs
- `docs/specs/lane-2-first-wave-copy-baseline.md`
- `docs/specs/lane-4-lifecycle-control-baseline.md`
- `docs/specs/focused-operating-shell-baseline.md`
- `docs/qa/first-wave-semantic-fidelity-checklist.md`
- `docs/decisions/ADR-L2-first-wave-copy-baseline.md`
- `docs/decisions/ADR-L4-lifecycle-control-baseline.md`
- `docs/decisions/ADR-focused-operating-shell-direction.md`
- `docs/decisions/canon-shell-delta-note.md`
- `AGENTS.md`
