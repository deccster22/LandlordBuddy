# P4C-DOC-L6-01 Trust-Surface Checklist Starter

Date: 2026-04-22
Task ID: P4C-DOC-L6-01

Purpose: starter checklist for consequential trust surfaces tied to currently implemented modules.
Status meaning: `starter` means checklist structure exists; it is not a claim that screen-level review is complete.

| Module or surface family | Required trust cue posture | Must-not-imply boundary | Current anchor(s) | Checklist status |
| --- | --- | --- | --- | --- |
| Notice-readiness outcomes (`READY_FOR_REVIEW`, `BLOCKED`, `REVIEW_REQUIRED`, `REFER_OUT`) | Readiness remains local prep state; blockers/review reasons visible | No filing/submission/official sufficiency implication | `src/modules/notice-readiness`, `docs/qa/non-blocked-acceptance-pack.md` | `starter` |
| Output package review surfaces | Boundary and trust keys remain explicit and separate from workflow status | No official execution implied by package generation | `src/modules/output`, `tests/output-trust-binding.test.ts`, `tests/output-renderer-state.test.ts` | `starter` |
| Official handoff surfaces | External action owner remains explicit; handoff is visibly outside product | No proxy filing, no product submission, no portal mimicry | `src/modules/handoff`, `docs/architecture/output-handoff-evidence-shells.md` | `starter` |
| BR03 stale/live/wrong-channel surfaces | Stale/live/wrong-channel controls remain distinct families with downgrade/reroute behavior | No collapse into generic warning or ordinary handoff | `src/modules/touchpoints`, `tests/br03-touchpoint-matrix.test.ts` | `starter` |
| BR01 split/referral/route-out controls | Mixed matters remain explicit as split/review/referral/route-out outcomes | No flattening into one generic "continue carefully" state | `src/modules/br01`, `docs/specs/br01-parked-invariants.md` | `starter` |
| BR02 service and timing controls | Registered-post preference, email-consent proof requirement, guarded hand service remain visible | Upload/recorded proof must not imply legal sufficiency | `src/modules/br02`, `tests/br02-consumer.test.ts` | `starter` |
| Evidence local validation and upload posture | `LOCAL_VALIDATION_READY` remains local-only validation status | No official acceptance/evidentiary finality implication | `src/modules/evidence`, `tests/evidence-audit.framework.test.ts` | `starter` |
| BR04 privacy hooks and lifecycle scaffolds | Scoped policy/hold/access structures remain explicit and reviewable | No universal keep/delete, no final lifecycle doctrine implication | `src/modules/br04`, `docs/architecture/br04-privacy-lifecycle-scaffold.md` | `starter` |

## Starter Use Rule

Before any alpha-readiness language is used, each row above needs a direct rendered-surface review pass that checks trust cue placement, CTA hierarchy, and warning behavior under mixed states.
