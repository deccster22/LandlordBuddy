# P4C-DOC-L6-01 Acceptance And Scenario Cross-Link Checkpoint

Date: 2026-04-22
Task ID: P4C-DOC-L6-01

This checkpoint refreshes acceptance traceability and first-wave QA scenario discoverability without broad rewrites.

## 1. Acceptance-Criteria Refresh Checkpoint

| Task acceptance criterion | Checkpoint result | Evidence anchor |
| --- | --- | --- |
| Docs/QA layer better reflects real product shape | `started` | `docs/qa/p4c-doc-l6-01-lane-6-shadow-foundation-pack.md`, `docs/architecture/p4c-doc-l6-01-first-wave-module-map-refresh.md` |
| Alpha blockers are named, not hand-waved | `started` | `docs/qa/p4c-doc-l6-01-alpha-readiness-blockers-starter.md` |
| Guarded seams are explicit | `started` | `docs/specs/p4c-doc-l6-01-guarded-seams-register-starter.md` |
| Parked does not get mistaken for finished | `started` | `docs/specs/br01-parked-invariants.md`, `docs/specs/br03-parked-invariants.md`, `docs/specs/br05-parked-invariants.md` |
| No semantic fences are weakened | `preserved` | Docs-only change; no runtime/semantic-control edits |

Result posture: this is a shadow-foundation checkpoint, not completion of alpha-readiness gates.

## 2. First-Wave QA Scenario Pack Cross-Link Checkpoint

Read in this order for Lane 3 first-wave inspection:

1. `docs/qa/p4b-cx-l3-05a-review-c-readiness-pack.md`
2. `docs/qa/p4b-cx-l3-01-qa-rule-map.md`
3. `docs/qa/p4b-cx-l3-02-scenario-library-and-state-matrix.md`
4. `docs/qa/p4b-cx-l3-03-stale-renderer-regression-pack.md`
5. `docs/qa/p4b-cx-l3-04-timeline-combinatorial-regression-matrix.md`

Supporting checkpoints:

- `docs/qa/non-blocked-acceptance-pack.md`
- `docs/qa/p4b-cx-fid-01-fidelity-sweep.md`
- `docs/qa/p4c-cx-l1-01-4c-a-status-pack.md`

## 3. Code-Test Trace Anchors (First-Wave)

| Focus area | Regression anchors |
| --- | --- |
| Renderer-state and trust-surface posture | `tests/output-renderer-state.test.ts`, `tests/output-trust-binding.test.ts`, `tests/output-trust-cue-parity.test.ts` |
| Stale/live/wrong-channel combinatorics | `tests/l3-stale-renderer-regression.test.ts`, `tests/l3-timeline-combinatorial-regression.test.ts` |
| BR01 split/referral/route-out posture | `tests/br01-routing.test.ts`, `tests/br01-downstream.test.ts` |
| BR02 downstream and registry posture | `tests/br02-consumer.test.ts`, `tests/br02-registry-scaffold.test.ts`, `tests/br02-downstream.test.ts` |
| BR03 touchpoint control precedence | `tests/br03-touchpoint-control.test.ts`, `tests/br03-touchpoint-matrix.test.ts` |
| BR04 privacy scaffold controls | `tests/br04-privacy-scaffold.test.ts`, `tests/br04-consumer-lanes.test.ts`, `tests/evidence-audit.framework.test.ts` |

## 4. Honest Gap Reminder

The cross-links above provide first-wave QA evidence packaging. They do not replace direct consequential-surface inspection in rendered interfaces.
