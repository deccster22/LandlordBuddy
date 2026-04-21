# P4B-CX-L3-02 First-Wave Scenario Library And Expected-State Matrix

Date: 2026-04-21
Task ID: P4B-CX-L3-02

This pack converts the Lane 3 rule map into a first-wave scenario library for normal, edge, and red-flag behavior.

Follow-on regression hardening pack: `docs/qa/p4b-cx-l3-03-stale-renderer-regression-pack.md`.

Guardrails preserved:

- preparation remains separate from official action
- handoff remains separate from execution
- deterministic behavior remains separate from guarded/slowdown/referral behavior
- stale/live/wrong-channel distinctions remain explicit
- no portal mimicry, no filing/submission implication, no legal-advice behavior

Priority order for this wave:

1. BR02 stale downgrade at downstream surfaces
2. BR01 persisted reason-extraction seam
3. Trust-cue parity matrix across consequential surfaces

## 1. First-Wave Scenario Library

| Scenario ID | Class | Trigger/setup | Module chain | Expected system state(s) | Expected fail-safe outcome | Evidence anchor |
| --- | --- | --- | --- | --- | --- | --- |
| `L3-SCN-01` | normal | Threshold met, registered-post service event, no stale inputs, no guarded issues | `br02/consumer` -> `br02/downstream` -> `output`/`handoff` | BR02 `NEXT_STEP_READY`; downstream `READY_FOR_REVIEW`; renderer does not imply product execution | Continue with review/handoff posture only, no official submission implication | `tests/br02-consumer.test.ts`, `tests/br02-downstream.test.ts`, `tests/output-renderer-state.test.ts` |
| `L3-SCN-02` | edge | Notice-readiness warning-only (`DOCUMENTARY_EVIDENCE_GUARDED`) | `notice-readiness` -> `output` | Notice outcome remains `READY_FOR_REVIEW`; warning remains visible | Warning does not silently disappear; no false referral/hard-stop escalation | `tests/notice-readiness.result.test.ts`, `tests/output-handoff.framework.test.ts` |
| `L3-SCN-03` | red-flag | Missing mandatory notice field (e.g. arrears amount) | `notice-readiness` -> `output`/`handoff` | Notice outcome `BLOCKED`; review/handoff state `BLOCKED_UPSTREAM` | Hard-stop block, no copy-ready fallback | `tests/notice-readiness.result.test.ts`, `tests/output-handoff.framework.test.ts` |
| `L3-SCN-04` | stale/live control (priority 1) | BR02 evidence timing state `STALE_SLOWDOWN` through downstream bridge | `br02/index` -> `br02/consumer` -> `br02/downstream` -> `output`/`handoff` | BR02 gate `REVIEW_LED_CAUTION`; workflow gate `ARREARS_FACTS_GUARDED`; carry-forward `STALE_GENERIC_TIMING_SURFACE` as slowdown | Slowdown/review required, no referral-stop, no copy-ready fallback | `tests/br02-downstream.test.ts` (stale slowdown scenario) |
| `L3-SCN-05` | stale/live control (priority 1) | BR02 evidence timing state `STALE_WARNING` through downstream bridge | `br02/index` -> `br02/consumer` -> `br02/downstream` -> `output`/`handoff` | BR02 gate `NEEDS_REVIEW`; workflow gate `NOTICE_DRAFTING_GUARDED`; carry-forward `GENERIC_EVIDENCE_TIMING_STALE_WARNING` as warning | Warning-led review posture stays distinct from slowdown escalation; no referral-stop | `tests/br02-downstream.test.ts` (stale warning scenario) |
| `L3-SCN-06` | mixed/referral/route-out (priority 2) | Stored BR01 rationale includes route-out reason suffix with no referral flag artifact | `br01/downstream` (stored artifacts) | `routeOutStopRequired: true`; `referralStopRequired: false`; readiness `REFER_OUT`; control code remains route-out specific | Route-out remains explicit and distinct from ordinary referral | `tests/br01-downstream.test.ts` (reason suffix route-out scenario) |
| `L3-SCN-07` | mixed/referral seam (priority 2) | Stored BR01 rationale has non-parseable empty reason suffix | `br01/downstream` (stored artifacts) | Fallback control code `BR01_GUARDED_REVIEW_REQUIRED`; readiness `REVIEW_REQUIRED`; no crash | Safe guarded fallback instead of silent pass or brittle failure | `tests/br01-downstream.test.ts` (reason suffix fallback scenario) |
| `L3-SCN-08` | stale/live control | BR03 wrong-channel override | `touchpoints` -> `output`/`handoff` -> renderer/trust | Wrong-channel reroute suppresses mirror allowances; downstream includes `referral-stop`; referred-out next action | Stop + explain + reroute posture; no copy-ready fallback | `tests/br03-touchpoint-control.test.ts`, `tests/br03-touchpoint-matrix.test.ts` |
| `L3-SCN-09` | stale/live control | BR03 live-confirmation-required override | `touchpoints` -> `handoff`/`renderer` | `TOUCHPOINT_LIVE_CONFIRMATION_REQUIRED` slowdown remains distinct from stale warning | Slowdown review posture without collapsing to stale or referral | `tests/br03-touchpoint-control.test.ts`, `tests/br03-touchpoint-matrix.test.ts` |
| `L3-SCN-10` | mixed-claim | BR01 split-matter objective combination | `br01/resolver` -> workflow -> downstream output/handoff | Split-matter remains explicit, review-led, and non-referral unless referral conditions also apply | No flattening into generic caution or deterministic continue | `tests/br01-routing.test.ts`, `tests/br01-downstream.test.ts` |
| `L3-SCN-11` | privacy/hold/lifecycle | BR04 ambiguous target defaults without explicit selection | `br04/index` + consumer lanes (`notice-draft`, `audit`) | Source-driven attachment fails loudly until explicit `policyKeys`/`accessScopeIds` are supplied | Fail-safe loud failure; no silent broadening of privacy controls | `tests/br04-consumer-lanes.test.ts`, `tests/br04-privacy-scaffold.test.ts` |
| `L3-SCN-12` | privacy/hold/lifecycle | Scoped hold active with deletion/de-identification requests | `br04/index` | Hold scope stays explicit; deletion and de-identification remain separate lifecycle actions | No blanket hold/delete inference; no lifecycle finality overclaim | `tests/br04-privacy-scaffold.test.ts` |
| `L3-SCN-13` | trust-cue parity (priority 3) | Consequential blocked/guarded/readiness surfaces | `output/trustBindings` | Surface trust-cue keys and package trust-cue keys both include required cue for each consequential surface | Trust-cue-bound states remain explicitly cue-bound | `tests/output-trust-cue-parity.test.ts` |
| `L3-SCN-14` | trust-cue parity (priority 3) | Consequential referral/wrong-channel/handoff boundary surfaces | `output/trustBindings` + handoff state derivation | Referral and boundary surfaces keep required trust cues and no finality implication | Referral and external-handoff posture remains explicit and bounded | `tests/output-trust-cue-parity.test.ts`, `tests/output-trust-binding.test.ts` |

## 2. Expected-State Matrix

State matrix focuses on first-wave scenarios that drive consequential branching.

| Scenario ID | Notice-readiness outcome | BR02 downstream status | BR01 downstream posture | Review/handoff posture | Renderer primary state | Required consequential surfaces |
| --- | --- | --- | --- | --- | --- | --- |
| `L3-SCN-01` | `READY_FOR_REVIEW` (or absent when BR02-only bridge is used) | `NEXT_STEP_READY` | deterministic/no BR01 carry-forward | `EXTERNAL_NEXT_ACTION_PENDING` when handoff stage is ready | `READY_FOR_REVIEW` or derived equivalent | `readiness-summary`, `copy-ready-facts` (when allowed), boundary/trust cues intact |
| `L3-SCN-03` | `BLOCKED` | n/a | n/a | `BLOCKED_UPSTREAM` | `BLOCKED` | `blocker-summary`, `review-hold-points`, `sequencing-blocked` (if present), no `copy-ready-facts` |
| `L3-SCN-04` | downstream `REVIEW_REQUIRED` | `REVIEW_LED_CAUTION` | n/a | `GUARDED_REVIEW_REQUIRED` | `REVIEW_REQUIRED` | `readiness-summary`, `review-hold-points`, `guarded-review-flags`, no `referral-stop` |
| `L3-SCN-05` | downstream `REVIEW_REQUIRED` | `NEEDS_REVIEW` | n/a | `GUARDED_REVIEW_REQUIRED` | `REVIEW_REQUIRED` | `readiness-summary`, `review-hold-points`, `guarded-review-flags`, no `referral-stop` |
| `L3-SCN-06` | downstream `REFER_OUT` | n/a | `routeOutStopRequired: true` | `REFERRAL_STOP` | `REFER_OUT` | `referral-stop`, route-out/referral trust cues, no ordinary copy-ready fallback |
| `L3-SCN-07` | downstream `REVIEW_REQUIRED` | n/a | guarded fallback (`BR01_GUARDED_REVIEW_REQUIRED`) | `GUARDED_REVIEW_REQUIRED` | `REVIEW_REQUIRED` | `guarded-review-flags`, no false deterministic progression |
| `L3-SCN-08` | downstream `REFER_OUT` | n/a | n/a | `REFERRAL_STOP` | `REFER_OUT` | `wrong-channel-reroute`, `referral-stop`, no `copy-ready-facts` |
| `L3-SCN-09` | downstream `REVIEW_REQUIRED` | n/a | n/a | `GUARDED_REVIEW_REQUIRED` | `REVIEW_REQUIRED` | `live-confirmation-required`, slowdown/review cues, no referral-stop by default |

## 3. Module And State Mapping

| Module | Produces | Consumed by | Scenario IDs |
| --- | --- | --- | --- |
| `src/modules/br02/consumer.ts` | BR02 issue severities, disposition, stale warning/slowdown classification | `src/modules/br02/downstream.ts` | `L3-SCN-01`, `L3-SCN-04`, `L3-SCN-05` |
| `src/modules/br02/downstream.ts` | BR02 downstream status -> readiness/workflow mapping + carry-forward controls | `src/modules/output/index.ts`, `src/modules/handoff/index.ts`, workflow gate | `L3-SCN-04`, `L3-SCN-05` |
| `src/modules/br01/downstream.ts` | Stored-artifact route-out/referral/split/guarded posture (incl. reason extraction seam) | output/handoff downstream selection | `L3-SCN-06`, `L3-SCN-07`, `L3-SCN-10` |
| `src/modules/touchpoints/index.ts` | stale/live/wrong-channel/authenticated control outputs and carry-forward controls | output/handoff surface key derivation + trust mapping | `L3-SCN-08`, `L3-SCN-09` |
| `src/modules/output/index.ts` | consequential section/block keys + copy-ready gating + merged controls | trust binding + renderer state | `L3-SCN-01` to `L3-SCN-10` |
| `src/modules/handoff/index.ts` | handoff guidance block keys and boundary posture | trust binding + renderer state | `L3-SCN-04`, `L3-SCN-05`, `L3-SCN-06`, `L3-SCN-08`, `L3-SCN-09` |
| `src/modules/output/trustBindings.ts` | surface-level trust cues/boundary keys/review-state keys | renderer and downstream trust surfaces | `L3-SCN-13`, `L3-SCN-14` |
| `src/modules/output/rendererStateAdapter.ts` | readiness/sequencing/handoff/ownership/progression integrity state | output/handoff package shells | `L3-SCN-01`, `L3-SCN-03`, `L3-SCN-04`, `L3-SCN-05`, `L3-SCN-06`, `L3-SCN-08`, `L3-SCN-09` |
| `src/modules/br04/index.ts` and consumer lanes | source-driven privacy hook attachment + ambiguity fail-loud controls | notice-draft, audit, evidence, output record lanes | `L3-SCN-11`, `L3-SCN-12` |

## 4. Review C Support Pack

Use this as the first-wave Review C execution bundle.

### 4.1 What to run

- Full gate: `npm.cmd run verify`
- Priority hotspot focus:
  - `tests/br02-downstream.test.ts`
  - `tests/br01-downstream.test.ts`
  - `tests/output-trust-cue-parity.test.ts`

### 4.2 What to inspect in Review C

1. `L3-SCN-04` and `L3-SCN-05` together:
   - confirm stale slowdown vs stale warning are behaviorally distinct downstream
   - confirm both remain non-referral unless other referral controls are present
2. `L3-SCN-06` and `L3-SCN-07` together:
   - confirm stored BR01 route-out reason extraction remains explicit
   - confirm malformed/empty stored reason suffix falls back safely and does not silently pass
3. `L3-SCN-13` and `L3-SCN-14`:
   - confirm trust-cue parity across consequential blocked/guarded/referral/handoff surfaces
   - confirm required cues remain present at both surface and package trust levels

### 4.3 Review-ready evidence references

- Lane 3 rule baseline: `docs/qa/p4b-cx-l3-01-qa-rule-map.md`
- This scenario/state matrix: `docs/qa/p4b-cx-l3-02-scenario-library-and-state-matrix.md`
- Focused stale/renderer regression hardening: `docs/qa/p4b-cx-l3-03-stale-renderer-regression-pack.md`
- Existing acceptance/control anchors:
  - `docs/qa/control-inventory.md`
  - `docs/qa/non-blocked-acceptance-pack.md`
