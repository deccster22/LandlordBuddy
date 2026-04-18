# Non-blocked Dependency Map

This map separates what future build contributors can extend now from what remains blocker-dependent in Phase 4B. It is intentionally scoped to the current repo and does not treat guarded doctrine as solved.

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
| Evidence and audit shells | Non-blocked plus guarded seams | `src/modules/evidence` and `src/modules/audit` support local validation, visible review flags, event recording, and source-driven BR04 privacy metadata attachment without turning local-only checks into doctrine |
| BR04 privacy scaffold | Guarded shell | `src/domain/model.ts`, `src/modules/br04/index.ts`, `src/modules/br04/policy-source.ts`, `src/modules/notice-draft/index.ts`, and `src/modules/output/index.ts` attach privacy hooks, source-driven policy refs, scoped hold placeholders, lifecycle actions, privacy audit events, access-boundary placeholders, and current consumer-lane record population without hard-coded durations or release rules |
| Verification posture | Non-blocked | `tests/` plus `npm run verify` enforce the current boundary and shell posture |

## What remains blocked or guarded

These assumptions are still unresolved and must remain explicit:

- mixed-claim logic remains guarded
- evidence deadline wording remains guarded
- authenticated portal behavior remains handoff-only in detail
- privacy retention engine details remain incomplete pending `AG-BR04A`
- BR04 policy source resolves references only; exact durations, hold triggers, release authority, and review cadence remain placeholder/configurable
- BR04 consumer-lane hooks now require target-scoped policy refs plus explicit access-scope linkage, so no universal keep/delete fallback can be inferred from source-driven assembly
- BR04 target-level defaults stay valid only while a target has one policy and one scope candidate; once a target has multiple candidates, callers must select explicitly or fail loudly
- trust-copy and pricing validation are not final

Current safe extension path:

1. Capture facts once into the shared matter spine.
2. Compute arrears and threshold status from ledger inputs.
3. Move through the hero workflow while logging guarded issues as slowdown or referral.
4. Validate notice readiness using deterministic blockers plus guarded hooks.
5. Assemble printable, prep-pack, or handoff-guidance output without implying official submission.
6. Carry review controls and source-driven BR04 refs into evidence, notice-draft, output-package, and audit records without implying official execution or compliant disposal.

## Blocker insertion points

### `BR01 matrix`

Purpose now: first-pass BR01 scenario-registry routing for arrears-first mixed-claim posture.

Current first-wave insertion:

- `src/modules/br01/registry.ts` now holds the BR01 scenario registry for arrears-only, mixed-claim, sensitive, and jurisdiction route-out posture.
- `src/modules/br01/resolver.ts` now captures objectives early and resolves explicit BR01 outcome families:
  - deterministic route allowed
  - slowdown/review required
  - split-matter required
  - referral required
  - route-out required
- `src/workflow/arrearsHeroWorkflow.ts` now exposes `deriveBr01WorkflowGate`, which maps BR01 routing output into consequential triage progression (`ARREARS_FACTS_READY`, `TRIAGE_SLOWDOWN`, or `REFER_OUT`) instead of flattening mixed objectives.

Still guarded after this insertion:

- unresolved statutory thresholds and exception doctrine remain out of deterministic scope
- mixed combinations outside current registry rows remain explicit guarded slowdown posture
- downstream referral/routing decision record assembly (`RoutingDecision`, `ReferralFlag`) remains a follow-on seam

Keep unchanged while expanding BR01:

- no legal-advice path selection behavior
- no portal submission/execution behavior
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

Park-ready checkpoint (`P4B-CX-BR03-05A`):

- BR03 is paused at the current locked-invariants stopping point.
- Canonical parking note: `docs/specs/br03-parked-invariants.md`.
- No behavior broadening is in scope unless a listed reactivation trigger fires.

Current first-wave insertion:

- `src/modules/touchpoints/index.ts` now resolves touchpoints by forum path or ID and emits BR03 control outputs for:
  - mirror vs mirror-with-warning vs defer-to-live-official-flow classification posture
  - stale vs live-confirmation-required freshness posture
  - wrong-channel reroute posture
- `src/modules/output/index.ts` and `src/modules/handoff/index.ts` now consume the BR03 resolver outputs so touchpoint posture can drive merged carry-forward controls and handoff guidance block structure.
  - prep-pack output block keys now also consume BR03 consequence keys so stale, live-confirmation-required, wrong-channel-reroute, and authenticated-handoff-only posture stay explicit downstream.

Expand later through:

- future freshness review processes, not product-driven portal execution

Still guarded after first BR03 hardening pass:

- live-confirmation-required triggers remain registry/override-driven; refresh cadence and authority are not settled doctrine yet
- wrong-channel detection remains explicit control input and reroute logic, not automated portal-state interpretation
- authenticated touchpoints remain metadata plus handoff-control posture only, with no product-side authenticated execution

Locked precedence invariants (P4B-CX-BR03-04):

- wrong-channel reroute always suppresses ordinary mirror allowances and keeps stop + explain + reroute posture explicit downstream
- authenticated-handoff-only posture suppresses ordinary mirror allowances and keeps authenticated touchpoints in defer/handoff-only posture
- stale and live-confirmation-required remain distinct consequence families (including mixed multi-touchpoint combinations)
- stale controls remain explicit (`touchpoint-stale` plus carry-forward control) and are not collapsed into generic warning-only treatment
- prep-pack, handoff guidance, renderer state, and merged carry-forward controls stay aligned from shared resolver outputs under mixed touchpoint combinations
- mixed touchpoint IDs with conflicting posture now rely on tested resolver precedence rather than consumer-specific fallback behavior

Keep unchanged until then:

- placeholder touchpoints remain explicit with `placeholder: true`
- authenticated surfaces stay handoff-only and freshness-sensitive surfaces stay reviewable rather than portal-executed
- wrong-channel handling remains stop + explain + reroute, not ordinary handoff

Reopen or broaden BR03 only when one or more of these triggers fire:

1. new touchpoint IDs are required
2. new forum paths need touchpoint control coverage
3. new authenticated/live official surfaces need modeled control posture
4. new freshness-sensitive touchpoint classes require separate consequence handling
5. per-instance override needs exceed current touchpoint-ID keyed posture

### `AG-BR04A outputs`

Purpose now: approved output and privacy-handling inputs that are still incomplete in the repo.

Insert later through:

- section keys and block keys in `src/modules/output/index.ts`
- guidance block keys and boundary messaging in `src/modules/handoff/index.ts`
- retention, hold, upload, and review handling in `src/modules/evidence/index.ts`
- source-driven output-package record attachment in `src/modules/output/index.ts`
- audit metadata conventions in `src/modules/audit/index.ts`

Keep unchanged until then:

- `LOCAL_VALIDATION_READY` means only local checks passed
- local evidence upload limits remain local-only shell constraints rather than retention doctrine
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
