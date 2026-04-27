# P4C-DOC-L6-02 Guarded Seams Register Update

Date: 2026-04-23
Task ID: P4C-DOC-L6-02

This is a Lane 6 shadow update over the starter register in `docs/specs/p4c-doc-l6-01-guarded-seams-register-starter.md`.

## Carry-Forward Seams (Unchanged)

The following seams remain active and unchanged from L6-01:

- `GS-01` BR01 mixed-claim coverage limits
- `GS-02` BR02 hand-service proof sufficiency
- `GS-03` BR02 evidence timing final doctrine
- `GS-04` BR03 cadence/authority doctrine
- `GS-05` BR03 wrong-channel source model breadth
- `GS-06` BR04 retention/hold/release/review doctrine
- `GS-07` authenticated portal execution boundary
- `GS-08` BR05 trigger confidence and commercial truth
- `GS-09` high-cardinality mixed-state permutation depth

Primary anchor: `docs/specs/p4c-doc-l6-01-guarded-seams-register-starter.md`.

## New Watchpoint Seams From Shell/L2/App Contracts

| Seam ID | Area | Containment type | Current watchpoint | Promotion trigger required | Primary anchors |
| --- | --- | --- | --- | --- | --- |
| `GS-10` | Shell reminder surfaces (`REM-*`) | `warning/wording fence` | Reminder support is contract-defined but rendered interpretation risk remains | Review C comparative surface checks plus Lane 4 freeze-backed wording confidence | `docs/specs/p4c-cx-l2-01-first-wave-form-question-architecture-pack.md`, `docs/specs/focused-operating-shell-baseline.md` |
| `GS-11` | Bond visibility surfaces (`BOND-*`) | `factual visibility fence` | Bond visibility is explicit but could be over-read in UI execution | Rendered trust-cue evidence that preserves factual-only posture | `docs/specs/p4c-cx-l2-01-first-wave-form-question-architecture-pack.md`, `docs/architecture/current-product-posture.md` |
| `GS-12` | Export/document bundle surfaces (`DOC-*`) | `packaging-only fence` | Export/bundle contract exists but UI copy/placement can drift into finality implication | Review-approved screen-level boundary parity checks | `docs/specs/p4c-cx-app-01-thin-app-screen-form-contract-pack.md`, `docs/specs/focused-operating-shell-baseline.md` |
| `GS-13` | Launcher resume routing parity | `implementation watchpoint` | Contract mapping exists; real app routing parity not yet proven | Thin app execution with state-to-screen parity tests | `docs/specs/p4c-cx-app-01-thin-app-screen-form-contract-pack.md`, `docs/specs/p4c-cx-shell-01-focused-operating-shell-hero-workflow-mvp-structure-pack.md` |
| `GS-14` | Next-action context selection (`OUT-02`) | `boundary watchpoint` | Contract separates `IN_PRODUCT`, `OFFICIAL_EXTERNAL`, `REFERRAL_EXTERNAL`, but UI controls can blur | Rendered controls prove explicit class selection and CTA boundaries | `docs/specs/p4c-cx-l2-01-first-wave-form-question-architecture-pack.md`, `docs/specs/p4c-cx-app-01-thin-app-screen-form-contract-pack.md` |
| `GS-15` | Interruption-family overlay parity | `ui execution watchpoint` | Distinction is contract-defined but not yet proven in real rendered overlay behaviors | Review C comparative surface pass confirms family separation | `docs/specs/p4c-cx-app-01-thin-app-screen-form-contract-pack.md`, `docs/qa/p4b-cx-l3-05a-review-c-readiness-pack.md` |
| `GS-16` | Contract-layer confidence inflation | `readiness-language watchpoint` | Architecture contracts are stronger but can be mistaken for finished UI delivery | Explicit blocker closeout and rendered evidence before readiness language changes | `docs/qa/p4c-cx-app-01-compact-app-contract-status-pack.md`, `docs/qa/p4c-doc-l6-02-alpha-readiness-blockers-refresh.md` |
| `GS-17` | Review C hold dependency | `process watchpoint` | Lane 3 evidence exists, but comparative visual basis remains required | Review C hold cleared by comparative surface evidence | `docs/qa/p4b-cx-l3-05a-review-c-readiness-pack.md` |
| `GS-18` | Lane 4 direction freeze dependency | `directional watchpoint` | Lane 4 remains provisional and can affect trust-surface expression confidence | Research-backed Lane 4 freeze accepted | `docs/qa/p4c-mkt-l4-01-4c-d-status-pack.md`, `docs/specs/p4c-mkt-l4-01-first-wave-brand-visual-direction-pack.md` |

## Register Rule

No seam in this update should be promoted to deterministic or readiness-signaling status without explicit trigger satisfaction and recorded evidence.

## Post-Gate-A Alignment (2026-04-27)

Gate A accepted Review A as checkpoint-cleared with gates retained for current 4B checkpoint use.

Status alignment after that decision:

- BR04 checkpoint posture is upgraded to `cleared with gate` via addendum alignment, while `GS-06` remains guarded.
- BR02 payment-plan conservative default adoption remains held pending Product + Legal / Risks / Rules decision.
- BR03 cadence/authority (`GS-04`) and wrong-channel breadth (`GS-05`) remain guarded.
- `GS-16`, `GS-17`, and `GS-18` remain open watchpoints; Review A checkpoint clearance does not close readiness holds.

Lane 6 sync anchor: `docs/qa/p4b-repo-doc-03-lane-6-gate-a-sync-note.md`.
