# P4B-CX-APP-ALIGN-09 Watchpoint Regression Diagnostics Coverage-Boundary Checkpoint Note

Date: 2026-05-08
Task ID: P4B-CX-APP-ALIGN-09

Scope: record the `APP-ALIGN-08` watchpoint regression diagnostics coverage boundary before any `WLB-01` second-path consideration.

This is a documentation/checkpoint artifact only.
It does not change runtime code, tests, logging behavior, sink behavior, UI/copy, routing behavior, status labels, CTA hierarchy, analytics/admin/support tooling, or product semantics.

## 1. Current Watchpoint Chain Summary

Current chain status:

1. schema contract frozen (`APP-ALIGN-03`)
2. internal emitter implemented (`APP-ALIGN-04`)
3. one-path sink-injected caller wiring (`APP-ALIGN-05`)
4. one-path adoption boundary recorded (`APP-ALIGN-06`)
5. expansion backlog and gates recorded (`APP-ALIGN-07`)
6. internal regression diagnostics harness wrapped around the existing one-path caller only (`APP-ALIGN-08`)

## 2. Diagnostics Coverage Table (`APP-ALIGN-08`)

| Diagnostic area | Source state | Checked flag or event condition | Expected protected behavior | What drift it catches | What it does not prove |
| --- | --- | --- | --- | --- | --- |
| lifecycle-context event family presence | normal resumed lifecycle context path | `WATCH_LIFECYCLE_RESUME_STATE_OBSERVED` present | neutral internal lifecycle context observation remains explicit | missing/renamed base event family | does not prove user-facing routing/status behavior |
| no-record non-clearance | missing lifecycle record path | `WATCH_LIFECYCLE_NO_RECORD_OBSERVED` + `noRecordFlag=true` + `clearanceInferred=false` | no-record remains explicit non-clearance | fallback from no-record into implied success/clearance | does not prove legal/privacy sufficiency |
| malformed/cannot-safely-resume fail-safe | malformed lifecycle replay path | `WATCH_LIFECYCLE_CANNOT_RESUME_OBSERVED` + `cannotSafelyResumeFlag=true` | malformed path remains fail-safe | silent degrade from malformed to success/proceed | does not prove full malformed-data recovery strategy |
| explicit no-signal | absent routing-signal path | `WATCH_LIFECYCLE_NO_ROUTING_SIGNAL_OBSERVED` + `noRoutingSignalFlag=true` | no-signal remains explicit and non-default | no-signal falling through to implicit proceed | does not prove downstream UI interruption handling |
| hold-aware state | active hold path | hold/release family observed + `holdAwareFlag=true` | hold-aware state remains visible and review-led | lost hold visibility or mislabelled hold state | does not prove hold UX or operator workflow |
| release-controlled state | confirmed hold-release path | hold/release family observed + `releaseControlledFlag=true` | release-controlled state remains visible and distinct | collapse of release-controlled into generic normal path | does not prove release authorization policy completeness |
| deletion route | deletion lifecycle route path | `lifecycleRouteKind=DELETION_REQUEST` observed | deletion route remains explicit and distinct | route-kind collapse between deletion/de-identification | does not prove retention-policy completion |
| de-identification route | de-identification lifecycle route path | `lifecycleRouteKind=DEIDENTIFICATION_ACTION` observed | de-identification route remains explicit and distinct | route-kind collapse into deletion or generic action | does not prove data-lifecycle execution readiness |
| lifecycle/non-lifecycle separation | mixed lifecycle + non-lifecycle context | `WATCH_LIFECYCLE_NONLIFECYCLE_SEPARATION_OBSERVED` + `lifecycleNonLifecycleSeparationFlag=true` | lifecycle and non-lifecycle slices remain separately inspectable | collapse into generic launcher-resume success state | does not prove rendered-surface state mapping |
| forbidden event-name semantics | synthetic invalid semantic event input | forbidden token detection + schema validation failure | success/clearance/compliance/finality language remains blocked | accidental confidence language in internal event types | does not prove all future naming decisions |
| forbidden sensitive payload fields | synthetic invalid payload input | forbidden payload-field detection + schema validation failure | minimisation/privacy boundaries remain explicit | personal/content/credential/address/payment leakage in payload fields | does not prove broader storage/security controls |
| forbidden UI/CTA/analytics payload fields | synthetic invalid UI/analytics fields | forbidden payload-field detection for UI/CTA/analytics keys | internal diagnostics remain non-UI/non-analytics | leakage from observability payloads into surface semantics | does not prove dashboard/export suppression across future seams |
| parity with direct handling-action caller output | same output checkpoint through diagnostics wrapper and direct wired caller | handling-action and emitted-event parity checks | diagnostics wrap existing path without altering routing/control outcomes | hidden behavior change introduced by diagnostics wrapper | does not prove second-path readiness |

## 3. Adoption-Boundary Restatement

- one existing caller path only: `launcherCurrentMatterWatchpointWiredCaller`
- diagnostics wrap that existing path only
- explicit injected in-memory/test sink only
- no second runtime caller wiring
- no global/default sink
- no persistent sink
- no dashboard/admin/support/analytics/export surface

## 4. What This Proves

- `APP-ALIGN-08` diagnostics are bounded to internal regression checks around the existing one-path watchpoint adoption.
- Protected-state drift checks are present for no-record, cannot-resume, no-signal, hold/release, route-kind distinction, and lifecycle/non-lifecycle separation.
- Forbidden event semantics and forbidden payload fields are explicitly flagged in diagnostics.
- Wrapper parity checks confirm diagnostics do not change existing handling-action outputs.

## 5. What This Does Not Prove

- It does not prove readiness for `WLB-01` second-path runtime wiring.
- It does not prove readiness for persistent sinks, dashboards/admin/support tooling, analytics/reporting, or exports.
- It does not prove UI/screen/status/CTA behavior readiness.
- It does not prove BR04 completion, storage-provider readiness, privacy-engine completion, alpha readiness, or Review C readiness.

## 6. Do Not Overclaim

Do not treat this checkpoint as:

- permission to open a second watchpoint caller path without contract/gate review
- permission to introduce global/default or persistent sink behavior
- evidence of compliance clearance, legal sufficiency, filing readiness, or official action
- evidence that internal diagnostics are equivalent to product-surface readiness

## 7. Next-Option Analysis

### Option A: open `WLB-01` contract-first packet for second-path consideration

- Upside: advances bounded expansion planning without immediate wiring.
- Risk: if done without posture realignment, contract scope can outrun current 4C surface catch-up signals.

### Option B: pause logging expansion and return to 4C shell/current-matter surface work

- Upside: strongest protection against observability-to-surface semantic drift.
- Risk: delays internal logging-seam decision-making momentum.

### Option C: run a repo/app posture sync before deciding on `WLB-01`

- Upside: confirms sequencing, gate ownership, and non-claim boundaries before second-path contract work.
- Risk: adds one small checkpoint step before contract drafting.

## 8. Recommended Next Move

Recommended: **Option C**.

Rationale:

- `APP-ALIGN-08` confirms diagnostics quality, but not second-path readiness.
- A short posture sync can confirm if `WLB-01` should proceed now or wait for broader 4C alignment.
- This keeps logging observability discipline explicit and avoids readiness inflation.
