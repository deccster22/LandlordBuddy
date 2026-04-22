# P4C-DOC-L6-01 First-Wave Module Map Refresh

Date: 2026-04-22
Task ID: P4C-DOC-L6-01

This note refreshes architecture/module discoverability to match current implemented first-wave reality. It is a map, not a readiness claim.

## Reality Snapshot

| Layer or module group | Implemented now | Primary code anchors | Current QA/spec anchors | Posture |
| --- | --- | --- | --- | --- |
| Domain separation spine | One-capture entities plus explicit `forumPath`/`outputMode`/`officialHandoff` separation and guarded insertion points | `src/domain/model.ts`, `src/domain/preparation.ts` | `docs/qa/non-blocked-acceptance-pack.md`, `tests/arrears-spine.test.ts` | Deterministic core with explicit guarded seams |
| Workflow shell | Hero states from intake to `NOTICE_READY_FOR_REVIEW`, with explicit stop/referral branches | `src/workflow/arrearsHeroWorkflow.ts` | `docs/qa/p4b-cx-l3-01-qa-rule-map.md` | Deterministic transitions plus guarded insertion gates |
| Arrears, timeline, notice-readiness | Arrears deterministic shell; timeline placeholder milestones; notice-readiness hard stops plus guarded review hooks | `src/modules/arrears`, `src/modules/timeline`, `src/modules/notice-readiness` | `docs/qa/non-blocked-acceptance-pack.md`, `tests/arrears-shell.test.ts`, `tests/notice-readiness.*.test.ts` | Mixed deterministic and guarded by design |
| BR01 routing | Objective-first resolver and downstream posture with split/referral/route-out distinction | `src/modules/br01`, `src/workflow/arrearsHeroWorkflow.ts` | `docs/specs/br01-parked-invariants.md`, `tests/br01-routing.test.ts`, `tests/br01-downstream.test.ts` | Parked stable, not finished |
| BR02 service and timing scaffold | Registry-first service and timing posture, consumer assessment threading, guarded hand-service posture | `src/modules/br02` | `docs/qa/non-blocked-acceptance-pack.md`, `tests/br02-*.test.ts` | Deterministic preferred paths plus guarded seams |
| BR03 touchpoint controls | Mirror/warn/defer/stale/live/wrong-channel/authenticated-handoff control families with precedence | `src/modules/touchpoints`, `src/modules/output`, `src/modules/handoff` | `docs/specs/br03-parked-invariants.md`, `tests/br03-touchpoint-*.test.ts` | Parked stable, not finished |
| BR04 privacy scaffold | Source-driven policy refs, hooks, and scoped controls across evidence/output/audit paths | `src/modules/br04`, `src/modules/evidence`, `src/modules/notice-draft`, `src/modules/output`, `src/modules/audit` | `docs/architecture/br04-privacy-lifecycle-scaffold.md`, `tests/br04-*.test.ts` | Guarded scaffold; lifecycle doctrine unresolved |
| Output, handoff, evidence, audit | Review/handoff packaging, trust bindings, local validation, audit records | `src/modules/output`, `src/modules/handoff`, `src/modules/evidence`, `src/modules/audit` | `docs/architecture/output-handoff-evidence-shells.md`, `tests/output-*.test.ts`, `tests/evidence-audit.framework.test.ts` | Prep-and-handoff only; no official execution |
| App shell | Placeholder app layer only | `src/app/README.md` | `docs/architecture/repo-boundaries.md` | Not a readiness surface yet |

## Lane 3 And Parked-Lane Cross-Links

- Lane 3 Review C entry point: `docs/qa/p4b-cx-l3-05a-review-c-readiness-pack.md`
- Lane 3 fidelity baseline: `docs/qa/p4b-cx-fid-01-fidelity-sweep.md`
- BR01 parked invariants: `docs/specs/br01-parked-invariants.md`
- BR03 parked invariants: `docs/specs/br03-parked-invariants.md`
- BR05 parked invariants: `docs/specs/br05-parked-invariants.md`

## What This Refresh Does Not Mean

- It does not claim UI-level readiness.
- It does not claim alpha readiness.
- It does not convert parked or guarded areas into settled doctrine.
