# Current Product Posture

## Purpose
This note is the current repository posture snapshot for contributors. It aligns architecture language with accepted Product, Legal, and Marketing direction without reopening doctrine.

## 1. Phase posture
- Phase 4B is the primary active build posture.
- Phase 4C runs in parallel for product-experience construction:
  - user journey
  - forms/question architecture
  - UI/UX
  - branding / app tile / launch-surface work
- This posture does not imply alpha readiness.
- Gate A accepts Review A as checkpoint-cleared with gates retained for current 4B checkpoint use.
- That checkpoint signal does not imply Review C completion, full BR04 privacy-engine completion, BR02 payment-plan default adoption, official portal parity, or product-side official submission/filing/acceptance behavior.

## 2. Product shape snapshot

Wedge baseline (unchanged):

- Victoria-first
- residential-only
- arrears-first
- procedural-risk-prevention-led

| Layer | Role now | Must not imply |
| --- | --- | --- |
| Hero workflow (arrears wedge) | Lead workflow from arrears intake through notice readiness and external handoff preparation | filing/submission, legal path selection certainty, official-system completion |
| Focused operating shell | Bounded support layer for operational context, reminder/logging continuity, evidence/document continuity, matter launching, and structured handoff packaging | generic PM-suite ambition, accounting/tax suite behavior, compliance certification, official execution, national expansion drift |

The hero arrears workflow remains the lead path. The focused operating shell exists to support preparation quality, continuity, and repeat use, not to replace the wedge or expand beyond accepted scope.

## 3. Shell scope and exclusion fence

The shell inclusion fence is category-bounded:

- operational context
- reminder/logging continuity
- evidence/document continuity
- matter launching into the hero workflow
- structured packaging for external review/handoff

The shell exclusion fence remains explicit:

- accounting integrations
- full accounting-suite behavior
- tax advice or tax optimization
- maintenance marketplace behavior
- tenant messaging platform behavior
- direct official filing/submission
- generic PM-suite sprawl
- national expansion complexity

## 4. Shell-specific semantic fences

Reminder inclusion rule:

- include only mandatory or clearly lawful landlord-side obligations/milestones
- derive triggers from captured facts
- do not infer legal path/strategy
- do not imply compliance clearance, legal all-clear, or legal sufficiency

Records and continuity posture:

- inspection logs, issue registers, notes, rent entries, and document storage are chronology/evidence continuity supports
- they are not legal adjudication, tribunal sufficiency, or compliance certification
- upload/record presence alone does not equal legal readiness or official acceptance

Additional implication controls:

- bond-paid status is factual visibility only
- lease renewal / expiry reminders are operational continuity, not legal conclusions
- structured export is packaging for review/handoff, not filing, acceptance, or legal sufficiency
- "ready" language must continue to honor existing trust-cue and handoff constraints

## 5. Current frozen lane posture

### Lane 2
Lane 2 is closed for authoring.
Use the first-wave marketing handoff pack as the build copy baseline.
Implementation is fidelity-only unless an explicit Lane 2 reopen trigger fires.

### Lane 4
Lane 4 is closed for authoring/control drafting.
Implementation is focused on lifecycle-control fidelity and control enforcement.
Do not let policy wording outrun product state, handlers, logs, or hold-scope truth.

For detailed lane state, use `docs/architecture/frozen-lanes-status.md`.

## 6. Control boundaries (unchanged)

The following controls remain mandatory:
- prep-and-handoff separation
- deterministic vs guarded separation
- no legal-advice behavior
- no portal mimicry or official-system parity claims
- warning families as behavioral controls, not decorative copy
- trust-cue-bound state discipline on consequential surfaces

## 7. Pattern-extension rule
For first-wave screens, extend the existing accepted pattern library rather than inventing new semantics from scratch.

## 8. Semantic integrity rule
Do not silently change:
- protected lines
- state labels
- CTA hierarchy
- trust-cue binding
- warning consequences
- lifecycle wording that affects user reliance
- hold scope presentation
- auditability claims
- shell wording that implies compliance clearance, legal readiness, official-system parity, or PM-suite expansion

These are review events, not routine polish.

## 9. Contributor routing

Use these docs together:
- shell baseline: `docs/specs/focused-operating-shell-baseline.md`
- lane and freeze snapshot: `docs/architecture/frozen-lanes-status.md`
- shell direction ADR: `docs/decisions/ADR-focused-operating-shell-direction.md`
- shell canon delta note: `docs/decisions/canon-shell-delta-note.md`
- Lane 2 baseline: `docs/specs/lane-2-first-wave-copy-baseline.md`
- Lane 4 baseline: `docs/specs/lane-4-lifecycle-control-baseline.md`
- semantic QA checks: `docs/qa/first-wave-semantic-fidelity-checklist.md`

If a change affects implication-sensitive shell wording, expands shell scope, or weakens a frozen semantic/lifecycle control, treat it as a review event.
