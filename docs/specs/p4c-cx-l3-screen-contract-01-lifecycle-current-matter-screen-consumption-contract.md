# P4C-CX-L3-SCREEN-CONTRACT-01 Lifecycle/Current-Matter Screen-Consumption Contract

Date: 2026-05-13
Task ID: P4C-CX-L3-SCREEN-CONTRACT-01

Scope: define a narrow Lane 3 screen-consumption contract for potential future rendered use of lifecycle/current-matter internal planning states (including `SCRC-01`) without authorizing UI implementation, copy authoring, status labels, CTA hierarchy, or visual lock.

This is a documentation/contract artifact only.
It does not change runtime code, tests, UI implementation, copy, routing behavior, logging behavior, sink behavior, status labels, CTA hierarchy, analytics/admin/support tooling, rendered surfaces, or product semantics.

## 1. Contract Boundary Snapshot

- `SCRC-01` remains internal-only and non-visual.
- Lane 3 screen-contract work remains a boundary definition step, not screen implementation.
- Internal lifecycle planning outcomes are not direct user-facing labels, statuses, CTAs, warning copy, support/admin taxonomy, or analytics/export categories.
- Lifecycle and non-lifecycle slices remain separately inspectable and must remain separate in future rendered contracts.
- `WLB-01` remains held.
- R2C2 remains working visual input only and does not authorize lifecycle/status surface exposure.

## 2. Screen-Zone Classification Table

| Screen zone ID | Candidate screen zone name | Internal source allowed | Possible future user need | Allowed current contract use | Forbidden current use | Possible future rendered role | Forbidden labels / wording directions | CTA restrictions | Warning/interruption restrictions | Trust/boundary cue adjacency requirement | Visual dependency | Copy dependency | Review C dependency | Legal/Risks/Rules dependency | Privacy/minimisation dependency | Implementation readiness | Risk if surfaced too early | Gate before rendering | Review owner / review type |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `L3-SZ-01` | current-matter lifecycle continuity zone | `SCRC-01` planner outcome + lifecycle/non-lifecycle slices + handling lineage | clarify where matter continuity is open vs review-blocked | boundary mapping and contract planning only | direct rendering of `PLAN_INTERNAL_*` as labels/statuses | bounded continuity context area that preserves non-certifying posture | ready/cleared/compliant/safe/final/complete language | planner outcome must not directly choose CTA text or tier | cannot-resume/no-signal must not be downgraded into soft informational noise | boundary cue must sit adjacent to consequential action area and external-handoff boundary cue | required | required | required | required | required | not ready | generic "all good" compression and fake-clearance risk | lane-specific current-matter rendered contract + Lane 4 treatment + Review C inspection | Product + UX + architecture + Legal/Risks/Rules + Review C |
| `L3-SZ-02` | lifecycle context panel zone | lifecycle route kind, hold/release flags, no-record/no-signal/cannot-resume flags | allow safe inspection of lifecycle context without legal overclaim | schema and field-level planning only | exposing raw lifecycle flags as legal/compliance conclusions | guarded context panel with explicit uncertainty/fail-safe boundaries | tribunal-ready/hearing-ready/approved/official/final labels | no CTA may be generated directly from lifecycle route kind | interruption posture must remain serious, bounded, non-punitive | trust cue and prep-vs-official boundary cue required in same visual region | required | required | required | required | required | not ready | metadata could be mistaken as legal certification | dedicated lifecycle panel contract + Lane 4 + Review C + consequential-surface legal review | Product + architecture + Legal/Risks/Rules + Review C |
| `L3-SZ-03` | output/handoff continuation zone | planner outcome + handling action + handoff posture outputs | help user understand preparation continuity and external handoff boundary | contract-level boundary planning only | converting planner states into filing readiness or acceptance claims | continuity/handoff guidance zone with explicit external ownership | filed/accepted/official/complete action claims | CTA copy/tier must be separately reviewed under Lane 2/3/5 trust posture | no warning copy may imply official finding or legal advice | external-handoff cue must remain adjacent and visually unambiguous | required | required | required | required | required | not ready | prep/handoff boundary may blur into official-action implication | handoff continuation surface contract + Review C consequential inspection | Product + UX + Legal/Risks/Rules + Review C |
| `L3-SZ-04` | warning/interruption block zone | cannot-resume/no-signal/no-record and hold/release context | preserve safe stop/slowdown behavior in consequential moments | interruption-family boundary planning only | directly presenting internal enum names or certainty claims | interruption container for serious bounded procedural friction | compliant/safe/proceed now/issue resolved phrasing | interruption state must not auto-select or escalate CTA hierarchy | warning family must remain non-punitive and non-legal-advice | trust cue required beside interruption reason and boundary cue | required | required | required | required | required | not ready | fail-safe states could collapse into cosmetic warnings | interruption rendered contract + Lane 4 state treatment + Review C parity checks | Product + UX + QA + Review C |
| `L3-SZ-05` | review/referral/handoff block zone | downstream review/referral/handoff states with lifecycle context carry | preserve review-led and referral-first separation | contract planning for separation rules only | planner outcome driving user-facing status class or referral copy | explicit separation block for review vs referral vs handoff outcomes | cleared/approved/ready to file language | CTA outcome must remain separately governed and must not imply official submission | warning/referral language must preserve stop/reroute boundaries | trust cue must be adjacent to referral/handoff boundary text area | required | required | required | required | required | contract-backed, not UI-ready | ordinary handoff could incorrectly outrank referral/wrong-channel stops | consequential block contract + Review C rendered comparison + CTA review event | Product + Legal/Risks/Rules + Review C |

## 3. Lifecycle-Outcome Screen-Boundary Table

| Planner outcome | Internal meaning | Permitted screen-planning interpretation | Forbidden user-facing interpretation | Candidate future zone | Required adjacent trust/boundary cue | Review C inspection point |
| --- | --- | --- | --- | --- | --- | --- |
| `PLAN_INTERNAL_CONTINUE_WITH_LIFECYCLE_CONTEXT` | continue internal planning with lifecycle context preserved | continuity context can remain open if non-certifying boundaries are explicit | cleared/ready/approved/safe/final/finalized posture | `L3-SZ-01`, `L3-SZ-02` | prep-and-handoff-only plus external-action boundary cue | verify continuity does not become certainty or completion claim |
| `PLAN_INTERNAL_CONTINUE_NO_RECORD_NON_CLEARANCE` | continue planning while no-record and non-clearance remain explicit | context may be shown as incomplete/needs-check condition only | "no record = safe" or implied clearance | `L3-SZ-01`, `L3-SZ-04` | explicit non-clearance boundary cue with check-before-proceed framing | verify anti-fake-clearance meaning remains visible and non-optional |
| `PLAN_INTERNAL_HOLD_CANNOT_SAFELY_RESUME` | fail-safe hold and review-led interruption planning | interruption planning may reserve a future stop/slowdown container | "temporary glitch resolved", default proceed, hidden hold | `L3-SZ-04`, `L3-SZ-05` | clear stop/review boundary cue and no-official-action implication | verify hold remains prominent and cannot be bypassed by optimistic CTA posture |
| `PLAN_INTERNAL_EXPLICIT_NO_ROUTING_SIGNAL` | explicit no-signal state; not a success path | guarded interruption/referral planning can be considered | implicit proceed/success fallback | `L3-SZ-04`, `L3-SZ-05` | explicit uncertainty boundary cue with non-default handling | verify no-signal remains distinct and not merged into generic informational state |

## 4. Forbidden Wording Register (Lifecycle/Current-Matter Rendered Use)

Do not use these words or close semantic equivalents as lifecycle/current-matter rendered outcomes derived from internal planner states:

- ready
- cleared
- compliant
- safe
- legally valid
- final
- accepted
- approved
- filed
- official
- tribunal-ready
- hearing-ready
- complete

## 5. Permitted Wording Posture (Concept Level Only, Not Final Copy)

Concept-level wording posture that may guide future copy contracts:

- review needed
- continue working
- record available
- information missing
- cannot safely continue from saved record
- check before proceeding
- open matter context
- handoff remains outside Landlord Buddy

## 6. CTA Boundary

- Internal planner outcomes must not directly choose CTA text.
- Internal planner outcomes must not directly choose CTA hierarchy or priority tier.
- Any future lifecycle/current-matter CTA must be separately reviewed against Lane 2, Lane 3, and Lane 5 trust posture.
- No CTA may imply legal clearance, official submission, compliance certification, filing finality, or official acceptance.

## 7. Status-Label Boundary

- No direct mapping from `PLAN_INTERNAL_*` outcomes to visible status labels is allowed by this contract.
- Any future visible lifecycle/current-matter status label requires a separate copy contract and Review C inspection.
- Any future status label must preserve no-record non-clearance, cannot-resume fail-safe, explicit no-signal, and lifecycle/non-lifecycle separation boundaries.

## 8. Warning/Interruption Boundary

- `PLAN_INTERNAL_HOLD_CANNOT_SAFELY_RESUME` and `PLAN_INTERNAL_EXPLICIT_NO_ROUTING_SIGNAL` may require future interruption-pattern planning.
- Interruption patterns must remain serious, bounded, and non-punitive.
- No warning/interruption surface may imply legal advice, official finding, legal sufficiency, or compliance clearance.
- No interruption pattern may collapse hold/release distinction or deletion/de-identification distinction.

## 9. Visual Dependency Handling

- No final visual lock is required for this contract.
- R2C2 is working identity input only and does not authorize lifecycle/status rendering.
- Lane 4 visual system must govern rendered state treatment later.
- App tile/logo progress does not authorize lifecycle/status/CTA exposure.

## 10. Review C Readiness Requirements

Before lifecycle/current-matter state appears on screen, Review C should inspect:

- no-record remains explicitly non-clearance.
- cannot-resume remains fail-safe and review-led.
- no-signal remains explicit and non-default.
- hold-aware and release-controlled remain distinct.
- deletion and de-identification remain distinct.
- lifecycle and non-lifecycle slices remain separately inspectable.
- trust/boundary cues remain adjacent to consequential action regions.
- rendered wording avoids overclaim language and does not imply compliance/legal/finality outcomes.

## 11. WLB-01 Status

- `WLB-01` remains held.
- This screen-consumption contract does not create a reason to reopen `WLB-01`.
- Reopen criteria remain unchanged and require explicit separate decisioning.

## 12. Next-Option Analysis

### Option A: open Lane 4 visual-state treatment contract

- Upside: prepares visual-state expression constraints early.
- Risk: can outrun lane-specific screen-boundary semantics if opened before first wireframe-boundary contract.

### Option B: open Review C rendered-surface comparison prep pack

- Upside: strengthens inspection rigor for consequential surfaces.
- Risk: may be broad before the next lane-specific screen-boundary artifact is defined.

### Option C: open a narrow Lane 3 wireframe-boundary packet without UI implementation

- Upside: extends this contract into concrete zone-boundary framing while keeping implementation/copy/CTA work gated.
- Risk: still requires strict gate discipline to prevent premature wording/design decisions.

### Option D: pause rendered-surface work and return to another internal non-visual contract

- Upside: continues internal machinery progress.
- Risk: increases sequencing drift by extending internals while rendered-surface consumption risk remains unresolved.

Recommended next move: **Option C**.

Rationale: this keeps progress inside Lane 3 boundary definition, preserves non-implementation posture, and provides the cleanest bridge to later Lane 4 and Review C gates without reopening runtime or watchpoint expansion seams.
