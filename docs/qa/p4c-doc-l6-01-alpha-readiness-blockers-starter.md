# P4C-DOC-L6-01 Alpha-Readiness Blockers Starter

Date: 2026-04-22
Task ID: P4C-DOC-L6-01

This note is an honesty artifact for pre-alpha posture.
It does not mark internal 5A alpha prep as active.

## Current Blockers (Starter Register)

| Blocker ID | Blocker | Why it blocks alpha-readiness signaling | Current evidence anchors | Unblock signal |
| --- | --- | --- | --- | --- |
| `ALPHA-B01` | Consequential rendered-surface inspection is still required | Lane 3 QA packs are evidence packs and do not replace direct UI/surface inspection | `docs/qa/p4b-cx-l3-05a-review-c-readiness-pack.md` | Completed screen-level review pass with explicit sign-off criteria |
| `ALPHA-B02` | App layer is still placeholder-only | Current runtime app shell is reserved and does not yet provide full consequential screen implementation surface | `src/app/README.md`, `docs/architecture/repo-boundaries.md` | Implemented thin app surface with preserved semantic fences |
| `ALPHA-B03` | Guarded doctrine remains intentionally unresolved | BR03 cadence/authority and BR04 retention lifecycle doctrine are explicitly parked/guarded | `docs/specs/br03-parked-invariants.md`, `docs/architecture/br04-privacy-lifecycle-scaffold.md` | Product-approved doctrine extraction and deterministic adoption scope |
| `ALPHA-B04` | Parked lanes are stable, not finished | BR01/BR03/BR05 parked notes explicitly mark reactivation triggers | `docs/specs/br01-parked-invariants.md`, `docs/specs/br03-parked-invariants.md`, `docs/specs/br05-parked-invariants.md` | Trigger-driven reactivation decisions where required |
| `ALPHA-B05` | Scenario depth is intentionally first-wave bounded | Higher-cardinality mixed permutations remain a listed follow-on seam | `docs/qa/p4b-cx-l3-05a-review-c-readiness-pack.md` | Approved expansion of permutation matrix coverage |
| `ALPHA-B06` | Trust-surface checklist is starter-only | Trust checklist structure exists, but row-by-row rendered-surface checks are not complete | `docs/qa/p4c-doc-l6-01-trust-surface-checklist-starter.md` | Checklist rows completed with explicit review notes |

## Honesty Rule

While any blocker above remains open, docs should avoid language that implies alpha readiness or settled doctrine.
