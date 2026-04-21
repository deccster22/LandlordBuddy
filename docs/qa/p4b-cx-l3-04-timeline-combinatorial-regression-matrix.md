# P4B-CX-L3-04 Timeline-Blocked Combinatorial Regression Matrix

Date: 2026-04-21
Task ID: P4B-CX-L3-04

This pass extends Lane 3 regression coverage to timeline-blocked sequencing collisions with mixed BR02 and BR03 control families.

Guardrails preserved:

- timeline-blocked sequencing remains explicit and separate from readiness outcome semantics
- stale warning and stale slowdown remain distinct BR02 control families
- hearing-specific override remains the controlling timing source when attached
- wrong-channel remains stop/explain/reroute and does not degrade into ordinary handoff
- live-confirmation-required remains distinct from stale touchpoint posture
- no portal mimicry, no filing/submission implication, no legal-advice behavior

## 1. Combinatorial Matrix

| Matrix ID | Combination under test | Expected fail-safe result | Coverage anchor |
| --- | --- | --- | --- |
| `L3-CMB-01` | timeline-blocked + BR02 `STALE_SLOWDOWN` + BR03 wrong-channel reroute | `sequencing-blocked` stays visible, `referral-stop` wins, no `copy-ready-facts`, refer-out next action remains explicit | `tests/l3-timeline-combinatorial-regression.test.ts` |
| `L3-CMB-02` | timeline-blocked + BR02 `STALE_WARNING` + BR03 live-confirmation-required | warning vs slowdown distinction remains explicit, no referral drift, blocked sequencing remains visible | `tests/l3-timeline-combinatorial-regression.test.ts` |
| `L3-CMB-03` | timeline-blocked + BR02 hearing override + BR03 wrong-channel reroute | hearing override remains controlling timing source, wrong-channel fail-closed reroute still wins | `tests/l3-timeline-combinatorial-regression.test.ts` |
| `L3-CMB-04` | timeline-blocked + BR02 hearing override + BR03 live-confirmation-required | hearing override remains controlling timing source, live-confirmation remains slowdown/review signal, no referral-stop drift | `tests/l3-timeline-combinatorial-regression.test.ts` |
| `L3-CMB-05` | timeline-blocked + mixed stale/live/wrong-channel collision | stale/live/wrong-channel remain additive and explicit; wrong-channel keeps referral-stop fail-closed posture | `tests/l3-timeline-combinatorial-regression.test.ts` |

## 2. Renderer And Handoff Integrity Assertions

1. `primaryState` remains `REVIEW_REQUIRED` in these mixed-collision paths and does not drift to `READY_FOR_REVIEW`.
2. `progression.blockedBySequencing` remains `true` for all matrix entries.
3. Wrong-channel entries preserve `REFERRAL_STOP` + `REFER_OUTSIDE_STANDARD_PATH` and keep `officialExecution.required` fail-closed.
4. Non-wrong-channel entries preserve blocked sequencing posture (`BLOCKED_UPSTREAM` + `RESOLVE_BLOCKER`) without referral drift.
5. `NOT_EXECUTED_BY_PRODUCT` remains explicit under all combinations.

## 3. Review C Readiness Note

Primary verification command:

- `npm.cmd run verify`

Focused review points:

1. Confirm timeline-blocked sequencing remains visible in both prep-pack and handoff guidance (`sequencing-blocked`, `dependency-hold-points`).
2. Confirm hearing-override combinations keep `controllingDeadlineSource: HEARING_OVERRIDE`.
3. Confirm wrong-channel combinations still fail closed to referral-stop under sequencing collisions.
4. Confirm live-confirmation combinations do not collapse into touchpoint-stale or ordinary handoff.
