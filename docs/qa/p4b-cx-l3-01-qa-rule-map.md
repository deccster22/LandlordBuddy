# P4B-CX-L3-01 Lane 3 QA Rule Map

Date: 2026-04-21
Task ID: P4B-CX-L3-01

This artifact converts the current implemented blocker spine into inspectable Lane 3 QA checks.

It preserves current posture:

- preparation stays separate from official action
- handoff stays separate from execution
- deterministic rules stay separate from guarded review/slowdown/referral seams
- stale/live confirmation/wrong-channel distinctions stay explicit
- no portal mimicry, no filing/submission implication, no legal-advice behavior

Classification set used in this map: `covered`, `partially covered`, `not yet covered`, `needs product decision`.

Follow-on scenario/state matrix: `docs/qa/p4b-cx-l3-02-scenario-library-and-state-matrix.md`.

## 1. Deterministic Rule Inventory

| Rule ID | Deterministic expectation | Runtime surface | Existing QA anchors | Coverage |
| --- | --- | --- | --- | --- |
| `L3-DET-01` | BR01 transition families stay explicit (`CONTINUE`, `GUARDED_REVIEW`, `SPLIT_MATTER`, `REFERRAL_STOP`, `ROUTE_OUT_STOP`) and route-out maps to stop-state handling. | `src/workflow/arrearsHeroWorkflow.ts`, `src/modules/br01/resolver.ts` | `tests/br01-routing.test.ts` | `covered` |
| `L3-DET-02` | Stored BR01 artifacts are preferred downstream over conflicting request-time BR01 input; fallback remains explicit when stored artifacts are absent. | `src/modules/br01/downstream.ts`, `src/modules/output/index.ts`, `src/modules/handoff/index.ts` | `tests/br01-downstream.test.ts` | `covered` |
| `L3-DET-03` | Arrears shell computes deterministic threshold posture when inputs are valid and returns `BLOCKED_INVALID` plus explicit reasons when invalid/incomplete. | `src/modules/arrears/index.ts` | `tests/arrears-shell.test.ts` | `covered` |
| `L3-DET-04` | No-early-notice gate remains threshold-driven (`threshold_met` required) across arrears/timeline and BR02 consumer seams. | `src/modules/arrears/index.ts`, `src/modules/timeline/index.ts`, `src/modules/br02/index.ts`, `src/modules/br02/consumer.ts` | `tests/arrears-shell.test.ts`, `tests/br02-registry-scaffold.test.ts`, `tests/br02-consumer.test.ts` | `covered` |
| `L3-DET-05` | Notice-readiness mandatory-field and threshold hard stops remain deterministic; severity ordering is hard-stop > referral > slowdown > warning. | `src/modules/notice-readiness/index.ts` | `tests/notice-readiness.result.test.ts` | `covered` |
| `L3-DET-06` | Output/handoff boundaries remain structural: `officialSystemAction: NOT_INCLUDED`, no product submission, no portal mimicry. | `src/modules/output/index.ts`, `src/modules/handoff/index.ts`, `src/modules/output/trustBindings.ts` | `tests/output-handoff.framework.test.ts`, `tests/output-trust-binding.test.ts` | `covered` |
| `L3-DET-07` | BR02 registry-first deterministic rows remain explicit (registered-post preference, email consent requirement, dual-step timing with hearing override precedence). | `src/modules/br02/registries.ts`, `src/modules/br02/index.ts`, `src/modules/br02/consumer.ts` | `tests/br02-registry-scaffold.test.ts`, `tests/br02-consumer.test.ts` | `covered` |
| `L3-DET-08` | BR02 downstream status mapping (`HARD_STOP`, `NEEDS_REVIEW`, `REVIEW_LED_CAUTION`, `NEXT_STEP_READY`) remains explicit for workflow/readiness bridging. | `src/modules/br02/downstream.ts`, `src/workflow/arrearsHeroWorkflow.ts` | `tests/br02-downstream.test.ts` | `covered` |
| `L3-DET-09` | BR03 resolver precedence remains explicit under mixed touchpoint combinations; wrong-channel and authenticated handoff-only suppress ordinary mirror allowances. | `src/modules/touchpoints/index.ts` | `tests/br03-touchpoint-control.test.ts`, `tests/br03-touchpoint-matrix.test.ts` | `covered` |
| `L3-DET-10` | BR04 source-driven hook assembly rejects blanket lifecycle inference and ambiguous/widening source attachment. | `src/modules/br04/index.ts`, `src/modules/br04/policy-source.ts` | `tests/br04-privacy-scaffold.test.ts`, `tests/br04-consumer-lanes.test.ts`, `tests/evidence-audit.framework.test.ts` | `covered` |
| `L3-DET-11` | Local evidence validation blocks unsupported MIME type and invalid file size with local-only posture. | `src/modules/evidence/index.ts` | `tests/evidence-audit.framework.test.ts` | `covered` |
| `L3-DET-12` | Renderer-state primary/readiness/ownership mapping remains explicit and never implies product execution of official steps. | `src/modules/output/rendererStateAdapter.ts`, `src/modules/handoff/reviewState.ts` | `tests/output-renderer-state.test.ts`, `tests/output-handoff.framework.test.ts` | `covered` |

## 2. Hard-Stop Inventory

| Control | Trigger | Required fail-safe posture | Existing QA anchors | Coverage |
| --- | --- | --- | --- | --- |
| `BLOCKED_INVALID` arrears shell | Missing threshold rule or invalid arrears input basis | Return provisional shell with explicit reasons; do not treat threshold as met | `tests/arrears-shell.test.ts` | `covered` |
| `ARREARS_BELOW_THRESHOLD` | Notice-readiness receives `below_threshold` | `BLOCKED`, no progression | `tests/notice-readiness.result.test.ts` | `covered` |
| `ARREARS_THRESHOLD_UNCONFIRMED` | Threshold posture absent or `blocked_invalid` at notice-readiness time | `BLOCKED`, no progression | `tests/notice-readiness.result.test.ts` | `covered` |
| Mandatory field hard stops (`MISSING_ARREARS_AMOUNT`, `MISSING_PAID_TO_DATE`, `MISSING_NOTICE_NUMBER`, `MISSING_SERVICE_METHOD`) | Required notice fields missing | `BLOCKED`, no progression | `tests/notice-readiness.result.test.ts` | `covered` |
| `NO_EARLY_NOTICE_GATE` | BR02 gate unresolved/not met | `HARD_STOP` downstream posture | `tests/br02-registry-scaffold.test.ts`, `tests/br02-consumer.test.ts`, `tests/br02-downstream.test.ts` | `covered` |
| `EMAIL_CONSENT_PROOF_REQUIRED` | Email service without linked consent proof | Hard stop in BR02 consumer/downstream path | `tests/br02-registry-scaffold.test.ts`, `tests/br02-consumer.test.ts`, `tests/br02-downstream.test.ts` | `covered` |
| `UNSUPPORTED_FILE_TYPE` | Local evidence MIME type not allowed | `LOCAL_VALIDATION_BLOCKED` | `tests/evidence-audit.framework.test.ts` | `covered` |
| `INVALID_FILE_SIZE` | Local evidence size is invalid/out of bounds | `LOCAL_VALIDATION_BLOCKED` | `tests/evidence-audit.framework.test.ts` | `covered` |
| BR04 no-universal keep/delete guard | Source lane attempts to drop no-universal guard | Fail loudly; reject hook assembly | `tests/evidence-audit.framework.test.ts`, `tests/br04-privacy-scaffold.test.ts` | `covered` |

## 3. Warning, Slowdown, Referral, And Route-Out Inventory

| Family | Key controls | Required posture | Existing QA anchors | Coverage |
| --- | --- | --- | --- | --- |
| `warning` | `DOCUMENTARY_EVIDENCE_GUARDED`, `PUBLIC_FORM_WARNING`, `TOUCHPOINT_STALE`, `FRESHNESS_SENSITIVE_SURFACE` | Warning remains visible and must not silently auto-pass doctrine. Warning-only readiness may remain `READY_FOR_REVIEW` when no stronger issue exists. | `tests/notice-readiness.result.test.ts`, `tests/br03-touchpoint-control.test.ts`, `tests/br03-touchpoint-matrix.test.ts`, `tests/output-handoff.framework.test.ts` | `covered` |
| `slowdown/review` | `SERVICE_PROOF_GUARDED`, `HAND_SERVICE_REVIEW_GUARDED`, `MIXED_CLAIM_ROUTING_GUARDED`, `TOUCHPOINT_LIVE_CONFIRMATION_REQUIRED`, `AUTHENTICATED_TOUCHPOINT_HANDOFF_ONLY`, timeline guarded controls | Progression pauses for review; no silent deterministic success. | `tests/notice-readiness.result.test.ts`, `tests/br02-registry-scaffold.test.ts`, `tests/br03-touchpoint-control.test.ts`, `tests/output-timeline-propagation.test.ts`, `tests/output-renderer-state.test.ts` | `covered` |
| `referral` | `INTERSTATE_ROUTE_OUT`, `BR01_REFERRAL_REQUIRED`, `TOUCHPOINT_WRONG_CHANNEL_REROUTE` | Referral-stop posture, reroute outside ordinary path, no copy-ready fallback when referral severity applies. | `tests/notice-readiness.result.test.ts`, `tests/br01-downstream.test.ts`, `tests/br03-touchpoint-control.test.ts`, `tests/br03-touchpoint-matrix.test.ts`, `tests/output-handoff.framework.test.ts` | `covered` |
| `route-out` (explicitly distinct from ordinary referral) | `BR01_ROUTE_OUT_REQUIRED` and BR01 route-out transition family | Route-out remains structurally distinct from ordinary referral and maps to stop-state handling. | `tests/br01-routing.test.ts`, `tests/br01-downstream.test.ts` | `covered` |

## 4. Stale-State Downgrade Inventory

| Stale/downgrade check | Expected downgrade behavior | Existing QA anchors | Coverage |
| --- | --- | --- | --- |
| BR03 stale freshness posture | `TOUCHPOINT_STALE` warning control stays distinct from live-confirmation-required slowdown. | `tests/br03-touchpoint-control.test.ts`, `tests/br03-touchpoint-matrix.test.ts` | `covered` |
| BR03 live-confirmation-required posture | Slowdown control (`TOUCHPOINT_LIVE_CONFIRMATION_REQUIRED`) remains distinct from stale warning. | `tests/br03-touchpoint-control.test.ts`, `tests/br03-touchpoint-matrix.test.ts` | `covered` |
| BR03 wrong-channel reroute | Wrong-channel reroute is referral severity, forces `referral-stop`, suppresses ordinary copy-ready fallback. | `tests/br03-touchpoint-control.test.ts`, `tests/br03-touchpoint-matrix.test.ts` | `covered` |
| BR02 freshness monitor stale warning/slowdown semantics | `STALE_WARNING` and `STALE_SLOWDOWN` remain structural non-authoritative controls. | `tests/br02-registry-scaffold.test.ts` | `partially covered` |
| BR02 hearing override precedence over generic timing | Generic timing must not outrank hearing-specific instructions. | `tests/br02-registry-scaffold.test.ts`, `tests/br02-consumer.test.ts`, `tests/br02-downstream.test.ts` | `covered` |
| Timeline blocked-invalid downgrade | `BLOCKED_INVALID` sequencing remains distinct from guarded/external sequencing and does not rewrite readiness truth. | `tests/arrears-shell.test.ts`, `tests/output-timeline-propagation.test.ts`, `tests/output-renderer-state.test.ts` | `covered` |

## 5. Renderer-State Integrity Inventory

| Integrity check | Expected posture | Existing QA anchors | Coverage |
| --- | --- | --- | --- |
| Readiness state integrity | Renderer `primaryState` mirrors readiness outcome and reserves `READY_FOR_REVIEW` for ready readiness only. | `tests/output-renderer-state.test.ts` | `covered` |
| Ownership integrity | Product, next-action, and external execution ownership remain explicit; `productExecution` remains `NOT_EXECUTED_BY_PRODUCT`. | `tests/output-renderer-state.test.ts`, `tests/output-handoff.framework.test.ts` | `covered` |
| Sequencing/readiness separation | Blocked sequencing, guarded sequencing, and readiness outcomes remain separate dimensions. | `tests/output-renderer-state.test.ts`, `tests/output-timeline-propagation.test.ts` | `covered` |
| Trust-state key alignment | Surface keys and review-state keys remain aligned for blocked/guarded/stale/live/wrong-channel postures. | `tests/output-timeline-propagation.test.ts`, `tests/br03-touchpoint-matrix.test.ts`, `tests/output-trust-binding.test.ts` | `covered` |
| Full trust-cue coverage parity check across all consequential surfaces | Every trust-cue-bound state should have an explicit trust-cue assertion on each consequential surface family. | Spot-checked in `tests/output-trust-binding.test.ts`, `tests/output-handoff.framework.test.ts`, `tests/br03-touchpoint-control.test.ts` | `partially covered` |

## 6. First Watchlist-To-Test Conversion Table

| Watchlist ID | Source watchlist item | Converted check entry | Existing QA anchor(s) | Status |
| --- | --- | --- | --- | --- |
| `L2-WL-01` | Trust-cue-bound states must not appear without required cue on consequential surfaces. | Assert trust-cue keys for each consequential surface key family (`printable`, `prep-pack`, `handoff`). | `tests/output-trust-binding.test.ts`, `tests/output-handoff.framework.test.ts`, `tests/output-trust-cue-parity.test.ts` | `covered` |
| `L2-WL-02` | Ready/prepared language must not imply filing/submission/finality. | Assert `officialSystemAction: NOT_INCLUDED`, anti-overclaim boundary keys, and external official-step ownership. | `tests/output-handoff.framework.test.ts`, `tests/output-renderer-state.test.ts` | `covered` |
| `L2-WL-03` | Wrong-channel requires stop + explain + reroute, not ordinary handoff. | Assert wrong-channel produces `referral-stop`, referral next-action, and no copy-ready fallback. | `tests/br03-touchpoint-control.test.ts`, `tests/br03-touchpoint-matrix.test.ts` | `covered` |
| `BR01-WL-01` | Mixed combinations outside deterministic rows must remain guarded. | Assert unmatched mixed objectives remain guarded/slowdown and do not auto-route as deterministic continue. | `tests/br01-routing.test.ts` | `partially covered` |
| `BR01-WL-02` | Stored BR01 reason extraction seam (current rationale-suffix fallback) remains explicit until schema is settled. | Regression checks cover route-out reason-suffix parsing and safe fallback when stored suffix content is non-parseable. | `tests/br01-downstream.test.ts` | `covered` |
| `BR01-WL-03` | Route-out must remain distinct from ordinary referral. | Assert route-out control code and stop-state mapping stay distinct from referral-required code/path. | `tests/br01-routing.test.ts`, `tests/br01-downstream.test.ts` | `covered` |
| `BR02-WL-01` | Hand service remains guarded/review-led, not auto-sufficient. | Assert guarded slowdown posture for hand service across registry + consumer + downstream. | `tests/br02-registry-scaffold.test.ts`, `tests/br02-consumer.test.ts`, `tests/br02-downstream.test.ts` | `covered` |
| `BR02-WL-02` | Generic timing stale posture remains non-authoritative and hearing override outranks generic timing. | Assert stale warning/slowdown semantics plus override precedence in consumer/downstream outputs. | `tests/br02-registry-scaffold.test.ts`, `tests/br02-consumer.test.ts`, `tests/br02-downstream.test.ts` | `covered` |
| `BR02-WL-03` | 7-day step remains required prep structure, not universal deadline truth. | Assert explicit prep-step modeling and anti-universal-deadline posture. | `tests/br02-registry-scaffold.test.ts` | `covered` |
| `BR03-WL-01` | Live-confirmation cadence/authority remains guarded doctrine (not settled deterministic rule). | Keep registry/override-driven posture and add no-doctrine-hardening checks only after Product settles cadence/authority. | Current posture checks in `tests/br03-touchpoint-control.test.ts` | `needs product decision` |
| `BR03-WL-02` | Wrong-channel remains explicit control input, not portal-state inference automation. | Assert resolver behavior remains input-driven; no inferred portal automation path. | `tests/br03-touchpoint-control.test.ts`, `tests/br03-touchpoint-matrix.test.ts` | `partially covered` |
| `BR04-WL-01` | Retention duration/hold triggers/release authority/review cadence remain placeholder/config-driven. | Assert placeholder keys and no blanket lifecycle inference guard remain enforced. | `tests/br04-privacy-scaffold.test.ts`, `tests/evidence-audit.framework.test.ts` | `partially covered` |
| `BR04-WL-02` | Deletion and de-identification remain separate lifecycle actions. | Assert separate objects/states and placeholder method status for de-identification. | `tests/br04-privacy-scaffold.test.ts` | `covered` |
| `BR04-WL-03` | Ambiguous target defaults fail loudly until explicit source selection is provided. | Assert policy/scope ambiguity throws and explicit `policyKeys`/`accessScopeIds` resolves deterministically. | `tests/br04-consumer-lanes.test.ts`, `tests/br04-privacy-scaffold.test.ts` | `covered` |

## 7. Coverage/Mismatch Table

| ID | Area | Coverage classification | Evidence | Lane 3 mismatch note |
| --- | --- | --- | --- | --- |
| `L3-COV-01` | Deterministic core controls (BR01/BR02/BR03/BR04 + output/handoff boundaries) | `covered` | Core module and lane tests across `tests/br01*`, `tests/br02*`, `tests/br03*`, `tests/br04*`, `tests/output-*`, `tests/arrears-*` | No material mismatch found in this pass. |
| `L3-COV-02` | Hard-stop fail-safe inventory | `covered` | `tests/notice-readiness.result.test.ts`, `tests/arrears-shell.test.ts`, `tests/evidence-audit.framework.test.ts`, `tests/br02-*` | Hard-stop posture is explicit and inspectable. |
| `L3-COV-03` | Warning/slowdown/referral precedence and carry-forward controls | `covered` | `tests/notice-readiness.result.test.ts`, `tests/output-handoff.framework.test.ts`, `tests/br03-touchpoint-*.test.ts` | Control-family separation remains explicit. |
| `L3-COV-04` | Stale downgrade from BR03 to output/handoff/renderer surfaces | `covered` | `tests/br03-touchpoint-control.test.ts`, `tests/br03-touchpoint-matrix.test.ts` | Distinctions (`stale` vs `live-confirmation` vs `wrong-channel`) remain explicit. |
| `L3-COV-05` | BR02 stale-state downgrade propagated through downstream output/handoff surfaces | `covered` | Stale warning and stale slowdown downstream bridge scenarios are asserted in `tests/br02-downstream.test.ts`, with baseline semantics anchored in `tests/br02-registry-scaffold.test.ts` and `tests/br02-consumer.test.ts` | No mismatch found in this pass. |
| `L3-COV-06` | Consequential-surface trust-cue parity checks | `covered` | Matrix-level trust-cue parity assertions now exist in `tests/output-trust-cue-parity.test.ts`, with existing spot checks retained in `tests/output-trust-binding.test.ts` and `tests/output-handoff.framework.test.ts` | No mismatch found in this pass. |
| `L3-COV-07` | BR01 persisted-reason extraction seam stability | `covered` | Stored route-out reason-suffix parsing and guarded fallback seams are asserted in `tests/br01-downstream.test.ts` | No mismatch found in this pass. |
| `L3-COV-08` | BR03 live-confirmation cadence/authority doctrine | `needs product decision` | Parked posture explicitly keeps cadence/authority unresolved (`docs/specs/br03-parked-invariants.md`) | Do not convert to deterministic QA pass/fail until Product settles doctrine. |
| `L3-COV-09` | BR04 exact retention/hold/release doctrine | `needs product decision` | Placeholder posture remains explicit (`docs/architecture/br04-privacy-lifecycle-scaffold.md`) | Keep checks focused on placeholder integrity and no-blanket-inference guards. |

## 8. Review Hotspots For Lane 3 Follow-On

1. Expand mixed-interaction scenario coverage where BR02 stale controls and BR03 wrong-channel/live-confirmation controls are both active.
2. Add additional BR01 stored-rationale parsing edge tests (multi-code ordering variants and malformed non-terminal suffix variants) before any reason-field schema migration.
3. Preserve guarded doctrine as guarded: do not turn BR03 cadence/authority or BR04 retention durations into deterministic checks before Product decisions land.
