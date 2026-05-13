# P4C-CX-SURFACE-CONTRACT-01 Lane 3 / Lane 4 / Review C Surface-Contract Catch-Up Checkpoint

Date: 2026-05-13
Task ID: P4C-CX-SURFACE-CONTRACT-01

Scope: checkpoint the current surface-contract posture for eventual shell/current-matter rendered consumption of internal lifecycle planning outputs (including `SCRC-01`) while keeping all rendered/status/CTA exposure gated.

This is a documentation/checkpoint artifact only.
It does not change runtime code, tests, UI implementation, copy, routing behavior, logging behavior, sink behavior, status labels, CTA hierarchy, analytics/admin/support tooling, rendered surfaces, or product semantics.

## 1. Posture Snapshot

- `SCRC-01` remains internal-only and non-visual.
- Internal lifecycle planning remains distinct from screen routing, status labels, CTAs, warning copy, analytics/support taxonomy, and product claims.
- Lifecycle and non-lifecycle slices remain separately inspectable and must remain so in any future surface contract.
- `WLB-01` remains held; this checkpoint does not open second-path watchpoint adoption.
- R2C2 is treated as working visual input only, not final visual lock.

## 2. Surface Candidate Classification Table

Classification values used:

- `INTERNAL_ONLY_READY`
- `SAFE_FUTURE_NON_VISUAL_PLANNING`
- `NEEDS_SURFACE_CONTRACT_BEFORE_RENDERING`
- `CONTRACT_BACKED_NOT_UI_READY`
- `HOLD_PENDING_LANE3_UIUX_SCREEN_CONTRACT`
- `HOLD_PENDING_LANE4_VISUAL_SYSTEM_LOCK`
- `HOLD_PENDING_REVIEWC_RENDERED_SURFACE_COMPARISON`
- `HOLD_PENDING_LEGAL_RISKS_RULES_REVIEW`
- `HOLD_PENDING_PRIVACY_SECURITY_STORAGE_REVIEW`
- `REJECT_NOT_APPLICABLE`

| Surface ID | Surface name | Possible internal source | Possible future user need | Current allowed use | Forbidden current use | Visual dependency | Copy dependency | Lane 3 dependency | Lane 4 dependency | Review C dependency | Legal/Risks/Rules dependency | Privacy/minimisation dependency | Implementation readiness | Risk if surfaced too early | Gate before rendered use | Review owner / review type | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `SC-01` | shell home lifecycle continuity area | `SCRC-01` planner outputs + orchestration lineage | orient returning user to continuity context | planning docs only | any rendered lifecycle status or CTA mapping | yes | yes | required | required | required | required | required | not ready | could imply fake readiness/clearance from internal states | Lane 3 screen-contract acceptance + Lane 4 + Review C comparative pass | Product + UX + app architecture + Review C | `HOLD_PENDING_LANE3_UIUX_SCREEN_CONTRACT` |
| `SC-02` | current-matter view lifecycle context area | routing/control/directive/action/planner outputs | show next safe preparation context | contract-planning only | rendering direct planner outcomes as labels | yes | yes | required | required | required | required | required | contract-backed, not UI-ready | collapse of protected states into one "good" badge | dedicated current-matter surface contract + Lane 4 + Review C | Product + UX + architecture + Legal/Risks/Rules | `CONTRACT_BACKED_NOT_UI_READY` |
| `SC-03` | active matters list continuity/status projection | transition selector + handling action + planner outcome | quick list-level triage and continuation hints | planning docs only | list badges that imply official outcome/compliance | yes | yes | required | required | required | required | required | not ready | list compression can hide no-record/cannot-resume/no-signal distinctions | lane-specific list contract + trust-cue placement review + Review C | Product + UX + Review C | `HOLD_PENDING_LANE3_UIUX_SCREEN_CONTRACT` |
| `SC-04` | lifecycle context panel | lifecycle slice + protected-state flags | inspect lifecycle route/hold/release context safely | schema/contract planning only | direct user-facing lifecycle claims from internal flags | yes | yes | required | required | required | required | required | not ready | high risk of turning internal metadata into legal/compliance language | lifecycle context panel contract + Lane 4 treatment + Review C comparative inspection | Product + architecture + Legal/Risks/Rules + Review C | `NEEDS_SURFACE_CONTRACT_BEFORE_RENDERING` |
| `SC-05` | output/handoff continuation area | handling action + planner + handoff posture outputs | clarify internal continuation vs external handoff boundary | planning only | converting planner outcomes into filing/finality language | yes | yes | required | required | required | required | required | not ready | can blur prep-vs-official boundary | handoff-surface contract update + Review C consequential-surface inspection | Product + UX + Legal/Risks/Rules + Review C | `HOLD_PENDING_REVIEWC_RENDERED_SURFACE_COMPARISON` |
| `SC-06` | warning/interruption block | no-record/cannot-resume/no-signal/hold flags | safe interruption guidance without false success | planning only | rendering interruption copy straight from internal enums | yes | yes | required | required | required | required | required | not ready | hidden fallback-to-success phrasing | interruption-family rendered contract + Lane 4 + Review C | Product + UX + QA + Review C | `HOLD_PENDING_REVIEWC_RENDERED_SURFACE_COMPARISON` |
| `SC-07` | review/referral/handoff block | downstream renderer/handoff state + lifecycle planning context | preserve review/referral/handoff separation | planning only | lifecycle planner outcomes driving CTA tiers/status language | yes | yes | required | required | required | required | required | contract-backed, not UI-ready | referral/wrong-channel could be softened into ordinary handoff | consequential CTA/trust-cue review event + Review C | Product + Legal/Risks/Rules + Review C | `CONTRACT_BACKED_NOT_UI_READY` |
| `SC-08` | internal QA/debug view | planner slices + watchpoint diagnostics summary | internal drift visibility and traceability | internal-only QA/debug documentation and tooling planning | user-visible or support-visible terminology | no for internal use | no for internal use | optional | optional | optional | required | required | internal planning-ready | leakage into support/analytics language | keep internal-only boundary + separate contract for any exposure | QA + architecture | `INTERNAL_ONLY_READY` |
| `SC-09` | support/admin view | planner + watchpoint lineage | potential future operator inspection | planning only (no implementation) | exposing internal lifecycle terms as operational truth | yes | yes | required | required | required | required | required | blocked | could create de facto compliance/official taxonomy | dedicated support/admin contract + privacy/legal/security gates | Product + Support design + Legal/Risks/Rules + privacy/security | `HOLD_PENDING_LEGAL_RISKS_RULES_REVIEW` |
| `SC-10` | analytics/reporting/export surfaces | planner outcomes and watchpoint families | aggregate internal quality/flow metrics | planning only (strictly non-rendered) | external/user-visible categories or exported lifecycle labels | yes | yes | required | required | required | required | required | blocked | metric labels may imply success/clearance/finality | analytics/export contract + privacy/security/storage + Review C gate where rendered | Product + data governance + privacy/security + Legal/Risks/Rules | `HOLD_PENDING_PRIVACY_SECURITY_STORAGE_REVIEW` |

## 3. Lifecycle-State To Surface Caution Table

| Planner outcome | Internal meaning only | Must not say to users | Future surface type (after gates) | What Review C must inspect |
| --- | --- | --- | --- | --- |
| `PLAN_INTERNAL_CONTINUE_WITH_LIFECYCLE_CONTEXT` | continue internal planning with preserved lifecycle context | "cleared", "ready", "approved", "filed", "safe to proceed" | current-matter continuity area or lifecycle context panel only after contract and rendered gates | context is shown without certainty inflation; trust cues remain adjacent; no CTA/status overclaim |
| `PLAN_INTERNAL_CONTINUE_NO_RECORD_NON_CLEARANCE` | continue internal planning while keeping no-record and non-clearance explicit | "no record means all good", "auto-cleared", "safe deletion clearance" | interruption-aware continuity surface only after explicit anti-fake-clearance contract | explicit `clearanceInferred=false` equivalent meaning survives; no silent success fallback |
| `PLAN_INTERNAL_HOLD_CANNOT_SAFELY_RESUME` | fail-safe internal hold; review-led interruption planning | "temporary glitch", "continue anyway", "resolved by default" | warning/interruption block only after interruption-family contract and rendered comparison | fail-safe remains prominent; hold/release semantics are not collapsed; CTA hierarchy does not bypass hold |
| `PLAN_INTERNAL_EXPLICIT_NO_ROUTING_SIGNAL` | explicit no-signal state; not default proceed | "proceed", "complete", "auto-routed" | guarded interruption/referral-oriented surface after gate approvals | no-signal remains explicit; route/dependency ambiguity remains visible; no generic success wording |

## 4. Not-UI-Ready Boundary

- Internal planner outputs are not labels.
- Internal planner outputs are not statuses.
- Internal planner outputs are not CTAs.
- Internal planner outputs are not warning copy.
- Internal planner outputs are not support/admin taxonomy.
- Internal planner outputs are not analytics/reporting categories.

## 5. Visual Dependency Handling

- No final visual lock is required for this checkpoint.
- R2C2 is treated as working identity input only.
- Lane 4 visual system governance must control any future rendered lifecycle/state treatment.
- App tile/logo progress does not authorize lifecycle/status/CTA exposure.

## 6. Review C Readiness Requirements For Lifecycle Surface Use

Before lifecycle planning states appear on screen, Review C should inspect whether rendered surfaces preserve all of the following without fake-clearance language:

- no-record non-clearance remains explicit and non-success.
- cannot-safely-resume remains fail-safe and review-led.
- no-signal remains explicit and non-default.
- hold-aware and release-controlled conditions remain distinct.
- deletion and de-identification remain distinct.
- lifecycle and non-lifecycle slices remain separately inspectable in consequence-bearing views.
- trust/boundary cues remain adjacent to any consequential action blocks.
- no rendered wording implies compliance clearance, legal sufficiency, official acceptance, filing readiness, or finality.

## 7. WLB-01 Status

- `WLB-01` remains held.
- This checkpoint does not create new evidence to reopen `WLB-01`.
- Reopen trigger remains unchanged: an accepted unmet internal observability need tied to an approved consumer contract that current one-path diagnostics cannot support.

## 8. What This Proves / Does Not Prove

This checkpoint proves:

- candidate rendered/surface consumers are now classified with explicit gates and dependencies.
- `SCRC-01` planner outcomes are explicitly blocked from direct status/CTA/rendered conversion.
- lane dependencies for future lifecycle-surface use are explicit across Lane 3, Lane 4, and Review C.

This checkpoint does not prove:

- rendered lifecycle/status/CTA readiness.
- Lane 4 visual lock completion.
- Review C completion.
- alpha readiness.

## 9. Next-Option Analysis

### Option A: open a narrow Lane 3 screen-contract task

- Upside: directly defines the first consequential screen contract boundary for lifecycle planning use without runtime expansion.
- Risk: still requires strict Lane 4/Review C/Legal gate discipline to avoid premature wording.

### Option B: open a Lane 4 visual-state treatment task

- Upside: improves visual consistency for future consequential state expression.
- Risk: can outrun screen-contract semantics if opened before Lane 3 lifecycle surface mapping.

### Option C: run a combined Review C surface comparison prep pack

- Upside: strengthens comparative inspection criteria early.
- Risk: may be broader than needed before the first lane-specific lifecycle surface contract.

### Option D: return to another internal non-visual consumption slice

- Upside: keeps internal machinery progress moving.
- Risk: repeats sequencing drift by extending engine-room depth before surface-contract catch-up.

Recommended next move: **Option A**.

Rationale: the highest-value next step is a narrow Lane 3 lifecycle screen-contract packet that keeps runtime unchanged but specifies the first rendered-consumption boundary under explicit Lane 4, Review C, Legal/Risks/Rules, and privacy gates.
