# P4B-CX-L3-03 Stale Downgrade And Renderer Integrity Regression Pack

Date: 2026-04-21
Task ID: P4B-CX-L3-03

This pack hardens Lane 3 regression coverage for the highest-risk seams where stale downgrade, touchpoint controls, and consequential renderer/handoff states meet.

Guardrails preserved:

- preparation stays separate from official action
- handoff stays separate from execution
- deterministic outcomes stay separate from guarded/slowdown/referral controls
- stale/live-confirmation/wrong-channel distinctions stay explicit
- generic timing remains subordinate to hearing-specific instructions
- no portal mimicry, no filing/submission implication, no legal-advice behavior

## 1. Targeted Regression Scenarios

| Regression ID | Scenario | Module chain | Expected state integrity | Fail-safe expectation | Test anchor |
| --- | --- | --- | --- | --- | --- |
| `L3-RGX-01` | BR02 stale slowdown + BR03 wrong-channel reroute | `br02/index` -> `br02/consumer` -> `br02/downstream` + `touchpoints` -> `output`/`handoff` -> renderer | BR02 remains `REVIEW_REQUIRED`; wrong-channel remains explicit reroute signal | `referral-stop` present, no `copy-ready-facts`, next action remains refer-out and external execution stays not executed by product | `tests/l3-stale-renderer-regression.test.ts` (`stale slowdown plus wrong-channel`) |
| `L3-RGX-02` | BR02 stale warning + BR03 live-confirmation-required | `br02/index` -> `br02/consumer` -> `br02/downstream` + `touchpoints` -> `output`/`handoff` -> renderer | warning and slowdown families remain distinct (`GENERIC_EVIDENCE_TIMING_STALE_WARNING` vs `TOUCHPOINT_LIVE_CONFIRMATION_REQUIRED`) | guarded review posture remains explicit, no referral drift, no generic success fallback | `tests/l3-stale-renderer-regression.test.ts` (`stale warning plus live-confirmation`) |
| `L3-RGX-03` | Mixed downstream controls: BR02 stale slowdown + hearing override + BR03 live-confirmation + BR03 wrong-channel | `br02/index` -> `br02/consumer` -> `br02/downstream` + `touchpoints` -> `output`/`handoff` -> renderer | hearing-specific override remains controlling while stale and touchpoint controls stay visible | fail-closed referral stop remains explicit on consequential surfaces; no collapse to generic ready/success | `tests/l3-stale-renderer-regression.test.ts` (`mixed guarded families`) |

## 2. Renderer-State Integrity Checks In This Pack

1. `primaryState` does not drift to `READY_FOR_REVIEW` when stale/guarded/referral controls are active.
2. `handoff.posture` remains explicit (`GUARDED_REVIEW_REQUIRED` vs `REFERRAL_STOP`) under mixed controls.
3. `ownership.nextAction.kind` remains explicit (`COMPLETE_GUARDED_REVIEW` vs `REFER_OUTSIDE_STANDARD_PATH`) and never implies in-product official execution.
4. `ownership.officialExecution.required` remains fail-closed when referral-stop/wrong-channel reroute controls are present.
5. trust/review-state keys keep `live-confirmation-required` and `wrong-channel-reroute` distinctions explicit.

## 3. Stale-Downgrade Checks In This Pack

1. BR02 stale slowdown remains a slowdown carry-forward control (`STALE_GENERIC_TIMING_SURFACE`) when merged with BR03 wrong-channel reroute.
2. BR02 stale warning remains warning severity (`GENERIC_EVIDENCE_TIMING_STALE_WARNING`) and does not silently escalate to referral.
3. Hearing override precedence remains explicit (`controllingDeadlineSource: HEARING_OVERRIDE`) while stale-state caution remains visible.
4. Mixed stale/live/wrong-channel controls remain additive and explicit instead of collapsing into generic success posture.

## 4. Review C Readiness Note

Primary verification command:

- `npm.cmd run verify`

Focused review pass for this pack:

1. Run `tests/l3-stale-renderer-regression.test.ts` with the full suite to confirm no state drift across `prep-pack` and `official-handoff-guidance` outputs.
2. Confirm `L3-RGX-01` and `L3-RGX-03` keep high-stakes surfaces fail-closed (`referral-stop`, refer-out next action, no copy-ready fallback).
3. Confirm `L3-RGX-02` keeps stale warning and live-confirmation slowdown as separate control families without referral collapse.
4. Confirm hearing-specific timing precedence remains explicit in mixed control scenarios (`HEARING_OVERRIDE` control source still visible).
