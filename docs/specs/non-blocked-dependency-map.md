# Non-blocked Dependency Map

This map separates what future build contributors can extend now from what remains blocker-dependent in Phase 4A. It is intentionally scoped to the current repo and does not treat guarded doctrine as solved.

## Status legend

- Non-blocked: safe to build now against the current repo spine.
- Guarded shell: implemented as a visible placeholder, warning, slowdown, or referral.
- Blocked insertion: wait for the named blocker output before turning the seam into deterministic behavior.

## Current non-blocked spine

| Area | Status | Current implementation surface |
| --- | --- | --- |
| Domain spine | Non-blocked | `src/domain/model.ts` and `src/domain/preparation.ts` define matter, capture, separation, and control shapes |
| Hero workflow skeleton | Non-blocked | `src/workflow/arrearsHeroWorkflow.ts` defines states, next states, and guardrails through notice readiness |
| Arrears shell | Non-blocked | `src/modules/arrears/index.ts` computes arrears amount, paid-to date, threshold state, and threshold moment |
| Timeline shell | Guarded shell | `src/modules/timeline/index.ts` derives threshold-driven milestones while keeping evidence, payment-plan, and hearing steps as placeholders |
| Notice-readiness shell | Non-blocked plus guarded seams | `src/modules/notice-readiness/index.ts` enforces deterministic blockers and preserves guarded review hooks |
| Output, handoff, and touchpoint shells | Non-blocked plus guarded seams | `src/modules/output`, `src/modules/handoff`, and `src/modules/touchpoints` keep package selection, handoff posture, and touchpoint metadata separate |
| Evidence and audit shells | Non-blocked plus guarded seams | `src/modules/evidence` and `src/modules/audit` support local validation, visible review flags, and event recording |
| Verification posture | Non-blocked | `tests/` plus `npm run verify` enforce the current boundary and shell posture |

## What remains blocked or guarded

These assumptions are still unresolved and must remain explicit:

- mixed-claim logic remains guarded
- evidence deadline wording remains guarded
- authenticated portal behavior remains handoff-only in detail
- privacy retention engine details remain incomplete pending `AG-BR04A`
- trust-copy and pricing validation are not final

Current safe extension path:

1. Capture facts once into the shared matter spine.
2. Compute arrears and threshold status from ledger inputs.
3. Move through the hero workflow while logging guarded issues as slowdown or referral.
4. Validate notice readiness using deterministic blockers plus guarded hooks.
5. Assemble printable, prep-pack, or handoff-guidance output without implying official submission.
6. Carry review controls into evidence and audit records.

## Blocker insertion points

### `BR01 matrix`

Purpose now: authoritative mixed-claim routing guidance.

Insert later through:

- `src/workflow/arrearsHeroWorkflow.ts` transitions around `TRIAGE_READY`, `TRIAGE_SLOWDOWN`, `ARREARS_FACTS_GUARDED`, and `REFER_OUT`
- `src/modules/notice-readiness/index.ts` via `guarded.mixedClaimRoutingInteraction`
- future matter-routing assembly that creates `RoutingDecision` and `ReferralFlag` records

Keep unchanged until then:

- mixed-claim cases stay reviewable, slowed down, or referred out
- `forumPath`, `outputMode`, and `officialHandoff` remain separate state dimensions

### `BR02 operating table`

Purpose now: authoritative operating inputs for rules that are not yet stable enough to hard-code broadly.

Insert later through:

- rule-versioned inputs and adapters used by `src/modules/arrears/index.ts`
- threshold-driven placeholder resolution in `src/modules/timeline/index.ts`
- deterministic versus guarded checks in `src/modules/notice-readiness/index.ts`

Keep unchanged until then:

- only settled rows should graduate into deterministic checks
- unresolved timing or service doctrine stays as warnings, slowdown, or placeholder notes

### `BR03 touchpoint register`

Purpose now: authoritative register of public, warning-bearing, authenticated, and freshness-sensitive touchpoints.

Insert later through:

- `src/modules/touchpoints/index.ts`, which is currently a placeholder registry shell
- carry-forward-control merge paths in `src/modules/output/index.ts` and `src/modules/handoff/index.ts`
- future freshness review processes, not product-driven portal execution

Keep unchanged until then:

- placeholder touchpoints remain explicit with `placeholder: true`
- authenticated surfaces stay handoff-only and freshness-sensitive surfaces stay warning-bearing

### `AG-BR04A outputs`

Purpose now: approved output and privacy-handling inputs that are still incomplete in the repo.

Insert later through:

- section keys and block keys in `src/modules/output/index.ts`
- guidance block keys and boundary messaging in `src/modules/handoff/index.ts`
- retention, hold, upload, and review handling in `src/modules/evidence/index.ts`
- audit metadata conventions in `src/modules/audit/index.ts`

Keep unchanged until then:

- `LOCAL_VALIDATION_READY` means only local checks passed
- `UNCLASSIFIED_PENDING_POLICY` does not imply a settled retention doctrine
- output shells stay reviewable and handoff-oriented rather than official-channel executing

### `BR05 trust/copy validation outcomes`

Purpose now: approved trust and wording outcomes for user-facing copy, warnings, and framing.

Insert later through:

- copy bound to existing section keys, block keys, reminder notes, and boundary codes
- build-facing docs where wording changes from guarded to settled
- the future thin app layer once one exists

Keep unchanged until then:

- workflow meaning does not change based on provisional copy
- no pricing-driven branching is added to the current repo spine
- no final legal or operational wording is hard-coded into shells

## Practical guidance for contributors

- Extend deterministic logic only where the repo already has settled inputs and tests.
- When blocked outputs are missing, preserve the seam as a visible placeholder instead of inventing certainty.
- If later blocker work lands, thread it through the existing insertion points rather than replacing the one-capture spine or flattening the state model.
