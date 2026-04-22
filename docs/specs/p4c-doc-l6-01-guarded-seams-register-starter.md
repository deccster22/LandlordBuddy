# P4C-DOC-L6-01 Guarded Seams Register Starter

Date: 2026-04-22
Task ID: P4C-DOC-L6-01

This register makes currently guarded seams explicit so they are not accidentally promoted to deterministic truth.

| Seam ID | Area | Current containment type | Current posture | Promotion trigger required | Primary anchors |
| --- | --- | --- | --- | --- | --- |
| `GS-01` | BR01 mixed-claim combinations outside current registry rows | `slowdown/review` | Explicit guarded fallback (`ARREARS_MIXED_OBJECTIVES_GUARDED`) | Product-approved expansion of BR01 registry/resolver families | `docs/specs/br01-parked-invariants.md`, `src/modules/br01/registry.ts` |
| `GS-02` | BR02 hand-service proof sufficiency | `review` | Hand service remains guarded and review-led | Settled doctrine for hand-service proof sufficiency | `docs/qa/non-blocked-acceptance-pack.md`, `src/modules/br02` |
| `GS-03` | BR02 evidence timing final doctrine and hearing variance detail | `warning/slowdown` | Dual-step timing plus override posture remains non-final | Settled timing doctrine for broader deterministic promotion | `docs/qa/non-blocked-acceptance-pack.md`, `tests/br02-downstream.test.ts` |
| `GS-04` | BR03 live-confirmation cadence and authority | `slowdown/referral support` | Registry/override-driven controls without final cadence doctrine | Product doctrine decision on cadence/authority rules | `docs/specs/br03-parked-invariants.md`, `docs/qa/p4b-cx-l3-05a-review-c-readiness-pack.md` |
| `GS-05` | BR03 wrong-channel detection beyond explicit control input | `referral-stop` | Wrong-channel is explicit reroute input, not automated portal-state inference | Approved expansion of wrong-channel source model | `docs/specs/br03-parked-invariants.md`, `src/modules/touchpoints/index.ts` |
| `GS-06` | BR04 retention durations, hold triggers, release authority, review cadence | `placeholder/config slot` | Source-driven refs are explicit; lifecycle doctrine remains unresolved | Approved BR04 doctrine package with deterministic policy values | `docs/architecture/br04-privacy-lifecycle-scaffold.md`, `src/modules/br04/policy-source.ts` |
| `GS-07` | Authenticated portal execution behavior | `hard boundary` | Handoff-only metadata and guidance; no product-side official execution | Explicit product scope change and doctrine approval | `docs/specs/non-blocked-dependency-map.md`, `src/modules/handoff` |
| `GS-08` | BR05 trigger confidence and willingness-to-pay truth | `measurement hypothesis` | Trigger-level hypotheses remain unresolved commercially | Beta evidence and decision threshold outcomes | `docs/specs/br05-parked-invariants.md`, `docs/specs/br05-beta-measurement-plan-artifact.md` |
| `GS-09` | Lane 3 high-cardinality mixed-state permutations beyond first-wave matrix | `qa expansion seam` | First-wave combinatorics covered; deeper permutations intentionally partial | Expanded matrix scope approved for additional consequential combinations | `docs/qa/p4b-cx-l3-05a-review-c-readiness-pack.md`, `docs/qa/p4b-cx-l3-04-timeline-combinatorial-regression-matrix.md` |

## Register Rule

No seam in this register should be treated as deterministic unless its promotion trigger is explicitly satisfied and recorded.
